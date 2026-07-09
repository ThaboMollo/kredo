import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('leads')
@Controller('api/v1/leads')
export class LeadsController {
  constructor(private readonly supabase: SupabaseService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new lead to the waitlist' })
  @ApiResponse({ status: 201, description: 'Lead successfully captured' })
  @ApiResponse({ status: 400, description: 'Missing mandatory POPIA processing consent' })
  async createLead(@Body() dto: CreateLeadDto) {
    if (!dto.processingConsent) {
      throw new BadRequestException('Mandatory POPIA processing consent must be granted to join the waitlist.');
    }

    const { data, error } = await this.supabase.client
      .from('Lead')
      .insert({
        email: dto.email,
        fullName: dto.fullName,
        mobile: dto.mobile,
        university: dto.university,
        processingConsent: dto.processingConsent,
        marketingConsent: dto.marketingConsent,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new BadRequestException('This email is already registered on our waitlist.');
      }
      throw new BadRequestException(error.message);
    }

    return data;
  }
}
