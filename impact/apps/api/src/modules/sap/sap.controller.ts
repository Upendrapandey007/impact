import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards/index';
import { SapService } from './sap.service';

@ApiTags('sap')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: 'sap', version: '1' })
export class SapController {
  constructor(private readonly service: SapService) {}

  @Get('health')
  health() {
    return { module: 'sap', status: 'ok' };
  }
}
