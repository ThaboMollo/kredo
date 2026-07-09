import { Controller, Post, Body, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { LedgerRepository } from '../../database/ledger.repository';
import { LedgerTransaction, EntryDirection, AccountType } from '../../../domain/ledger/ledger-transaction';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('repayments')
@Controller('api/v1/repayments')
export class RepaymentController {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly ledgerRepo: LedgerRepository,
  ) {}

  @Post('pay-now')
  @ApiOperation({ summary: 'Initiate a direct card/EFT repayment session' })
  async createRepaymentSession(
    @Body() dto: { consumerId: string; amount: number } // amount in cents
  ) {
    const { data: consumer, error } = await this.supabase.client
      .from('Consumer')
      .select('*')
      .eq('id', dto.consumerId)
      .maybeSingle();

    if (error || !consumer) {
      throw new NotFoundException('Consumer profile not found.');
    }

    if (dto.amount <= 0) {
      throw new BadRequestException('Repayment amount must be greater than zero.');
    }

    const paymentRef = `REPAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    return {
      paymentRef,
      checkoutUrl: `https://checkout.yoco.com/sandbox/pay?ref=${paymentRef}&amount=${dto.amount}`,
    };
  }

  @Post('webhook/yoco')
  @ApiOperation({ summary: 'Yoco/PSP payment confirmation webhook (Simulated)' })
  async handlePaymentWebhook(
    @Body() body: { consumerId: string; amount: number; paymentRef: string; status: 'SUCCESS' | 'FAILED' }
  ) {
    if (body.status !== 'SUCCESS') {
      return { success: false, message: 'Payment ignored' };
    }

    let cashAccount = await this.ledgerRepo.findAccountByCode('1100-CASH-CLEARING');
    if (!cashAccount) {
      cashAccount = await this.ledgerRepo.createAccount('1100-CASH-CLEARING', 'Cash Clearing Account', AccountType.ASSET);
    }

    let receivableAccount = await this.ledgerRepo.findAccountByCode('1000-RECEIVABLES');
    if (!receivableAccount) {
      receivableAccount = await this.ledgerRepo.createAccount('1000-RECEIVABLES', 'Consumer Receivables', AccountType.ASSET);
    }

    const transaction = new LedgerTransaction(
      body.paymentRef,
      `Student repayment ref ${body.paymentRef}`,
      [
        {
          accountId: cashAccount.id,
          amount: BigInt(body.amount),
          direction: EntryDirection.DEBIT,
        },
        {
          accountId: receivableAccount.id,
          amount: BigInt(body.amount),
          direction: EntryDirection.CREDIT,
        },
      ]
    );

    await this.ledgerRepo.createTransaction(transaction);

    return { success: true, balance: Number(await this.ledgerRepo.getAccountBalance('1000-RECEIVABLES')) };
  }
}
