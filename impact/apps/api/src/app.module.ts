import { Module } from '@nestjs/common';

import { AdminModule } from './modules/admin/admin.module';
import { AdvisorModule } from './modules/advisor/advisor.module';
import { AiModule } from './modules/ai/ai.module';
import { AppealsModule } from './modules/appeals/appeals.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { FinancialAidModule } from './modules/financial-aid/financial-aid.module';
import { ImportJobsModule } from './modules/import-jobs/import-jobs.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { PoliciesModule } from './modules/policies/policies.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { RisksModule } from './modules/risks/risks.module';
import { RulesModule } from './modules/rules/rules.module';
import { SapModule } from './modules/sap/sap.module';
import { SimulationsModule } from './modules/simulations/simulations.module';
import { StudentsModule } from './modules/students/students.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './providers/database.module';
import { QueueModule } from './providers/queue.module';

@Module({
  imports: [
    // ─── Infrastructure ────────────────────────────────────────────────────
    DatabaseModule,
    QueueModule,

    // ─── Domain Modules ────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    InstitutionsModule,
    StudentsModule,
    CoursesModule,
    ProgramsModule,
    EnrollmentsModule,
    FinancialAidModule,
    SapModule,
    PoliciesModule,
    RulesModule,
    OpportunitiesModule,
    SimulationsModule,
    RisksModule,
    AppealsModule,
    NotificationsModule,
    AuditModule,
    ImportJobsModule,

    // ─── Portal-specific Modules ───────────────────────────────────────────
    AdvisorModule,
    AdminModule,
    AiModule,
  ],
})
export class AppModule {}
