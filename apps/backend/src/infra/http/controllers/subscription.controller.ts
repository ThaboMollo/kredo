import { Controller, Post, Get, Body, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { encrypt } from '../../../utils/crypto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SubscriptionStatus, MandateStatus } from '@prisma/client';

@ApiTags('subscriptions')
@Controller('api/v1/subscriptions')
export class SubscriptionController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Initiate a new plan subscription and DebiCheck mandate' })
  async createSubscription(
    @Body() dto: { consumerId: string; planCode: string; bankCode: string; accountNumber: string }
  ) {
    const consumer = await this.prisma.consumer.findUnique({
      where: { id: dto.consumerId },
    });
    if (!consumer) {
      throw new NotFoundException('Consumer profile not found.');
    }

    const encryptedAccount = encrypt(dto.accountNumber);
    const mandateRef = `DEBICHECK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create pending subscription
      const subscription = await tx.subscription.create({
        data: {
          consumerId: dto.consumerId,
          planCode: dto.planCode,
          status: SubscriptionStatus.PENDING,
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in future
        },
      });

      // 2. Create pending mandate
      const mandate = await tx.mandate.create({
        data: {
          consumerId: dto.consumerId,
          bankCode: dto.bankCode,
          accountNumber: encryptedAccount,
          mandateRef,
          status: MandateStatus.INITIATED,
        },
      });

      return {
        subscription,
        mandateRef: mandate.mandateRef,
        status: mandate.status,
        instruction: 'Please approve the DebiCheck mandate in your banking app or dial *120*229#',
      };
    });
  }

  @Get('status')
  @ApiOperation({ summary: 'Fetch the active subscription status for a consumer' })
  async getStatus(@Query('consumerId') consumerId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { consumerId },
      orderBy: { createdAt: 'desc' },
    });

    const mandate = await this.prisma.mandate.findFirst({
      where: { consumerId },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) {
      return { status: 'NONE' };
    }

    return {
      subscriptionId: sub.id,
      planCode: sub.planCode,
      status: sub.status,
      mandateStatus: mandate ? mandate.status : null,
    };
  }

  @Post('webhook/debicheck')
  @ApiOperation({ summary: 'Process incoming DebiCheck mandate authorizations (Simulated)' })
  async handleDebiCheckWebhook(@Body() body: { mandateRef: string; status: 'AUTHENTICATED' | 'REJECTED' }) {
    const mandate = await this.prisma.mandate.findUnique({
      where: { mandateRef: body.mandateRef },
    });

    if (!mandate) {
      throw new NotFoundException('Mandate reference not found.');
    }

    const updatedMandate = await this.prisma.mandate.update({
      where: { mandateRef: body.mandateRef },
      data: {
        status: body.status === 'AUTHENTICATED' ? MandateStatus.AUTHENTICATED : MandateStatus.REJECTED,
      },
    });

    if (body.status === 'AUTHENTICATED') {
      // Transition subscription to ACTIVE
      await this.prisma.subscription.updateMany({
        where: { consumerId: mandate.consumerId, status: SubscriptionStatus.PENDING },
        data: { status: SubscriptionStatus.ACTIVE },
      });
    }

    return { success: true, status: updatedMandate.status };
  }
}
