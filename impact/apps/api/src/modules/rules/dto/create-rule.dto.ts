import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { RuleCondition, RuleResult, RuleStatus, RuleType } from '@impact/types';

export class CreateRuleDto {
  @ApiProperty({ example: 'RULE-SCH-002', description: 'Unique code identifier for the rule' })
  @IsString()
  @IsNotEmpty()
  ruleCode!: string;

  @ApiProperty({ required: false, description: 'ID of the policy version this rule originates from' })
  @IsOptional()
  @IsUUID()
  policyVersionId?: string;

  @ApiProperty({
    enum: [
      'enrollment_status',
      'scholarship_eligibility',
      'sap_quantitative',
      'sap_qualitative',
      'sap_timeframe',
      'aid_eligibility',
      'graduation_requirement',
      'credit_requirement',
      'gpa_requirement',
    ],
    example: 'scholarship_eligibility',
  })
  @IsEnum([
    'enrollment_status',
    'scholarship_eligibility',
    'sap_quantitative',
    'sap_qualitative',
    'sap_timeframe',
    'aid_eligibility',
    'graduation_requirement',
    'credit_requirement',
    'gpa_requirement',
  ])
  type!: RuleType;

  @ApiProperty({ example: 'STEM Excellence Award 12-credit requirement' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ required: false, example: 'Requires at least 12 enrolled credits and 3.5 GPA' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Deterministic JSON condition AST evaluated by @impact/rules ConditionEvaluator',
    example: {
      type: 'and',
      conditions: [
        { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 12 },
        { type: 'field', field: 'cumulativeGpa', operator: '>=', value: 3.5 },
      ],
    },
  })
  @IsObject()
  conditionJson!: RuleCondition;

  @ApiProperty({
    description: 'Outcome payload returned when rule condition passes',
    example: { eligible: true, amount: 3000 },
  })
  @IsObject()
  resultJson!: RuleResult;

  @ApiProperty({ default: 100, description: 'Evaluation priority (lower numbers execute first)' })
  @IsInt()
  @Min(1)
  priority = 100;

  @ApiProperty({ example: '2026-08-01', description: 'Effective start date' })
  @IsDateString()
  effectiveFrom!: string;

  @ApiProperty({ required: false, example: '2027-07-31', description: 'Effective end date' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiProperty({ enum: ['draft', 'active', 'deprecated'], default: 'active' })
  @IsOptional()
  @IsEnum(['draft', 'active', 'deprecated'])
  status?: RuleStatus = 'active';
}

export class TestRuleDto {
  @ApiProperty({ required: false, description: 'Student ID to test rule against' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiProperty({
    required: false,
    description: 'Manual student state JSON for playground testing',
  })
  @IsOptional()
  @IsObject()
  studentState?: Record<string, unknown>;
}
