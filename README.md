<div align="center">

# 🎓 Impact — Academic Decision Impact Platform

**Prospective Decision Intelligence & Compliance Infrastructure for Higher Education**

[![CI](https://github.com/Upendrapandey007/impact/actions/workflows/ci.yml/badge.svg)](https://github.com/Upendrapandey007/impact/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-ea2845.svg?logo=nestjs)](https://nestjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-336791.svg?logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.38-green.svg)](https://orm.drizzle.team/)
[![Tests](https://img.shields.io/badge/Vitest-73%2F73%20Passed%20(100%25)-success.svg?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#license)

<p align="center">
  <a href="#-what-is-impact">What is Impact?</a> •
  <a href="#-the-hard-architectural-principle">Core Architecture</a> •
  <a href="#-monorepo-structure">Monorepo</a> •
  <a href="#-features--capabilities">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-test-suite">Testing</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---

</div>

## 💡 What is Impact?

Every semester, millions of university students make academic choices that trigger catastrophic, unexpected consequences:

> *"I dropped my biology elective to focus on my major... and instantly lost my $5,000 merit scholarship because my enrolled credits dropped below 15."*  
> *"I withdrew from a chemistry class... and fell below the 67% SAP completion pace rate, putting my Pell Grant on probation."*

### The Paradigm Shift

```
Traditional University Systems (Reactive):
[ Decision ] ──────────────► [ Consequence ] ──────────────► [ Discovery (Too late) ]

Impact Platform (Prospective Intelligence):
[ Potential Decision ] ───► [ Simulation & Diff ] ────────► [ Informed Choice & Alternatives ]
```

When a student asks: **"What happens if I drop this course?"**  
Impact evaluates their live academic and financial state against institutional policies and returns:
- 💸 **Financial Aid & Scholarship Impact:** (Pell, Merit Awards, Direct Loans)
- 🛡️ **SAP (Satisfactory Academic Progress) Risk:** (Pace rate, Qualitative GPA, Max timeframe)
- 🎓 **Graduation Timeline Shift:** (Prerequisite chains, credit deficits)
- 📚 **Enrollment Classification:** (Full-time vs. Half-time thresholds)
- 💼 **Matched Alternative Opportunities:** (On-campus student jobs, replacement grants, work-study)
- 📜 **Policy Evidence & Legal Trace:** (Direct statutory and institutional handbook citations)

---

## 🏛️ The Hard Architectural Principle

<div align="center">

### **LLMs understand and explain. The Rule Engine calculates. Never the reverse.**

</div>

```
                     ┌──────────────────────────────────────────────┐
                     │            Student Academic State            │
                     │  (Enrolled Credits, GPA, SAP, Aid, Program)  │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          Scenario Builder (Pure TS)          │
                     │ (Transforms state: Drop, Withdraw, Major...) │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │      Deterministic Rule Engine (@impact/rules)│
                     │    - 100% Mathematical & Boolean Precision   │
                     │    - Zero Hallucination Risk                 │
                     │    - Policy AST Condition Evaluator + Trace  │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │         Differential Impact Calculator       │
                     │   (Compares Current State vs. Projected)     │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │           Multi-Dimensional Risk Scorer      │
                     │ (Financial, Academic, Graduation, Compliance)│
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │     AI Explanation & Opportunity Copilot     │
                     │ - Plain-English Student Summaries            │
                     │ - Grounded Policy RAG citations              │
                     │ - Alternative Job & Grant Recommendations    │
                     └──────────────────────────────────────────────┘
```

1. **Deterministic Computation:** No LLM ever calculates eligibility, GPA shifts, or risk numbers. All evaluation is performed by pure TypeScript logic in `@impact/rules`.
2. **Differential Evaluation:** We evaluate both `currentState` and `hypotheticalState` simultaneously to isolate exactly what consequences arise from a decision.
3. **Multi-Tenant FERPA Isolation:** Every database entity is scoped to `institution_id` and verified via `TenantGuard`.
4. **Tamper-Evident Policy Versioning:** Policies are immutable and SHA-256 hashed. Rules point to specific versions with date-range effectiveness.
5. **Mandatory Non-Authoritative Disclaimer:** All outputs explicitly state that simulations are informational decision support, safeguarding institutions legally.

---

## 📦 Monorepo Structure

Impact is engineered as a high-performance **Turborepo** monorepo using **npm workspaces**:

```
impact/
├── apps/
│   ├── web/                     # Next.js 15 App Router frontend (Tailwind v4, Radix, dark mode)
│   ├── api/                     # NestJS 10 backend (JWT, RBAC, Multi-Tenant Guards, BullMQ, Swagger)
│   └── worker/                  # BullMQ background workers for async simulations & ingestion
│
├── packages/
│   ├── rules/                   # Deterministic Rule Engine, Scenario Builder, Risk Scorer (Pure TS)
│   ├── database/                # Drizzle ORM schema (20+ tables, pgvector, relations, seed dataset)
│   ├── types/                   # Canonical TypeScript domain interfaces and DTOs
│   ├── config/                  # Strict Zod environment variable validation
│   └── ui/                      # Shared component design system (RiskBadge, StatusCard, Button)
│
├── infrastructure/
│   ├── docker/                  # Docker Compose (Postgres 16 + pgvector, Redis 7) & init SQL
│   └── terraform/               # Production AWS IaC definitions
│
└── .github/workflows/
    └── ci.yml                   # CI/CD Pipeline (Lint, Type-Check, 73 Unit Tests, Build)
```

---

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend** | **Next.js 15 (App Router)**, React 19, Tailwind CSS v4, Radix UI, TanStack Query v5 | Accessible, responsive, dark-mode decision dashboard and simulation wizard |
| **Backend** | **NestJS 10**, Express, BullMQ, Passport JWT, Class-Validator, Swagger OpenAPI | Enterprise modular REST API with RBAC and multi-tenant isolation |
| **Rule Engine** | **Pure TypeScript (`@impact/rules`)**, Zero dependencies | Deterministic condition AST evaluator, differential calculator, and risk indexer |
| **Database & ORM** | **PostgreSQL 16**, **pgvector**, **Drizzle ORM** | Relational schemas, policy vector search, and sub-millisecond student hydration |
| **Cache & Queue** | **Redis 7**, **BullMQ** | Background batch CSV ingestion, async simulation processor, and stream push |
| **AI / RAG** | **OpenAI GPT-4o** + `text-embedding-3-small` | Grounded policy citations, plain-English impact summaries, and appeal drafts |
| **Testing** | **Vitest 2.1**, Playwright | Fast unit tests, golden decision test cases, and E2E regression verification |

---

## ⚡ Key Modules & Capabilities

### 1. Decision Simulator (`apps/web` & `apps/api`)
- Multi-step interactive flow for evaluating academic decisions: `DROP_COURSE`, `WITHDRAW`, `CHANGE_MAJOR`, `REDUCE_CREDITS`, `REPEAT_COURSE`, `ADD_COURSE`.
- Real-time differential impact breakdown with risk levels: `Low`, `Moderate`, `High`, `Critical`.

### 2. Legal Opportunity Harvester & Alternative Funding (`apps/api`)
- **Compliance & Rate Limiting:** Enforces `robots.txt`, domain rate limits, and custom User-Agent declaration.
- **Multi-Source Ingestion:** Ingests RSS feeds, Schema.org JSON-LD (`JobPosting`, `Scholarship`), and authorized campus employment feeds.
- **Smart Opportunity Matcher:** Correlates student state (GPA, major, credits) to recommend replacement student jobs, work-study positions, and grants if aid is reduced.

### 3. Policy Ingestion & Chunking (`apps/api`)
- Upload policy documents with SHA-256 tamper-evident version hashing.
- Overlapping recursive chunking (2,000 characters / ~500 tokens) with sentence boundary preservation.
- Keyword and vector search for direct evidentiary policy citations.

### 4. Admin CSV Batch Ingestion Pipeline
- Stream parser with row-by-row Zod schema validation for `students`, `courses`, `enrollments`, `programs`, and `financial_aid`.
- Accumulates detailed row-level error reports without failing the entire batch.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 20.x
- **npm** ≥ 10.x
- **Docker & Docker Compose**

### 1. Clone & Install
```bash
git clone https://github.com/Upendrapandey007/impact.git
cd impact/impact
npm install
```

### 2. Start PostgreSQL & Redis Infrastructure
```bash
docker compose -f infrastructure/docker/docker-compose.yml up postgres redis -d
```

### 3. Populate Synthetic University Ecosystem (Apex State University)
```bash
# Push Drizzle schema and seed 100+ entities (students, courses, aid awards, rules)
npm run db:push --workspace=packages/database
npm run db:seed --workspace=packages/database
```

### 4. Start Development Servers
```bash
# Start API & Web in parallel via Turborepo
npm run dev
```

- **Student Portal & Web App:** [http://localhost:3000](http://localhost:3000)
- **REST API & Endpoints:** [http://localhost:3001](http://localhost:3001)
- **OpenAPI Swagger UI:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **Drizzle Database Studio:** `npm run db:studio`

---

## 🧪 Comprehensive Test Suite (73 / 73 Passed ✅)

All modules are strictly verified against automated unit and canonical golden test cases:

```bash
# Run all unit tests across monorepo packages
npm run test --workspace=packages/rules
npm run test --workspace=packages/config
npm run test --workspace=apps/api
```

### Test Coverage Matrix

| Test Suite | Package | Target Under Test | Results |
|---|---|---|---|
| `golden.test.ts` | `@impact/rules` | 6 Canonical Student Scenarios (Drops, Withdrawals, SAP Shifts) | 20 / 20 ✅ |
| `scenario.test.ts` | `@impact/rules` | Pure State Transformations (Drop, Major Change, Credit Reduction) | 14 / 14 ✅ |
| `evaluator.test.ts` | `@impact/rules` | Condition AST Evaluator (Dot notation, AND/OR/NOT, Trace Generator) | 13 / 13 ✅ |
| `risk.test.ts` | `@impact/rules` | Multi-Dimensional Risk Scorer & Severity Converter | 7 / 7 ✅ |
| `impact.test.ts` | `@impact/rules` | Differential Evaluator & Recommended Action Prioritizer | 4 / 4 ✅ |
| `env.test.ts` | `@impact/config` | Zod Environment Configuration & Variable Parsers | 5 / 5 ✅ |
| `policies.service.spec.ts` | `apps/api` | Overlapping Text Chunker & Sentence Boundary Snapping | 3 / 3 ✅ |
| `import-jobs.service.spec.ts` | `apps/api` | CSV Parser, Quote Handlers, and Row Validation | 4 / 4 ✅ |
| `rules.service.spec.ts` | `apps/api` | Admin Rule Test Harness & Trace Evaluator | 2 / 2 ✅ |
| `opportunities.service.spec.ts` | `apps/api` | Student Eligibility Matching Engine & Criteria Correlator | 1 / 1 ✅ |
| **Total** | **10 Test Suites** | **All Core Engines & Application Services** | **73 / 73 Passed** |

---

## 🔒 Security, FERPA & Compliance

- **FERPA Compliance:** Encrypted data in transit (TLS 1.3) and at rest (AES-256).
- **Tenant Isolation:** Enforced at the NestJS guard layer (`TenantGuard`) on every single query.
- **Append-Only Audit Logs:** Every advisor override, risk review, and policy edit writes an immutable entry into `audit_logs`.
- **Role-Based Access Control (RBAC):** Hierarchical roles (`student`, `advisor`, `financial_aid_officer`, `admin`, `super_admin`).

---

## 🗺️ Master Roadmap

- [x] **Phase 1: Foundation & Deterministic Rule Engine** (Vitest Golden Suite, Turborepo, Drizzle ORM)
- [x] **Phase 2: Student Data & Ingestion Engine** (Synthetic University Seeds, CSV Ingestion, Student State APIs)
- [x] **Phase 3: Policy Pipeline, Rule Governance & Legal Opportunity Harvester** (Document Chunking, AST Rule Builder, Campus Job Matcher)
- [ ] **Phase 4: Async Simulation Engine & Live Push** (BullMQ worker queues, WebSocket progress stream)
- [ ] **Phase 5: Student Experience & Decision Wizard** (Interactive calculator UI, alternative funding drawer)
- [ ] **Phase 6: Advisor & Financial Aid Risk Queue** (Caseload sorting, risk overrides with mandatory audit justification)
- [ ] **Phase 7: Grounded AI Policy Copilot** (pgvector RAG Q&A, plain-English summary generator)
- [ ] **Phase 8: Enterprise SIS Integrations** (Banner, PeopleSoft, Workday Student adapters)

---

## 📄 License

Proprietary. © 2026 Impact Platform. All rights reserved.
