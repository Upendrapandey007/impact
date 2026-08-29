import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards/index';
import { EnrollmentsService } from './enrollments.service';

@ApiTags('enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: 'enrollments', version: '1' })
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @Get('health')
  health() {
    return { module: 'enrollments', status: 'ok' };
  }
}
