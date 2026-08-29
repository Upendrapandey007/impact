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
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UploadPolicyVersionDto } from './dto/upload-policy-version.dto';
import { PoliciesService } from './policies.service';

@ApiTags('policies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller({ path: 'policies', version: '1' })
export class PoliciesController {
  constructor(private readonly service: PoliciesService) {}

  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a new institutional policy entry (Admin only)' })
  @ApiResponse({ status: 201, description: 'Policy created successfully' })
  async createPolicy(
    @Body() dto: CreatePolicyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createPolicy(dto, user);
  }

  @Post(':id/versions')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Upload and chunk a new policy version document (Admin only)' })
  @ApiResponse({ status: 201, description: 'Policy version ingested and chunked' })
  async createPolicyVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UploadPolicyVersionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createPolicyVersion(id, dto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get policy details with version history' })
  async getPolicy(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.getPolicy(id, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all institutional policies' })
  async listPolicies(
    @Query('type') type?: string,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.service.listPolicies(user!, type);
  }

  @Get(':versionId/chunks')
  @ApiOperation({ summary: 'Search policy chunks for evidence and citations' })
  async searchChunks(
    @Param('versionId', ParseUUIDPipe) versionId: string,
    @Query('q') query: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.searchPolicyChunks(versionId, query ?? '', user);
  }
}
