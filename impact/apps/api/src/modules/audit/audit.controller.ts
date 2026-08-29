import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards/index';
import { AuditService } from './audit.service';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: 'audit', version: '1' })
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get('health')
  health() {
    return { module: 'audit', status: 'ok' };
  }
}
