# Impact — Workspace Memory & Architectural Guidelines

> **Project:** Impact (Academic Decision Impact Platform)  
> **Repository:** https://github.com/Upendrapandey007/impact  
> **Status:** Phases 1, 2, and 3 Complete & Verified (73/73 Tests Passing)

---

## 1. Core Mission & Invariants

1. **Prospective Decision Intelligence:**  
   Impact replaces retrospective consequence discovery with prospective simulation. Before a student drops a course, withdraws, or changes majors, Impact models the downstream consequences on Financial Aid, Scholarships, SAP compliance, and Graduation timeline.

2. **CRITICAL INVARIANT — LLM ≠ Decision Engine:**  
   - All calculations for eligibility, credits, SAP pace rate, GPA shifts, graduation delays, and risk scores **reside exclusively in `@impact/rules`**.
   - LLMs are strictly used for natural language intent parsing and plain-English explanation generation. Never for calculation.

3. **Differential Evaluation (Diff-First):**  
   Simulations operate by evaluating both `currentState` and `hypotheticalState` simultaneously to isolate the exact consequences (Rule → Data → Result).

4. **Multi-Tenant Isolation & FERPA:**  
   - All data is partitioned by `institution_id` and verified via `TenantGuard`.
   - Immutable audit logs (`audit_logs` table) track all advisor overrides and administrative actions.

5. **Tamper-Evident Policy Traceability:**  
   Policy versions are immutable and SHA-256 hashed. Rules link to specific versions with date-range effectiveness.

---

## 2. Monorepo Architecture & Layout

```
impact/
├── apps/
│   ├── web/                     # Next.js 15 (App Router) + React 19 + Tailwind CSS v4 + Radix UI
│   ├── api/                     # NestJS 10 REST API + JWT + TenantGuard + BullMQ + Swagger
│   └── worker/                  # BullMQ background worker for async simulations and CSV ingestion
│
├── packages/
│   ├── rules/                   # Deterministic Rule Engine, Condition AST Evaluator, ScenarioBuilder, RiskScorer (Pure TS)
│   ├── database/                # Drizzle ORM schema (20+ tables, pgvector, relations, Apex State University seed)
│   ├── types/                   # Canonical domain interfaces (StudentState, Impact, Opportunity, RiskScores)
│   ├── config/                  # Strict Zod environment variable validation
│   └── ui/                      # Shared design system components (RiskBadge, StatusCard, Button)
│
├── infrastructure/
│   └── docker/                  # Docker Compose (PostgreSQL 16 + pgvector, Redis 7) & init SQL
│
└── .github/workflows/
    └── ci.yml                   # CI/CD Pipeline (Lint, Type-Check, 73 Unit Tests, Build)
```

---

## 3. What Has Been Completed & Verified

1. **Phase 1: Foundation & Deterministic Rule Engine**
   - Pure TypeScript condition evaluator with dot notation, numeric/string/boolean comparisons, and composite AND/OR/NOT conditions.
   - Scenario transformations: `DROP_COURSE`, `WITHDRAW`, `CHANGE_MAJOR`, `REDUCE_CREDITS`, `ADD_COURSE`, `FAIL_COURSE`.
   - Differential impact calculation and 4-tier risk indexer (`low`, `moderate`, `high`, `critical`).
   - 6 canonical golden test scenarios.

2. **Phase 2: Student Data & Ingestion Engine**
   - **Apex State University** synthetic seed dataset with students (Alex Brown, Sarah Kim, John Doe), courses (BIO, CS, CHEM, MATH), aid packages, SAP records, and active policy rules.
   - Batch CSV import service with row-by-row validation and error tracking (`POST /api/v1/import-jobs/csv`).
   - Student profile hydration and history REST endpoints (`GET /api/v1/students/me`, `enrollments`, `financial-aid`, `sap`).

3. **Phase 3: Policy Pipeline, Rule Governance & Legal Opportunity Harvester**
   - Policy document upload with SHA-256 version hashing and recursive text chunker (`POST /api/v1/policies`, `POST /api/v1/policies/:id/versions`).
   - Admin Rule Test Harness (`POST /api/v1/rules/:id/test`) evaluating AST conditions in real-time with step-by-step trace generation.
   - **Legal Opportunity Scraping & Ingestion Engine**:
     - Feed source registry with rate limiting and `robots.txt` compliance URLs (`POST/GET /api/v1/opportunities/sources`).
     - Opportunity catalog API (`GET /api/v1/opportunities`).
     - Smart Opportunity Matcher (`GET /api/v1/opportunities/match/:studentId`) correlating student GPA, credits, and major against scholarships and campus jobs.

4. **Testing Suite (73 / 73 Tests Passed ✅)**
   - `@impact/rules`: 58 tests
   - `@impact/config`: 5 tests
   - `apps/api`: 10 tests

---

## 4. Next Step When Resuming

- **Phase 5 (Sprint 8): Student Experience & Interactive Decision Calculator Wizard in Next.js (`apps/web`)**
  - Multi-step interactive flow on `/simulate`: Decision Select → Course/Target Select → Reason → Real-time Differential Impact.
  - Expandable impact cards with Rule → Data → Result trace and policy citations.
  - **"Explore Funding Alternatives"** drawer displaying matched student jobs & replacement scholarships.
