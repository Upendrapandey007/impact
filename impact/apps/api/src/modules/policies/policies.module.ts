import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PoliciesController } from './policies.controller';
import { PoliciesService } from './policies.service';

@Module({
  imports: [JwtModule.register({ secret: process.env['JWT_SECRET'] ?? 'dev-secret' })],
  controllers: [PoliciesController],
  providers: [PoliciesService],
  exports: [PoliciesService],
})
export class PoliciesModule {}
