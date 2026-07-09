import { ApiProperty } from '@nestjs/swagger';

export class AddConsentDto {
  @ApiProperty({ example: 'PROCESSING' })
  consentType: string;

  @ApiProperty({ example: 'GRANTED', enum: ['GRANTED', 'WITHDRAWN'] })
  status: 'GRANTED' | 'WITHDRAWN';

  @ApiProperty({ example: 'v1.0' })
  version: string;
}
