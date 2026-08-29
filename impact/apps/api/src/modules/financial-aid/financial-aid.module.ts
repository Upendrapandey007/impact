import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { FinancialAidController } from './financial-aid.controller';
import { FinancialAidService } from './financial-aid.service';

@Module({
  imports: [JwtModule.register({ secret: process.env['JWT_SECRET'] ?? 'dev-secret' })],
  controllers: [FinancialAidController],
  providers: [FinancialAidService],
  exports: [FinancialAidService],
})
export class FinancialAidModule {}
