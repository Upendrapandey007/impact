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
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { SimulationsService } from './simulations.service';

@ApiTags('simulations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller({ path: 'simulations', version: '1' })
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  /**
   * POST /api/v1/simulations
   * Creates and queues a simulation for processing.
   * Returns immediately with the simulation ID.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new decision simulation (asynchronous queue)' })
  @ApiResponse({
    status: 202,
    description: 'Simulation queued successfully',
    schema: {
      type: 'object',
      properties: {
        simulationId: { type: 'string', format: 'uuid' },
        status: { type: 'string', enum: ['pending'] },
        estimatedMs: { type: 'number' },
      },
    },
  })
  async createSimulation(
    @Body() dto: CreateSimulationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.simulationsService.createSimulation(dto, user);
  }

  /**
   * POST /api/v1/simulations/preview
   * Fast synchronous prospective preview simulation.
   */
  @Post('preview')
  @ApiOperation({ summary: 'Run synchronous prospective preview simulation (immediate in-memory evaluation)' })
  @ApiResponse({ status: 200, description: 'Prospective differential simulation output' })
  async simulatePreview(
    @Body() dto: CreateSimulationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.simulationsService.simulatePreview(dto, user);
  }

  /**
   * GET /api/v1/simulations/:id
   * Returns a completed simulation with full impact detail.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get simulation result by ID' })
  @ApiResponse({ status: 200, description: 'Simulation result' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async getSimulation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.simulationsService.getSimulation(id, user);
  }

  /**
   * GET /api/v1/simulations?studentId=&page=&limit=
   * Lists simulations for a student.
   */
  @Get()
  @Roles('advisor', 'financial_aid_officer', 'admin', 'super_admin')
  @ApiOperation({ summary: 'List simulations for a student (advisor/admin only)' })
  async listSimulations(
    @Query('studentId', ParseUUIDPipe) studentId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @CurrentUser() user: AuthUser,
  ) {
    return this.simulationsService.listSimulations(
      studentId,
      user,
      limit,
      (page - 1) * limit,
    );
  }
}
