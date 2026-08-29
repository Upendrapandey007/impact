import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { SIMULATION_QUEUE } from '../../providers/queue.module';
import { SimulationProcessor } from './simulation.processor';
import { SimulationsController } from './simulations.controller';
import { SimulationsService } from './simulations.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: SIMULATION_QUEUE }),
    JwtModule.register({ secret: process.env['JWT_SECRET'] ?? 'dev-secret' }),
  ],
  controllers: [SimulationsController],
  providers: [SimulationsService, SimulationProcessor],
  exports: [SimulationsService],
})
export class SimulationsModule {}
