# Impact — Master Implementation Roadmap & Task Lists

> **Project:** Impact (Academic Decision Impact Platform)  
> **Status:** Phase 1 Complete (Foundation & Core Rule Engine)  
> **Tracking:** Live execution checklist

---

## 🟢 Phase 1: Foundation & Core Engine (Completed ✅)

- [x] Turborepo monorepo setup (`apps/web`, `apps/api`, `apps/worker`, `packages/*`)
- [x] Shared TypeScript base configs & strict type checking
- [x] Docker Compose (PostgreSQL 16 + pgvector, Redis 7) & init SQL
- [x] `@impact/types`: Canonical domain models (`StudentState`, `Impact`, `RiskScores`, `SimulationResult`, `Opportunity`)
- [x] `@impact/config`: Zod environment validation for API & Web
- [x] `@impact/database`: Drizzle ORM schema with 20+ tables & relational mappings (including `opportunities` & `opportunity_sources`)
- [x] `@impact/rules`: Deterministic Rule Engine, Scenario Builder, Impact Calculator, Risk Scorer
- [x] Vitest Golden Test Suite (33/33 passing tests covering course drops, withdrawals, SAP pace rate, credit reductions)
- [x] `@impact/ui`: Design system tokens and accessible components (`RiskBadge`, `StatusCard`, `Button`)
- [x] `apps/api`: NestJS bootstrap, JWT auth, `TenantGuard`, BullMQ queues, Swagger docs
- [x] `apps/web`: Next.js 15 App Router skeleton with dark-mode theme & student dashboard

---

## 📋 Phase 2: Student Data & Ingestion Engine (Sprints 3–4)

### Sprint 3: Database Migrations & CSV Ingestion Pipeline
- [x] **Database Setup & Seeds:**
  - [x] Write DB seed script with synthetic university data (Apex State University scenario: students Alex Brown/Sarah Kim/John Doe, courses BIO/CHEM/CS/MATH, programs, terms, rules, and scraped opportunities)
  - [x] Configure Drizzle migration & push scripts (`npm run db:push` / `npm run db:seed`)
- [x] **CSV Import Service:**
  - [x] Build CSV parser & validator for `students`, `courses`, `enrollments`, `financial_aid`, `programs`
  - [x] Implement row-by-row validation with structured error reporting (row number, field, issue)
  - [x] Implement batch CSV import REST endpoints (`POST /api/v1/import-jobs/csv`, `GET /api/v1/import-jobs/:id`)
- [ ] **Admin Import UI:**
  - [ ] File upload drag-and-drop component with format detection
  - [ ] Pre-import data preview table with validation badges
  - [ ] Real-time progress bar & error log download

### Sprint 4: Student State APIs & Canonical Transformer
- [x] **Student Data REST Endpoints:**
  - [x] `GET /api/v1/students/me` (Hydrated profile with enrollments, aid, SAP)
  - [x] `GET /api/v1/students/:id` (Advisor view with academic standing)
  - [x] `GET /api/v1/students/:id/enrollments` (Current term course roster)
  - [x] `GET /api/v1/students/:id/financial-aid` (Disbursed vs accepted breakdown)
  - [x] `GET /api/v1/students/:id/sap` (Historical pace rate & qualitative GPA)
- [x] **Canonical Student State Builder:**
  - [x] Database query transformer for constructing `StudentState` snapshots
  - [x] Fallback calculation for unrecorded SAP metrics

---

## 📋 Phase 3: Policy Pipeline, Rule Governance & Legal Opportunity Harvester (Sprints 5–6)

### Sprint 5: Policy Document Ingestion & Chunking
- [x] **Document Storage & Text Extraction:**
  - [x] Policy document upload and versioning endpoints (`POST /api/v1/policies`, `POST /api/v1/policies/:id/versions`)
  - [x] Recursive text chunker utility preserving sentence and section boundaries
  - [x] SHA-256 document hashing for tamper-evident policy versioning
- [x] **Vector Store & Indexing:**
  - [x] Recursive text chunker (2000 chars / ~500 tokens with overlap)
  - [x] Policy chunk citation search endpoint (`GET /api/v1/policies/:versionId/chunks?q=...`)
  - [x] Policy version lifecycle state management

### Sprint 6: Rule Builder & Legal Opportunity Harvester
- [x] **Rule Management Backend:**
  - [x] CRUD endpoints for deterministic policy rules (`GET/POST /api/v1/rules`)
  - [x] Rule versioning with effective date intervals (`effectiveFrom`, `effectiveTo`)
  - [x] Admin Rule Test Harness (`POST /api/v1/rules/:id/test`) with execution trace output
- [x] **Legal Opportunity Scraping & Ingestion Engine (Scholarships & Jobs):**
  - [x] **Robots & Policy Compliance Layer:** Feed source registry (`opportunity_sources` table) with rate limiting and robots.txt URLs
  - [x] **Multi-Source Ingestion Pipeline:**
    - [x] Opportunity sources REST endpoints (`POST /api/v1/opportunities/sources`, `GET /api/v1/opportunities/sources`)
    - [x] Opportunity catalog API (`GET /api/v1/opportunities`)
  - [x] **Opportunity Matching Engine:**
    - [x] Student profile matcher (`GET /api/v1/opportunities/match/:studentId`) evaluating GPA, enrolled credits, and major requirements
    - [x] Content SHA-256 deduplication and score ranking

---

## 📋 Phase 4: Full Simulation Engine & Real-Time Push (Sprint 7)

### Sprint 7: Simulation Queue, Differential Orchestrator & Opportunity Matcher
- [ ] **Async Worker Optimization:**
  - [ ] BullMQ simulation job queue with concurrency controls & timeout handling
  - [ ] WebSocket Gateway (`/simulations/stream`) for real-time progress & instant result push
- [ ] **Expanded Scenario Builders:**
  - [ ] `CHANGE_MAJOR`: Program prerequisite matching & remaining credit recalculation
  - [ ] `REPEAT_COURSE`: Grade replacement vs cumulative averaging rules
  - [ ] `DELAY_GRADUATION`: Term sequence mapping for course availability
- [ ] **Opportunity Matching Engine:**
  - [ ] Automatic matching of student state against scraped scholarship & job database
  - [ ] Deterministic match scoring (identifying eligible replacements if aid/scholarship is lost)
- [ ] **Audit Trail Integration:**
  - [ ] Automatic audit log generation on every simulation run, scraping execution, and advisor review

---

## 📋 Phase 5: Student Experience & Decision Calculator UI (Sprint 8)

### Sprint 8: Student Portal & Interactive Simulation Flow
- [x] **Decision Calculator Wizard (`/simulate`):**
  - [x] Multi-step interactive decision flow: Decision Type ➔ Target Course/Major ➔ Context ➔ Simulation
  - [x] Live course selectors with credit badges and department tags
  - [x] Target credit load range slider for `REDUCE_CREDITS` scenarios
- [x] **Differential Impact Visualizer (`/simulate/:id`):**
  - [x] High-contrast 4-tier risk status header (`Low`, `Moderate`, `High`, `Critical`)
  - [x] Expandable Rule ➔ Data ➔ Result accordion cards with policy citations
  - [x] Recommended action priority list with direct contact advisor triggers
- [x] **"Explore Funding Alternatives" Drawer:**
  - [x] Slide-over drawer with matched on-campus student jobs, work-study positions, and replacement scholarships
  - [x] Filter tabs (`All`, `Student Jobs`, `Scholarships & Grants`) with match percentage indicators
  - [x] Direct application external link buttons
- [ ] **Mobile Optimization & WCAG 2.2 AA Compliance:**
  - [ ] Touch-friendly card gestures & bottom sheets for mobile browsers
  - [ ] Screen reader focus management & ARIA live regions for calculation updates

---

## 📋 Phase 6: Advisor & Financial Aid Portal (Sprint 9)

### Sprint 9: Risk Queue & Case Management
- [ ] **Advisor Risk Queue:**
  - [ ] Multi-dimensional sorting & filtering (by Risk Level, Major, SAP Status, Aid Type)
  - [ ] At-a-glance cohort metrics (Critical / High / Moderate counts)
- [ ] **Student Detail & Simulation Replay:**
  - [ ] Advisor view of student profile with full simulation timeline
  - [ ] Interactive note taking (Internal vs Shared with Student)
  - [ ] Opportunity recommendation dispatch (advisor can directly recommend matched job or scholarship to student)
  - [ ] Formal Risk Override mechanism with mandatory justification and audit logging
- [ ] **Financial Aid Workflows:**
  - [ ] SAP warning queue for impending term reviews
  - [ ] Appeal eligibility checklist and document upload manager

---

## 📋 Phase 7: AI Copilot & Policy Explanation Layer (Sprint 10)

### Sprint 10: Grounded AI Services
- [ ] **RAG Policy Q&A:**
  - [ ] Semantic search over policy chunks using pgvector cosine similarity
  - [ ] Strict grounding prompt: Answer only with policy excerpts or return low-confidence fallback
  - [ ] Redis caching for repeated questions
- [ ] **Plain-English Impact & Alternative Funding Summaries:**
  - [ ] Conversion of deterministic rule engine outputs into personalized student-friendly summaries
  - [ ] AI-powered alternative funding path explanation ("If you drop to 12 credits, applying for On-Campus Research Assistant #402 covers the $1,500 gap")
  - [ ] AI Appeal Drafting Assistant based on student questionnaire responses

---

## 📋 Phase 8: Production Hardening & Enterprise Integration (Post-MVP)

- [ ] FERPA data retention policy enforcement & scheduled purge jobs
- [ ] SIS Integration Adapters: CSV → Banner / PeopleSoft / Workday Student schema mapping
- [ ] Multi-tenant custom branding & institutional white-labeling
- [ ] Playwright E2E test suite covering full student decision journey & opportunity exploration
- [ ] Production Terraform infrastructure deployment on AWS (ECS Fargate + RDS + ElastiCache)
