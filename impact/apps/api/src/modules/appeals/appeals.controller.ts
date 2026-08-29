import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards/index';
import { AppealsService } from './appeals.service';

@ApiTags('appeals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: 'appeals', version: '1' })
export class AppealsController {
  constructor(private readonly service: AppealsService) {}

  @Get('health')
  health() {
    return { module: 'appeals', status: 'ok' };
  }
}
