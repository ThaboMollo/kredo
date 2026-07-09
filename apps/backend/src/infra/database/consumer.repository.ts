import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { encrypt, decrypt } from '../../utils/crypto';
import { KYCStatus, ConsentStatus, Consumer, Consent } from '@prisma/client';

export interface CreateConsumerDto {
  email: string;
  idNumber?: string;
  mobile?: string;
  firstName: string;
  lastName: string;
}

export interface ConsentInput {
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress: string;
  userAgent: string;
}

@Injectable()
export class ConsumerRepository {
  constructor(private readonly prisma: PrismaService) {}

  private decryptConsumer(consumer: Consumer | null): any {
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

    const consumer = await this.prisma.consumer.create({
      data: {
        emailEncrypted: emailEnc,
        idNumberEncrypted: idNumberEnc,
        mobileEncrypted: mobileEnc,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    return this.decryptConsumer(consumer);
  }

  async findConsumerById(id: string): Promise<any> {
    const consumer = await this.prisma.consumer.findUnique({
      where: { id },
    });
    return this.decryptConsumer(consumer);
  }

  async findConsumerByEmail(email: string): Promise<any> {
    const emailEnc = encrypt(email, true);
    const consumer = await this.prisma.consumer.findUnique({
      where: { emailEncrypted: emailEnc },
    });
    return this.decryptConsumer(consumer);
  }

  async updateKYCStatus(id: string, status: KYCStatus): Promise<any> {
    const consumer = await this.prisma.consumer.update({
      where: { id },
      data: { kycStatus: status },
    });
    return this.decryptConsumer(consumer);
  }

  async updateStudentVerification(id: string, verified: boolean, studentCardDocUrl?: string): Promise<any> {
    const consumer = await this.prisma.consumer.update({
      where: { id },
      data: { 
        studentVerified: verified,
        ...(studentCardDocUrl && { studentCardDocUrl }),
      },
    });
    return this.decryptConsumer(consumer);
  }

  async addConsent(consumerId: string, consent: ConsentInput): Promise<Consent> {
    return this.prisma.consent.create({
      data: {
        consumerId,
        consentType: consent.consentType,
        status: consent.status,
        version: consent.version,
        ipAddress: consent.ipAddress,
        userAgent: consent.userAgent,
      },
    });
  }

  async getConsentsByConsumerId(consumerId: string): Promise<Consent[]> {
    return this.prisma.consent.findMany({
      where: { consumerId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
