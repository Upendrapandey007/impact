import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards/index';
import { ProgramsService } from './programs.service';

@ApiTags('programs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: 'programs', version: '1' })
export class ProgramsController {
  constructor(private readonly service: ProgramsService) {}

  @Get('health')
  health() {
    return { module: 'programs', status: 'ok' };
  }
}
