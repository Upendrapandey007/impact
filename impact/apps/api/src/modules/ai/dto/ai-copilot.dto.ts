import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PolicyQaDto {
  @ApiProperty({
    example: 'What is the minimum credit requirement to maintain my Merit Scholarship?',
    description: 'Natural language question regarding university policy or financial aid',
  })
  @IsString()
  @IsNotEmpty()
  question!: string;

  @ApiProperty({
    required: false,
    example: 'scholarship',
    description: 'Optional policy domain filter',
  })
  @IsOptional()
  @IsString()
  policyType?: string;
}

export class ExplainSimulationDto {
  @ApiProperty({ required: false, description: 'ID of an existing completed simulation' })
  @IsOptional()
  @IsUUID()
  simulationId?: string;

  @ApiProperty({ required: false, description: 'Direct simulation result payload' })
  @IsOptional()
  @IsObject()
  simulationResult?: Record<string, unknown>;
}

export class DraftAppealDto {
  @ApiProperty({
    enum: ['sap_pace_rate', 'sap_gpa', 'scholarship_credit_deficiency', 'maximum_timeframe'],
    example: 'scholarship_credit_deficiency',
  })
  @IsEnum(['sap_pace_rate', 'sap_gpa', 'scholarship_credit_deficiency', 'maximum_timeframe'])
  appealType!: 'sap_pace_rate' | 'sap_gpa' | 'scholarship_credit_deficiency' | 'maximum_timeframe';

  @ApiProperty({
    example: 'Family emergency and illness in week 8 required dropping to 12 credits.',
    description: 'Detailed description of the mitigating circumstance',
  })
  @IsString()
  @IsNotEmpty()
  mitigatingCircumstance!: string;

  @ApiProperty({ example: 'Fall 2026' })
  @IsString()
  @IsNotEmpty()
  termAffected!: string;

  @ApiProperty({
    example: 'Enrolled in tutoring at Academic Success Center and meeting weekly with academic advisor.',
    description: 'Steps being taken to ensure academic progress',
  })
  @IsString()
  @IsNotEmpty()
  academicSuccessPlan!: string;
}
