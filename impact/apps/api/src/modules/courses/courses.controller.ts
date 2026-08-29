import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards/index';
import { CoursesService } from './courses.service';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: 'courses', version: '1' })
export class CoursesController {
  constructor(private readonly service: CoursesService) {}

  @Get('health')
  health() {
    return { module: 'courses', status: 'ok' };
  }
}
