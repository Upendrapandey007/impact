import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { RulesController } from './rules.controller';
import { RulesService } from './rules.service';
import { SimulationsModule } from '../simulations/simulations.module';

@Module({
  imports: [
    JwtModule.register({ secret: process.env['JWT_SECRET'] ?? 'dev-secret' }),
    SimulationsModule,
  ],
  controllers: [RulesController],
  providers: [RulesService],
  exports: [RulesService],
})
export class RulesModule {}
