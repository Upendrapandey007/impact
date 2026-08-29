import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AdvisorController } from './advisor.controller';
import { AdvisorService } from './advisor.service';

@Module({
  imports: [JwtModule.register({ secret: process.env['JWT_SECRET'] ?? 'dev-secret' })],
  controllers: [AdvisorController],
  providers: [AdvisorService],
  exports: [AdvisorService],
})
export class AdvisorModule {}
