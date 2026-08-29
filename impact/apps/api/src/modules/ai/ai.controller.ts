import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser, type AuthUser } from '../../common/decorators/index';
import { JwtAuthGuard, TenantGuard } from '../../common/guards/index';
import { AiService } from './ai.service';
import { DraftAppealDto, ExplainSimulationDto, PolicyQaDto } from './dto/ai-copilot.dto';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post('policy-qa')
  @ApiOperation({ summary: 'Ask natural language policy question with grounded citations' })
  @ApiResponse({ status: 200, description: 'Grounded policy answer with direct citations' })
  async answerPolicyQuestion(
    @Body() dto: PolicyQaDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.answerPolicyQuestion(dto, user);
  }

  @Post('explain-simulation')
  @ApiOperation({ summary: 'Generate plain-English student summary from deterministic simulation output' })
  @ApiResponse({ status: 200, description: 'Empathetic plain-English summary with action items' })
  async explainSimulation(
    @Body() dto: ExplainSimulationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.explainSimulation(dto, user);
  }

  @Post('draft-appeal')
  @ApiOperation({ summary: 'Generate formal SAP or scholarship appeal letter from structured questionnaire' })
  @ApiResponse({ status: 200, description: 'Drafted institutional appeal letter' })
  async draftAppeal(
    @Body() dto: DraftAppealDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.draftAppeal(dto, user);
  }
}
