import { Controller, Post, Get, Body, Param, Req, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConsumerRepository } from '../../database/consumer.repository';
import { CreateConsumerDto } from '../dto/create-consumer.dto';
import { AddConsentDto } from '../dto/add-consent.dto';
import * as express from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupabaseService } from '../../database/supabase.service';

@ApiTags('consumers')
@Controller('api/v1/consumers')
export class ConsumerController {
  constructor(
    private readonly consumerRepo: ConsumerRepository,
    private readonly supabase: SupabaseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a new student consumer profile' })
  @ApiResponse({ status: 201, description: 'Consumer profile registered successfully' })
  async register(@Body() dto: CreateConsumerDto) {
    const existing = await this.consumerRepo.findConsumerByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('A profile with this email is already registered.');
    }
    return this.consumerRepo.createConsumer(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve student consumer profile details' })
  async getProfile(@Param('id') id: string) {
    const consumer = await this.consumerRepo.findConsumerById(id);
    if (!consumer) {
      throw new NotFoundException('Consumer profile not found.');
    }
    return consumer;
  }

  @Post(':id/consents')
  @ApiOperation({ summary: 'Log a POPIA consent grant or withdrawal action' })
  async addConsent(
    @Param('id') id: string,
    @Body() dto: any, // We will map fields manually to support the AddConsentDto format
    @Req() req: express.Request,
  ) {
    const consumer = await this.consumerRepo.findConsumerById(id);
    if (!consumer) {
      throw new NotFoundException('Consumer profile not found.');
    }

    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    return this.consumerRepo.addConsent(id, {
      consentType: dto.consentType,
      status: dto.status,
      version: dto.version,
      ipAddress,
      userAgent,
    });
  }

  @Get(':id/consents')
  @ApiOperation({ summary: 'Fetch consent log history for a consumer' })
  async getConsents(@Param('id') id: string) {
    const consumer = await this.consumerRepo.findConsumerById(id);
    if (!consumer) {
      throw new NotFoundException('Consumer profile not found.');
    }
    return this.consumerRepo.getConsentsByConsumerId(id);
  }

  @Post(':id/kyc/fica')
  @ApiOperation({ summary: 'Trigger identity validation and liveness verification checks (Mocked)' })
  async runFica(@Param('id') id: string, @Body('shouldSucceed') shouldSucceed = true) {
    const consumer = await this.consumerRepo.findConsumerById(id);
    if (!consumer) {
      throw new NotFoundException('Consumer profile not found.');
    }

    // FICA Business rule simulation:
    // If ID number is not set, we cannot verify FICA.
    if (!consumer.idNumber) {
      throw new BadRequestException('FICA check requires a verified ID number. Please provide your South African ID.');
    }

    const targetStatus = shouldSucceed ? 'VERIFIED' : 'MANUAL_REVIEW';
    return this.consumerRepo.updateKYCStatus(id, targetStatus);
  }

  @Post(':id/student-verify')
  @ApiOperation({ summary: 'Acknowledge academic enrollment status verification' })
  async verifyStudent(
    @Param('id') id: string,
    @Body('academicEmail') academicEmail?: string,
    @Body('studentCardDocUrl') studentCardDocUrl?: string,
  ) {
    const consumer = await this.consumerRepo.findConsumerById(id);
    if (!consumer) {
      throw new NotFoundException('Consumer profile not found.');
    }

    // Auto-verify if they provide a valid academic domain (.ac.za)
    if (academicEmail && academicEmail.endsWith('.ac.za')) {
      return this.consumerRepo.updateStudentVerification(id, true);
    }

    // If they upload a student card, it shifts state but requires manual review approval
    if (studentCardDocUrl) {
      return this.consumerRepo.updateStudentVerification(id, false, studentCardDocUrl);
    }

    throw new BadRequestException('Provide either a valid academic email or upload an enrollment document.');
  }

  @Get(':id/data-export')
  @ApiOperation({ summary: 'Export complete profile history in JSON format (POPIA DSAR)' })
  async exportData(@Param('id') id: string) {
    const consumer = await this.consumerRepo.findConsumerById(id);
    if (!consumer) {
      throw new NotFoundException('Consumer profile not found.');
    }

    const consents = await this.consumerRepo.getConsentsByConsumerId(id);
    
    const { data: vouchers, error } = await this.supabase.client
      .from('Voucher')
      .select('*')
      .eq('consumerId', id);

    const voucherList = vouchers || [];

    return {
      exportTimestamp: new Date(),
      complianceFramework: 'POPIA (SA)',
      profile: {
        firstName: consumer.firstName,
        lastName: consumer.lastName,
        email: consumer.email,
        mobile: consumer.mobile,
        idNumber: consumer.idNumber,
        kycStatus: consumer.kycStatus,
        studentVerified: consumer.studentVerified,
      },
      consents: consents.map(c => ({
        consentType: c.consentType,
        status: c.status,
        version: c.version,
        timestamp: c.timestamp,
      })),
      vouchers: voucherList.map(v => ({
        merchant: v.merchantName,
        amountCents: Number(v.amount),
        code: v.code,
        status: v.status,
        expiryDate: v.expiryDate,
      })),
    };
  }
}
