import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type CsvImportType = 'students' | 'courses' | 'enrollments' | 'financial_aid' | 'programs';

export class CreateImportJobDto {
  @ApiProperty({
    enum: ['students', 'courses', 'enrollments', 'financial_aid', 'programs'],
    description: 'The entity type being imported via CSV',
    example: 'students',
  })
  @IsEnum(['students', 'courses', 'enrollments', 'financial_aid', 'programs'])
  type!: CsvImportType;

  @ApiProperty({
    description: 'Raw CSV text content to parse and ingest',
    example: 'studentNumber,name,email,programCode,level,expectedGraduation\nSTU-2001,Jordan Lee,jordan.lee@apex.edu,CS,freshman,2030-05-15',
  })
  @IsString()
  @IsNotEmpty()
  csvContent!: string;

  @ApiProperty({
    required: false,
    description: 'Optional file name for tracking',
    example: 'fall2026_incoming_students.csv',
  })
  @IsOptional()
  @IsString()
  fileName?: string;
}
