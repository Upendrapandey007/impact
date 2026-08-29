import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards/index';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('health')
  health() {
    return { module: 'admin', status: 'ok' };
  }
}
