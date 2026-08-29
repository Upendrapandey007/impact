# Impact — Workspace Memory & Guidelines

## Core Principles
1. **Decision Intelligence Layer:** Impact models the consequences of academic decisions (Drop, Withdraw, Change Major, Reduce Credits) before they occur.
2. **Deterministic Computation (Hard Rule):** All calculations for eligibility, SAP standing, graduation shift, and risk scores reside exclusively in the `@impact/rules` package. LLMs are strictly used for natural language intent parsing and plain-English explanation generation.
3. **Differential Evaluation:** Simulation logic operates by comparing `currentState` against `hypotheticalState` to isolate changes.
4. **Tenant Isolation & FERPA:** All data access is scoped to `institution_id`. Advisor actions are audited in `audit_logs`.

## Monorepo Layout
- `apps/web`: Next.js 15 (App Router) + Tailwind v4 + Radix UI
- `apps/api`: NestJS 10 + JWT + BullMQ + OpenAPI Swagger
- `packages/rules`: Pure TypeScript deterministic decision engine
- `packages/database`: Drizzle ORM + Postgres 16 + pgvector
- `packages/types`: Shared domain interfaces
- `packages/config`: Zod environment validation
- `packages/ui`: Shared design system
