import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Roles, type AuthUser } from '../../common/decorators/index';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../../common/guards/index';
import { CreateImportJobDto } from './dto/create-import.dto';
import { ImportJobsService } from './import-jobs.service';

@ApiTags('import-jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Roles('admin', 'super_admin')
@Controller({ path: 'import-jobs', version: '1' })
export class ImportJobsController {
  constructor(private readonly service: ImportJobsService) {}

  @Post('csv')
  @ApiOperation({ summary: 'Submit and process a CSV batch import job (Admin only)' })
  @ApiResponse({ status: 201, description: 'Import job created and processed' })
  async createImportJob(
    @Body() dto: CreateImportJobDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createAndProcessJob(dto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details and row errors of an import job' })
  async getJob(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.getJob(id, user);
  }

  @Get()
  @ApiOperation({ summary: 'List previous import jobs for the institution' })
  async listJobs(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.listJobs(user, limit, (page - 1) * limit);
  }
}
