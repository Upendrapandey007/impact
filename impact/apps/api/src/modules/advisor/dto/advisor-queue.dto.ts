import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { RiskLevel } from '@impact/types';

export class RiskQueueFilterDto {
  @ApiProperty({ required: false, enum: ['critical', 'high', 'moderate', 'low'] })
  @IsOptional()
  @IsEnum(['critical', 'high', 'moderate', 'low'])
  riskLevel?: RiskLevel;

  @ApiProperty({ required: false, example: 'CS' })
  @IsOptional()
  @IsString()
  major?: string;

  @ApiProperty({ required: false, enum: ['satisfactory', 'warning', 'probation', 'suspension'] })
  @IsOptional()
  sapStatus?: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, example: 20 })
  @IsOptional()
  limit?: number = 20;
}

export class CreateAdvisorNoteDto {
  @ApiProperty({ example: 'Discussed dropping BIO 201. Advised student to apply for CS tutor job to offset merit award.' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ default: false, description: 'Whether this note is visible to the student' })
  @IsOptional()
  @IsBoolean()
  isSharedWithStudent?: boolean = false;

  @ApiProperty({ required: false, example: 'Student will submit appeal before Oct 15' })
  @IsOptional()
  @IsString()
  actionItem?: string;
}

export class RiskOverrideDto {
  @ApiProperty({ enum: ['critical', 'high', 'moderate', 'low'] })
  @IsEnum(['critical', 'high', 'moderate', 'low'])
  overriddenRiskLevel!: RiskLevel;

  @ApiProperty({
    description: 'Mandatory justification reason for administrative/advisor override',
    example: 'Student provided approved medical withdrawal documentation from University Health Services for Fall 2026.',
  })
  @IsString()
  @IsNotEmpty()
  justificationReason!: string;

  @ApiProperty({ required: false, description: 'Optional revised category risk score breakdown' })
  @IsOptional()
  @IsObject()
  revisedRiskScores?: Record<string, number>;
}

export class RecommendOpportunityDto {
  @ApiProperty({ description: 'ID of the matched opportunity to recommend' })
  @IsUUID()
  opportunityId!: string;

  @ApiProperty({ required: false, example: 'This 12 hr/wk job matches your CS coursework and will bridge your funding.' })
  @IsOptional()
  @IsString()
  note?: string;
}
