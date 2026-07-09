import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { encrypt, decrypt } from '../../utils/crypto';

export interface CreateConsumerDto {
  email: string;
  idNumber?: string;
  mobile?: string;
  firstName: string;
  lastName: string;
}

export interface ConsentInput {
  consentType: string;
  status: 'GRANTED' | 'WITHDRAWN';
  version: string;
  ipAddress: string;
  userAgent: string;
}

@Injectable()
export class ConsumerRepository {
  constructor(private readonly supabase: SupabaseService) {}

  private decryptConsumer(consumer: any | null): any {
    if (!consumer) return null;
    return {
      ...consumer,
      email: decrypt(consumer.emailEncrypted),
      idNumber: consumer.idNumberEncrypted ? decrypt(consumer.idNumberEncrypted) : null,
      mobile: consumer.mobileEncrypted ? decrypt(consumer.mobileEncrypted) : null,
    };
  }

  async createConsumer(data: CreateConsumerDto): Promise<any> {
    const emailEnc = encrypt(data.email, true);
    const idNumberEnc = data.idNumber ? encrypt(data.idNumber, true) : null;
    const mobileEnc = data.mobile ? encrypt(data.mobile) : null;

    const { data: consumer, error } = await this.supabase.client
      .from('Consumer')
      .insert({
        emailEncrypted: emailEnc,
        idNumberEncrypted: idNumberEnc,
        mobileEncrypted: mobileEnc,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create consumer: ${error.message}`);
    }

    return this.decryptConsumer(consumer);
  }

  async findConsumerById(id: string): Promise<any> {
    const { data: consumer, error } = await this.supabase.client
      .from('Consumer')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to query consumer by id: ${error.message}`);
    }

    return this.decryptConsumer(consumer);
  }

  async findConsumerByEmail(email: string): Promise<any> {
    const emailEnc = encrypt(email, true);
    const { data: consumer, error } = await this.supabase.client
      .from('Consumer')
      .select('*')
      .eq('emailEncrypted', emailEnc)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to query consumer by email: ${error.message}`);
    }

    return this.decryptConsumer(consumer);
  }

  async updateKYCStatus(id: string, status: string): Promise<any> {
    const { data: consumer, error } = await this.supabase.client
      .from('Consumer')
      .update({ kycStatus: status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update KYC status: ${error.message}`);
    }

    return this.decryptConsumer(consumer);
  }

  async updateStudentVerification(id: string, verified: boolean, studentCardDocUrl?: string): Promise<any> {
    const updatePayload: Record<string, any> = { studentVerified: verified };
    if (studentCardDocUrl) {
      updatePayload['studentCardDocUrl'] = studentCardDocUrl;
    }

    const { data: consumer, error } = await this.supabase.client
      .from('Consumer')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update student verification: ${error.message}`);
    }

    return this.decryptConsumer(consumer);
  }

  async addConsent(consumerId: string, consent: ConsentInput): Promise<any> {
    const { data: savedConsent, error } = await this.supabase.client
      .from('Consent')
      .insert({
        consumerId,
        consentType: consent.consentType,
        status: consent.status,
        version: consent.version,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert consent: ${error.message}`);
    }

    return savedConsent;
  }

  async getConsentsByConsumerId(consumerId: string): Promise<any[]> {
    const { data: consents, error } = await this.supabase.client
      .from('Consent')
      .select('*')
      .eq('consumerId', consumerId)
      .order('timestamp', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch consents: ${error.message}`);
    }

    return consents || [];
  }
}
