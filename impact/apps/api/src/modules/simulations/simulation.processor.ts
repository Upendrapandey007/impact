import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import type { Database } from '@impact/database';
import { schema } from '@impact/database';
import type { StudentState, SimulationResult } from '@impact/types';

import { DATABASE_TOKEN } from '../../providers/database.module';
import { SIMULATION_QUEUE } from '../../providers/queue.module';
import { SimulationsService } from './simulations.service';

interface SimulationJobData {
  simulationId: string;
  scenarioId: string;
  institutionId: string;
  studentId: string;
  scenarioType: string;
  parameters: Record<string, unknown>;
  studentState: StudentState;
}

@Processor(SIMULATION_QUEUE)
export class SimulationProcessor extends WorkerHost {
  private readonly logger = new Logger(SimulationProcessor.name);

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly simulationsService: SimulationsService,
  ) {
    super();
  }

  async process(job: Job<SimulationJobData>): Promise<void> {
    const { simulationId, institutionId, studentState, scenarioType, parameters } = job.data;

    this.logger.log(`Processing simulation ${simulationId} (${scenarioType})`);

    try {
      // Mark as running
      await this.db
        .update(schema.simulations)
        .set({ status: 'running' })
        .where(eq(schema.simulations.id, simulationId));

      // Load rule engine with institution's active rules
      const engine = await this.simulationsService.loadRuleEngine(institutionId);

      // Run simulation
      const result: SimulationResult = engine.simulate(
        studentState,
        scenarioType as SimulationResult['scenarioType'],
        parameters,
      );

      // Persist impacts
      if (result.impacts.length > 0) {
        await this.db.insert(schema.impacts).values(
          result.impacts.map((impact) => ({
            institutionId,
            simulationId,
            category: impact.category,
            severity: impact.severity as 'none' | 'low' | 'moderate' | 'high' | 'critical',
            changed: impact.changed,
            title: impact.title,
            description: impact.description,
            currentValue: impact.currentValue as Record<string, unknown>,
            projectedValue: impact.projectedValue as Record<string, unknown>,
            ruleId: impact.ruleId ?? null,
            policyVersionId: impact.policyVersionId ?? null,
            policyChunkId: impact.policyChunkId ?? null,
            metadata: {},
          })),
        );
      }

      // Update hypothetical state on scenario
      const { ScenarioBuilder } = await import('@impact/rules');
      const builder = new ScenarioBuilder();
      const hypotheticalState = builder.build(
        scenarioType as SimulationResult['scenarioType'],
        studentState,
        parameters,
      );

      await this.db
        .update(schema.scenarios)
        .set({ hypotheticalState: hypotheticalState as unknown as Record<string, unknown> })
        .where(eq(schema.scenarios.id, job.data.scenarioId));

      // Mark simulation as completed
      await this.db
        .update(schema.simulations)
        .set({
          status: 'completed',
          overallRisk: result.overallRisk,
          riskScores: result.riskScores as unknown as Record<string, unknown>,
          policyVersionIds: result.policyVersionIds,
          ruleIds: result.ruleIds,
          completedAt: new Date(),
        })
        .where(eq(schema.simulations.id, simulationId));

      // Create immutable audit log entry
      try {
        await this.db.insert(schema.auditLogs).values({
          institutionId,
          action: 'SIMULATION_EXECUTED',
          resourceType: 'simulation',
          resourceId: simulationId,
          metadata: {
            scenarioType,
            overallRisk: result.overallRisk,
            riskScores: result.riskScores,
            totalImpacts: result.impacts.length,
          },
        });
      } catch (auditErr) {
        this.logger.warn(`Failed to write audit log for simulation ${simulationId}: ${auditErr}`);
      }

      this.logger.log(
        `Simulation ${simulationId} completed. Risk: ${result.overallRisk}`,
      );
    } catch (error) {
      this.logger.error(`Simulation ${simulationId} failed:`, error);

      await this.db
        .update(schema.simulations)
        .set({
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        })
        .where(eq(schema.simulations.id, simulationId));

      throw error; // Let BullMQ handle retry
    }
  }
}
