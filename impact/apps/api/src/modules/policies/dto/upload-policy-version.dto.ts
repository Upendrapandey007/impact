import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadPolicyVersionDto {
  @ApiProperty({
    example: 'v2026.1',
    description: 'Human-readable version label (e.g., v2026.1 or Fall 2026 Update)',
  })
  @IsString()
  @IsNotEmpty()
  versionLabel!: string;

  @ApiProperty({
    example: '2026-08-01',
    description: 'ISO date string when this version becomes legally effective',
  })
  @IsDateString()
  effectiveFrom!: string;

  @ApiProperty({
    required: false,
    example: '2027-07-31',
    description: 'ISO date string when this version expires (null if indefinitely active)',
  })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiProperty({
    description: 'Full text content of the policy document for chunking and ingestion',
    example: 'Section 1: Full-time Enrollment\nStudents must maintain at least 12 credit hours per regular semester to be considered full-time...',
  })
  @IsString()
  @IsNotEmpty()
  documentContent!: string;

  @ApiProperty({
    required: false,
    example: 'Financial_Aid_Handbook_2026.pdf',
    description: 'Original file name of the document',
  })
  @IsOptional()
  @IsString()
  fileName?: string;
}
