import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AppealsController } from './appeals.controller';
import { AppealsService } from './appeals.service';

@Module({
  imports: [JwtModule.register({ secret: process.env['JWT_SECRET'] ?? 'dev-secret' })],
  controllers: [AppealsController],
  providers: [AppealsService],
  exports: [AppealsService],
})
export class AppealsModule {}
