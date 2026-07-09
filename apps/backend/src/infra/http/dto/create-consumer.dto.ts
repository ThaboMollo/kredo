import { ApiProperty } from '@nestjs/swagger';

export class CreateConsumerDto {
  @ApiProperty({ example: 'student@university.ac.za' })
  email: string;

  @ApiProperty({ example: '0101015000081', required: false })
  idNumber?: string;

  @ApiProperty({ example: '0821234567', required: false })
  mobile?: string;

  @ApiProperty({ example: 'Thabo' })
  firstName: string;

  @ApiProperty({ example: 'Mollo' })
  lastName: string;
}
