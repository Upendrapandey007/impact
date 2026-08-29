import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards/index';
import { RisksService } from './risks.service';

@ApiTags('risks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: 'risks', version: '1' })
export class RisksController {
  constructor(private readonly service: RisksService) {}

  @Get('health')
  health() {
    return { module: 'risks', status: 'ok' };
  }
}
