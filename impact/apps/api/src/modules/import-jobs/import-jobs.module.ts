import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ImportJobsController } from './import-jobs.controller';
import { ImportJobsService } from './import-jobs.service';

@Module({
  imports: [JwtModule.register({ secret: process.env['JWT_SECRET'] ?? 'dev-secret' })],
  controllers: [ImportJobsController],
  providers: [ImportJobsService],
  exports: [ImportJobsService],
})
export class ImportJobsModule {}
