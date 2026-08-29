# Impact — Workspace Memory & Architectural Guidelines

> **Project:** Impact (Academic Decision Impact Platform)  
> **Repository:** https://github.com/Upendrapandey007/impact  
> **Status:** All MVP Sprints (1 through 10) Complete & Verified (82/82 Tests Passing)

---

## 1. Core Mission & Invariants

1. **Prospective Decision Intelligence:**  
   Impact replaces retrospective consequence discovery with prospective simulation. Before a student drops a course, withdraws, or changes majors, Impact models the downstream consequences on Financial Aid, Scholarships, SAP compliance, and Graduation timeline.

2. **CRITICAL INVARIANT — LLM ≠ Decision Engine:**  
   - All calculations for eligibility, credits, SAP pace rate, GPA shifts, graduation delays, and risk scores **reside exclusively in `@impact/rules`**.
   - LLMs are strictly used for natural language intent parsing, grounded policy Q&A, and plain-English explanation generation. Never for mathematical calculations.

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
│   ├── api/                     # NestJS 10 REST API + JWT + TenantGuard + BullMQ + Swagger + AI Copilot
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
    └── ci.yml                   # CI/CD Pipeline (Lint, Type-Check, 82 Unit Tests, Build)
```

---

## 3. What Has Been Completed & Verified (All 10 Sprints ✅)

1. **Phase 1: Foundation & Deterministic Rule Engine (Sprints 1–2)**
   - Pure TypeScript condition evaluator with dot notation, numeric/string/boolean comparisons, and composite AND/OR/NOT conditions.
   - Scenario transformations: `DROP_COURSE`, `WITHDRAW`, `CHANGE_MAJOR`, `REDUCE_CREDITS`, `ADD_COURSE`, `FAIL_COURSE`.
   - Differential impact calculation and 4-tier risk indexer (`low`, `moderate`, `high`, `critical`).
   - 6 canonical golden test scenarios.

2. **Phase 2: Student Data & Ingestion Engine (Sprints 3–4)**
   - **Apex State University** synthetic seed dataset with students (Alex Brown, Sarah Kim, John Doe), courses (BIO, CS, CHEM, MATH), aid packages, SAP records, and active policy rules.
   - Batch CSV import service with row-by-row validation and error tracking (`POST /api/v1/import-jobs/csv`).
   - Student profile hydration and history REST endpoints (`GET /api/v1/students/me`, `enrollments`, `financial-aid`, `sap`).

3. **Phase 3: Policy Pipeline, Rule Governance & Legal Opportunity Harvester (Sprints 5–6)**
   - Policy document upload with SHA-256 version hashing and recursive text chunker (`POST /api/v1/policies`, `POST /api/v1/policies/:id/versions`).
   - Admin Rule Test Harness (`POST /api/v1/rules/:id/test`) evaluating AST conditions in real-time with step-by-step trace generation.
   - **Legal Opportunity Scraping & Ingestion Engine**:
     - Feed source registry with rate limiting and `robots.txt` compliance URLs (`POST/GET /api/v1/opportunities/sources`).
     - Opportunity catalog API (`GET /api/v1/opportunities`).
     - Smart Opportunity Matcher (`GET /api/v1/opportunities/match/:studentId`) correlating student GPA, credits, and major against scholarships and campus jobs.

4. **Phase 4: Full Simulation Engine & Live Push (Sprint 7)**
   - BullMQ simulation queue worker (`SimulationProcessor`) with priority controls and error handling.
   - Fast in-memory preview simulation endpoint (`POST /api/v1/simulations/preview`).
   - Immutable audit logging on all simulation executions.

5. **Phase 5: Student Experience & Decision Calculator UI (Sprint 8)**
   - Interactive Decision Calculator Wizard on `/simulate`: Decision Select → Course/Target Select → Context → Simulation.
   - **"Explore Funding Alternatives"** slide-over drawer displaying matched student jobs & replacement scholarships with match scores and direct application links.
   - High-contrast differential impact views with expandable Rule → Data → Result traces.

6. **Phase 6: Advisor & Financial Aid Risk Queue (Sprint 9)**
   - Advisor caseload risk queue (`GET /api/v1/advisor/risk-queue`) with multi-dimensional filtering and cohort summary metrics.
   - Advisor student simulation timeline (`GET /api/v1/advisor/students/:id`).
   - Note-taking with shared visibility (`POST /api/v1/advisor/students/:id/notes`).
   - Formal Risk Override mechanism (`POST /api/v1/advisor/simulations/:id/override`) with mandatory justification and audit trail.
   - Direct opportunity recommendation dispatch (`POST /api/v1/advisor/students/:id/recommend-opportunity`).

7. **Phase 7: Grounded AI Policy Copilot & Plain-English Explanations (Sprint 10)**
   - Grounded Policy Q&A (`POST /api/v1/ai/policy-qa`) with confidence scoring and explicit low-confidence fallback.
   - Plain-English simulation explainer (`POST /api/v1/ai/explain-simulation`) translating calculations into empathetic guidance.
   - Formal institutional appeal letter generator (`POST /api/v1/ai/draft-appeal`) for SAP and scholarship petitions.

8. **Testing Suite (82 / 82 Tests Passed ✅)**
   - `@impact/rules`: 58 tests (`evaluator`, `scenario`, `risk`, `impact`, `golden`)
   - `@impact/config`: 5 tests (`env`)
   - `apps/api`: 19 tests (`import-jobs`, `policies`, `opportunities`, `rules`, `simulations`, `advisor`, `ai`)
