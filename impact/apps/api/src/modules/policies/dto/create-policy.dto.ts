import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { PolicyType } from '@impact/types';

export class CreatePolicyDto {
  @ApiProperty({
    example: '2026–27 Financial Aid Policy Handbook',
    description: 'The title of the institutional policy',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    enum: [
      'financial_aid',
      'sap',
      'scholarship',
      'enrollment',
      'academic',
      'program',
      'veteran',
      'international',
      'department',
    ],
    example: 'financial_aid',
    description: 'The domain classification of the policy',
  })
  @IsEnum([
    'financial_aid',
    'sap',
    'scholarship',
    'enrollment',
    'academic',
    'program',
    'veteran',
    'international',
    'department',
  ])
  type!: PolicyType;

  @ApiProperty({
    required: false,
    example: 'Federal and institutional guidelines for credit minimums and disbursement.',
    description: 'Detailed description of the policy scope',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    example: 'Office of Student Financial Aid',
    description: 'The department responsible for this policy',
  })
  @IsOptional()
  @IsString()
  ownerOffice?: string;
}
