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
import { CreateOpportunitySourceDto, OpportunityQueryDto } from './dto/opportunity.dto';
import { OpportunitiesService } from './opportunities.service';

@ApiTags('opportunities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller({ path: 'opportunities', version: '1' })
export class OpportunitiesController {
  constructor(private readonly service: OpportunitiesService) {}

  @Post('sources')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Register a new opportunity scraping source/feed (Admin only)' })
  @ApiResponse({ status: 201, description: 'Source registered' })
  async createSource(
    @Body() dto: CreateOpportunitySourceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createSource(dto, user);
  }

  @Get('sources')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all opportunity scraping sources' })
  async listSources(@CurrentUser() user: AuthUser) {
    return this.service.listSources(user);
  }

  @Get()
  @ApiOperation({ summary: 'List active scholarships, student jobs, and alternative funding opportunities' })
  async listOpportunities(
    @Query() query: OpportunityQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.listOpportunities(query, user);
  }

  @Get('match/:studentId')
  @ApiOperation({ summary: 'Match a student profile against available scholarships and student jobs' })
  @ApiResponse({ status: 200, description: 'Ranked list of eligible and matched opportunities' })
  async matchStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.matchStudentOpportunities(studentId, user);
  }
}
