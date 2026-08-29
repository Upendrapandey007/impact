import { IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type OpportunitySourceType = 'rss' | 'sitemap' | 'public_api' | 'html_scraper';

export class CreateOpportunitySourceDto {
  @ApiProperty({ example: 'Apex Career Center Student Jobs', description: 'Name of the scraping feed source' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: ['rss', 'sitemap', 'public_api', 'html_scraper'], example: 'rss' })
  @IsEnum(['rss', 'sitemap', 'public_api', 'html_scraper'])
  sourceType!: OpportunitySourceType;

  @ApiProperty({ example: 'https://careers.apex.edu/jobs.rss', description: 'Target feed/endpoint URL' })
  @IsUrl()
  targetUrl!: string;

  @ApiProperty({ required: false, example: 'https://careers.apex.edu/robots.txt' })
  @IsOptional()
  @IsUrl()
  robotsPolicyUrl?: string;

  @ApiProperty({ default: 30, description: 'Max requests per minute' })
  @IsOptional()
  @IsInt()
  @Min(1)
  rateLimitPerMin?: number = 30;

  @ApiProperty({ required: false, description: 'Feed extraction selector / JSON mapping configuration' })
  @IsOptional()
  @IsObject()
  scrapeConfig?: Record<string, unknown>;
}

export class OpportunityQueryDto {
  @ApiProperty({ required: false, enum: ['scholarship', 'student_job', 'work_study', 'grant', 'emergency_aid', 'fellowship', 'internship'] })
  @IsOptional()
  type?: string;

  @ApiProperty({ required: false, example: 'CS' })
  @IsOptional()
  @IsString()
  major?: string;

  @ApiProperty({ required: false, example: 3.0 })
  @IsOptional()
  minGpa?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, example: 20 })
  @IsOptional()
  limit?: number = 20;
}
