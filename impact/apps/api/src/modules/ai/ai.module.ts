import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [JwtModule.register({ secret: process.env['JWT_SECRET'] ?? 'dev-secret' })],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
