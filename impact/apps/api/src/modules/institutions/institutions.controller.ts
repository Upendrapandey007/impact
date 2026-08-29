import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards/index';
import { InstitutionsService } from './institutions.service';

@ApiTags('institutions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: 'institutions', version: '1' })
export class InstitutionsController {
  constructor(private readonly service: InstitutionsService) {}

  @Get('health')
  health() {
    return { module: 'institutions', status: 'ok' };
  }
}
