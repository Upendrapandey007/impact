import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards/index';
import { AdvisorService } from './advisor.service';

@ApiTags('advisor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: 'advisor', version: '1' })
export class AdvisorController {
  constructor(private readonly service: AdvisorService) {}

  @Get('health')
  health() {
    return { module: 'advisor', status: 'ok' };
  }
}
