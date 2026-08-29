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
import { CreateRuleDto, TestRuleDto } from './dto/create-rule.dto';
import { RulesService } from './rules.service';

@ApiTags('rules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller({ path: 'rules', version: '1' })
export class RulesController {
  constructor(private readonly service: RulesService) {}

  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a new deterministic rule (Admin only)' })
  @ApiResponse({ status: 201, description: 'Rule created successfully' })
  async createRule(
    @Body() dto: CreateRuleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createRule(dto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rule details and condition AST' })
  async getRule(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.getRule(id, user);
  }

  @Get()
  @ApiOperation({ summary: 'List policy rules with filtering' })
  async listRules(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('policyVersionId') policyVersionId?: string,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.service.listRules(user!, { type, status, policyVersionId });
  }

  @Post(':id/test')
  @Roles('admin', 'super_admin', 'advisor')
  @ApiOperation({ summary: 'Admin Test Harness: Test rule condition against a student state' })
  @ApiResponse({ status: 200, description: 'Rule evaluation trace and outcome' })
  async testRule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TestRuleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.testRule(id, dto, user);
  }
}
