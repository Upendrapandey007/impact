import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { SapController } from './sap.controller';
import { SapService } from './sap.service';

@Module({
  imports: [JwtModule.register({ secret: process.env['JWT_SECRET'] ?? 'dev-secret' })],
  controllers: [SapController],
  providers: [SapService],
  exports: [SapService],
})
export class SapModule {}
