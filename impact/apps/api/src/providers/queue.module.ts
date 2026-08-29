import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';

export const SIMULATION_QUEUE = 'simulations';
export const POLICY_PROCESSING_QUEUE = 'policy-processing';
export const NOTIFICATION_QUEUE = 'notifications';
export const IMPORT_QUEUE = 'imports';
export const RISK_RECALC_QUEUE = 'risk-recalc';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env['REDIS_HOST'] ?? 'localhost',
        port: Number(process.env['REDIS_PORT'] ?? 6379),
        password: process.env['REDIS_PASSWORD'],
      },
      defaultJobOptions: {
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 },
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    }),
    BullModule.registerQueue(
      { name: SIMULATION_QUEUE },
      { name: POLICY_PROCESSING_QUEUE },
      { name: NOTIFICATION_QUEUE },
      { name: IMPORT_QUEUE },
      { name: RISK_RECALC_QUEUE },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
