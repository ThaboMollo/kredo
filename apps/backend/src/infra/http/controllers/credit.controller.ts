import { Controller, Post, Body, Headers, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LedgerRepository } from '../../database/ledger.repository';
import { LedgerTransaction, EntryDirection, AccountType } from '../../../domain/ledger/ledger-transaction';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('credit')
@Controller('api/v1/credit')
export class CreditController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerRepo: LedgerRepository,
  ) {}

  @Post('affordability')
  @ApiOperation({ summary: 'Calculate disposable income and approve a revolving credit limit' })
  async runAffordability(
    @Body() dto: { consumerId: string; grossIncome: number; declaredExpenses: number; bureauObligations: number }
  ) {
    const consumer = await this.prisma.consumer.findUnique({
      where: { id: dto.consumerId },
      include: { subscriptions: true },
    });
    if (!consumer) {
      throw new NotFoundException('Consumer profile not found.');
    }

    const disposableIncome = dto.grossIncome - dto.declaredExpenses - dto.bureauObligations;
    if (disposableIncome <= 0) {
      throw new BadRequestException('Disposable income must be greater than zero to qualify for credit.');
    }

    // Determine limit: up to half of disposable income, capped by subscription tier
    const activeSub = consumer.subscriptions.find((s) => s.status === 'ACTIVE');
    const isPremium = activeSub?.planCode === 'STUDENT_PREMIUM';
    const planCap = isPremium ? 350000 : 150000; // R3 500 vs R1 500

    const rawLimit = Math.floor(disposableIncome / 2);
    const approvedLimit = Math.min(rawLimit, planCap);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create affordability assessment log
      const assessment = await tx.affordabilityAssessment.create({
        data: {
          consumerId: dto.consumerId,
          grossIncome: BigInt(dto.grossIncome),
          declaredExpenses: BigInt(dto.declaredExpenses),
          bureauObligations: BigInt(dto.bureauObligations),
          disposableIncome: BigInt(disposableIncome),
          approvedLimit: BigInt(approvedLimit),
        },
      });

      // 2. Create Draft Credit Agreement
      const agreement = await tx.creditAgreement.create({
        data: {
          consumerId: dto.consumerId,
          quotePdfUrl: `https://storage.kalahari.co.za/quotes/quote-${assessment.id}.pdf`,
          agreementPdfUrl: `https://storage.kalahari.co.za/agreements/contract-${assessment.id}.pdf`,
          status: 'DRAFT',
        },
      });

      return {
        assessmentId: assessment.id,
        agreementId: agreement.id,
        approvedLimit,
        quotePdfUrl: agreement.quotePdfUrl,
        agreementPdfUrl: agreement.agreementPdfUrl,
      };
    });
  }

  @Post('sign')
  @ApiOperation({ summary: 'E-sign the credit agreement with OTP authentication' })
  async signAgreement(
    @Body() dto: { consumerId: string; agreementId: string; otpCode: string }
  ) {
    if (dto.otpCode !== '123456') {
      throw new BadRequestException('Invalid OTP signature token. Use 123456.');
    }

    const agreement = await this.prisma.creditAgreement.findUnique({
      where: { id: dto.agreementId },
      include: { consumer: { include: { affordabilityAssessments: { orderBy: { createdAt: 'desc' }, take: 1 } } } },
    });

    if (!agreement) {
      throw new NotFoundException('Credit agreement not found.');
    }

    const latestAssessment = agreement.consumer.affordabilityAssessments[0];
    if (!latestAssessment) {
      throw new BadRequestException('No affordability assessment found for this profile.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update agreement to signed
      const signedAgreement = await tx.creditAgreement.update({
        where: { id: dto.agreementId },
        data: {
          status: 'SIGNED',
          signedAt: new Date(),
        },
      });

      // 2. Provision or update revolving credit facility
      const facility = await tx.creditFacility.upsert({
        where: { consumerId: dto.consumerId },
        create: {
          consumerId: dto.consumerId,
          totalLimit: latestAssessment.approvedLimit,
          utilisedLimit: 0n,
          status: 'ACTIVE',
        },
        update: {
          totalLimit: latestAssessment.approvedLimit,
          status: 'ACTIVE',
        },
      });

      return {
        agreementId: signedAgreement.id,
        status: signedAgreement.status,
        facility: {
          id: facility.id,
          totalLimit: Number(facility.totalLimit),
          available: Number(facility.totalLimit - facility.utilisedLimit),
        },
      };
    });
  }

  @Post('drawdowns')
  @ApiOperation({ summary: 'Draw down closed-loop retail voucher against limit' })
  async createDrawdown(
    @Body() dto: { consumerId: string; merchantName: string; amount: number },
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Header Idempotency-Key is mandatory.');
    }

    const facility = await this.prisma.creditFacility.findUnique({
      where: { consumerId: dto.consumerId },
    });

    if (!facility || facility.status !== 'ACTIVE') {
      throw new BadRequestException('No active credit facility found.');
    }

    const amountBig = BigInt(dto.amount);
    const available = facility.totalLimit - facility.utilisedLimit;

    if (amountBig > available) {
      throw new BadRequestException('Insufficient available credit limit.');
    }

    // 1. Fetch or seed ledger accounts
    let receivableAccount = await this.ledgerRepo.findAccountByCode('1000-RECEIVABLES');
    if (!receivableAccount) {
      receivableAccount = await this.ledgerRepo.createAccount('1000-RECEIVABLES', 'Consumer Receivables', AccountType.ASSET);
    }

    let liabilityAccount = await this.ledgerRepo.findAccountByCode('2000-VOUCHER-LIABILITY');
    if (!liabilityAccount) {
      liabilityAccount = await this.ledgerRepo.createAccount('2000-VOUCHER-LIABILITY', 'Voucher Liability', AccountType.LIABILITY);
    }

    // 2. Build Double-Entry Ledger Transaction
    // Drawdown details:
    // DR Consumer Receivables (receivables increases)
    // CR Voucher Liability (obligation to pay retailer increases)
    const transaction = new LedgerTransaction(
      idempotencyKey,
      `Voucher drawdown for ${dto.merchantName}`,
      [
        {
          accountId: receivableAccount.id,
          amount: amountBig,
          direction: EntryDirection.DEBIT,
        },
        {
          accountId: liabilityAccount.id,
          amount: amountBig,
          direction: EntryDirection.CREDIT,
        },
      ]
    );

    return this.prisma.$transaction(async (tx) => {
      // Check existing ledger transaction by idempotency key
      const existingLedgerTx = await tx.ledgerTransaction.findUnique({
        where: { idempotencyKey },
      });

      if (existingLedgerTx) {
        const voucher = await tx.voucher.findFirst({
          where: { code: { startsWith: `KRE-${dto.merchantName.substring(0,3).toUpperCase()}` } }, // Find matching
        });
        return { message: 'Idempotent response', voucher };
      }

      // Execute Ledger write
      await this.ledgerRepo.createTransaction(transaction);

      // Increment utilized limit
      await tx.creditFacility.update({
        where: { consumerId: dto.consumerId },
        data: { utilisedLimit: { increment: amountBig } },
      });

      // Generate Voucher details
      const voucherCode = `KRE-${dto.merchantName.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const voucher = await tx.voucher.create({
        data: {
          consumerId: dto.consumerId,
          merchantName: dto.merchantName,
          amount: amountBig,
          code: voucherCode,
          qrValue: `https://kredo.kalahari.co.za/scan/${voucherCode}`,
          status: 'ISSUED',
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      return {
        success: true,
        voucher,
        available: Number(facility.totalLimit - (facility.utilisedLimit + amountBig)),
      };
    });
  }

  @Post('drawdowns/redeem')
  @ApiOperation({ summary: 'Simulate retailer POS voucher redemption' })
  async redeemVoucher(@Body() body: { voucherCode: string }) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { code: body.voucherCode },
    });

    if (!voucher) {
      throw new NotFoundException('Voucher code not found.');
    }

    if (voucher.status !== 'ISSUED') {
      throw new BadRequestException(`Voucher cannot be redeemed. Current status: ${voucher.status}`);
    }

    // 1. Fetch or seed ledger accounts
    let liabilityAccount = await this.ledgerRepo.findAccountByCode('2000-VOUCHER-LIABILITY');
    if (!liabilityAccount) {
      liabilityAccount = await this.ledgerRepo.createAccount('2000-VOUCHER-LIABILITY', 'Voucher Liability', AccountType.LIABILITY);
    }

    let cashAccount = await this.ledgerRepo.findAccountByCode('1100-CASH-CLEARING');
    if (!cashAccount) {
      cashAccount = await this.ledgerRepo.createAccount('1100-CASH-CLEARING', 'Cash Clearing Account', AccountType.ASSET);
    }

    // 2. Build Double-Entry Ledger Transaction
    // Voucher Settled at POS:
    // DR Voucher Liability (decrease liability)
    // CR Cash Clearing (decrease cash asset since we pay the retailer)
    const idempotencyKey = `REDEEM-${body.voucherCode}`;
    const transaction = new LedgerTransaction(
      idempotencyKey,
      `Voucher redemption settled for ${voucher.merchantName}`,
      [
        {
          accountId: liabilityAccount.id,
          amount: voucher.amount,
          direction: EntryDirection.DEBIT,
        },
        {
          accountId: cashAccount.id,
          amount: voucher.amount,
          direction: EntryDirection.CREDIT,
        },
      ]
    );

    return this.prisma.$transaction(async (tx) => {
      // Execute ledger update
      await this.ledgerRepo.createTransaction(transaction);

      // Update voucher state
      const updatedVoucher = await tx.voucher.update({
        where: { code: body.voucherCode },
        data: { status: 'REDEEMED' },
      });

      return {
        success: true,
        voucherCode: updatedVoucher.code,
        status: updatedVoucher.status,
      };
    });
  }
}
