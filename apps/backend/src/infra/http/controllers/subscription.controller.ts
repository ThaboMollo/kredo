import { Controller, Post, Get, Body, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { encrypt } from '../../../utils/crypto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('subscriptions')
@Controller('api/v1/subscriptions')
export class SubscriptionController {
  constructor(private readonly supabase: SupabaseService) {}

  @Post()
  @ApiOperation({ summary: 'Initiate a new plan subscription and DebiCheck mandate' })
  async createSubscription(
    @Body() dto: { consumerId: string; planCode: string; bankCode: string; accountNumber: string }
  ) {
    const { data: consumer, error: consErr } = await this.supabase.client
      .from('Consumer')
      .select('*')
      .eq('id', dto.consumerId)
      .maybeSingle();

    if (consErr || !consumer) {
      throw new NotFoundException('Consumer profile not found.');
    }

    const encryptedAccount = encrypt(dto.accountNumber);
    const mandateRef = `DEBICHECK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // 1. Create pending subscription
    const { data: subscription, error: subErr } = await this.supabase.client
      .from('Subscription')
      .insert({
        consumerId: dto.consumerId,
        planCode: dto.planCode,
        status: 'PENDING',
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (subErr) {
      throw new BadRequestException(`Failed to create subscription: ${subErr.message}`);
    }

    // 2. Create pending mandate
    const { data: mandate, error: manErr } = await this.supabase.client
      .from('Mandate')
      .insert({
        consumerId: dto.consumerId,
        bankCode: dto.bankCode,
        accountNumber: encryptedAccount,
        mandateRef,
        status: 'INITIATED',
      })
      .select()
      .single();

    if (manErr) {
      throw new BadRequestException(`Failed to create mandate: ${manErr.message}`);
    }

    return {
      subscription,
      mandateRef: mandate.mandateRef,
      status: mandate.status,
      instruction: 'Please approve the DebiCheck mandate in your banking app or dial *120*229#',
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Fetch the active subscription status for a consumer' })
  async getStatus(@Query('consumerId') consumerId: string) {
    const { data: subs, error: subErr } = await this.supabase.client
      .from('Subscription')
      .select('*')
      .eq('consumerId', consumerId)
      .order('createdAt', { ascending: false })
      .limit(1);

    const { data: mandates, error: manErr } = await this.supabase.client
      .from('Mandate')
      .select('*')
      .eq('consumerId', consumerId)
      .order('createdAt', { ascending: false })
      .limit(1);

    const sub = subs?.[0];
    const mandate = mandates?.[0];

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
    const { data: mandate, error: manErr } = await this.supabase.client
      .from('Mandate')
      .select('*')
      .eq('mandateRef', body.mandateRef)
      .maybeSingle();

    if (manErr || !mandate) {
      throw new NotFoundException('Mandate reference not found.');
    }

    const { data: updatedMandate, error: updErr } = await this.supabase.client
      .from('Mandate')
      .update({
        status: body.status === 'AUTHENTICATED' ? 'AUTHENTICATED' : 'REJECTED',
      })
      .eq('mandateRef', body.mandateRef)
      .select()
      .single();

    if (updErr) {
      throw new BadRequestException(`Failed to update mandate status: ${updErr.message}`);
    }

    if (body.status === 'AUTHENTICATED') {
      // Transition subscription to ACTIVE
      await this.supabase.client
        .from('Subscription')
        .update({ status: 'ACTIVE' })
        .eq('consumerId', mandate.consumerId)
        .eq('status', 'PENDING');
    }

    return { success: true, status: updatedMandate.status };
  }
}
