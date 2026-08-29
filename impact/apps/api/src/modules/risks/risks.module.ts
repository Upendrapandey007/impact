import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { RisksController } from './risks.controller';
import { RisksService } from './risks.service';

@Module({
  imports: [JwtModule.register({ secret: process.env['JWT_SECRET'] ?? 'dev-secret' })],
  controllers: [RisksController],
  providers: [RisksService],
  exports: [RisksService],
})
export class RisksModule {}
