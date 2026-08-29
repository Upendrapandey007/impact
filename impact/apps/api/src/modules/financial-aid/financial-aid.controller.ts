import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards/index';
import { FinancialAidService } from './financial-aid.service';

@ApiTags('financial-aid')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: 'financial-aid', version: '1' })
export class FinancialAidController {
  constructor(private readonly service: FinancialAidService) {}

  @Get('health')
  health() {
    return { module: 'financial-aid', status: 'ok' };
  }
}
