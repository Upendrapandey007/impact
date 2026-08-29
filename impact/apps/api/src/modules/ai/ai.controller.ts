import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards/index';
import { AiService } from './ai.service';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(private readonly service: AiService) {}

  @Get('health')
  health() {
    return { module: 'ai', status: 'ok' };
  }
}
