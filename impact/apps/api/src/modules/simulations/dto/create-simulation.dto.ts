import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { ScenarioType } from '@impact/types';

export class CreateSimulationDto {
  @ApiProperty({ description: 'Student ID (optional — derived from token for students)', required: false })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiProperty({
    enum: [
      'DROP_COURSE', 'WITHDRAW', 'CHANGE_MAJOR', 'REDUCE_CREDITS',
      'REPEAT_COURSE', 'FAIL_COURSE', 'ADD_COURSE', 'LEAVE_OF_ABSENCE',
      'GRADUATE_EARLY', 'DELAY_GRADUATION', 'TRANSFER', 'OTHER',
    ],
    description: 'The type of academic decision to simulate',
  })
  @IsEnum([
    'DROP_COURSE', 'WITHDRAW', 'CHANGE_MAJOR', 'REDUCE_CREDITS',
    'REPEAT_COURSE', 'FAIL_COURSE', 'ADD_COURSE', 'LEAVE_OF_ABSENCE',
    'GRADUATE_EARLY', 'DELAY_GRADUATION', 'TRANSFER', 'OTHER',
  ])
  type!: ScenarioType;

  @ApiProperty({
    description: 'Decision-specific parameters',
    example: { courseId: 'uuid', targetCredits: 12 },
  })
  @IsObject()
  parameters!: Record<string, unknown>;
}
