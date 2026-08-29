import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    JwtModule.register({ secret: process.env['JWT_SECRET'] ?? 'dev-secret' }),
    StudentsModule,
  ],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}
