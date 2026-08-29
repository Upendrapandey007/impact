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
import { AdvisorService } from './advisor.service';
import {
  CreateAdvisorNoteDto,
  RecommendOpportunityDto,
  RiskOverrideDto,
  RiskQueueFilterDto,
} from './dto/advisor-queue.dto';

@ApiTags('advisor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Roles('advisor', 'financial_aid_officer', 'admin', 'super_admin')
@Controller({ path: 'advisor', version: '1' })
export class AdvisorController {
  constructor(private readonly service: AdvisorService) {}

  @Get('risk-queue')
  @ApiOperation({ summary: 'Get student caseload risk queue with cohort metrics and filtering' })
  @ApiResponse({ status: 200, description: 'Filtered risk queue with summary metrics' })
  async getRiskQueue(
    @Query() dto: RiskQueueFilterDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.getRiskQueue(dto, user);
  }

  @Get('students/:id')
  @ApiOperation({ summary: 'Get student profile with simulation history timeline' })
  async getStudentDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.getStudentDetail(id, user);
  }

  @Post('students/:id/notes')
  @ApiOperation({ summary: 'Add an advisor note to a student profile' })
  async createAdvisorNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAdvisorNoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createAdvisorNote(id, dto, user);
  }

  @Post('simulations/:id/override')
  @ApiOperation({ summary: 'Apply formal risk override with mandatory justification reason' })
  @ApiResponse({ status: 200, description: 'Risk overridden and audit log generated' })
  async overrideRisk(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RiskOverrideDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.overrideRisk(id, dto, user);
  }

  @Post('students/:id/recommend-opportunity')
  @ApiOperation({ summary: 'Dispatch recommended campus job or replacement scholarship to student' })
  async recommendOpportunity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecommendOpportunityDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.recommendOpportunity(id, dto, user);
  }
}
