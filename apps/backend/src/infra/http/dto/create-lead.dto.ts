import { ApiProperty } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty({ example: 'student@university.ac.za' })
  email: string;

  @ApiProperty({ example: 'Thabo Mollo' })
  fullName: string;

  @ApiProperty({ example: '0821234567', required: false })
  mobile?: string;

  @ApiProperty({ example: 'University of Cape Town', required: false })
  university?: string;

  @ApiProperty({ example: true })
  processingConsent: boolean;

  @ApiProperty({ example: false })
  marketingConsent: boolean;
}
