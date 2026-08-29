# Impact — Academic Decision Impact Platform

> **Simulate academic decisions. Understand the consequences. Make informed choices.**

Impact connects to a university's student and financial-aid systems and evaluates the consequences of academic decisions before they happen.

---

## What It Does

A student asks: _"What happens if I drop this course?"_

Impact evaluates their current state against the institution's rules and returns:

- Financial aid impact (Pell, scholarships, loans)
- SAP (Satisfactory Academic Progress) impact
- Graduation timeline impact
- Enrollment status impact
- Recommended actions
- Policy citations (Rule → Data → Result)

---

## Architecture

```
Student Decision
      ↓
  Simulation Engine
      ↓
  Rule Engine (deterministic — LLM never decides)
      ↓
  Impact Calculator (differential evaluation)
      ↓
  Risk Scorer
      ↓
  Explanation Generator (AI — grounded in rule output)
```

**The hard architectural principle:**  
LLMs understand and explain. The Rule Engine calculates. Never the reverse.

---

## Monorepo Structure

```
impact/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   ├── api/          # NestJS backend
│   └── worker/       # BullMQ background workers
├── packages/
│   ├── rules/        # Rule engine (pure TS — zero framework deps)
│   ├── database/     # Drizzle ORM schema + migrations
│   ├── types/        # Shared TypeScript types
│   ├── config/       # Environment validation (Zod)
│   └── ui/           # Shared component library
├── infrastructure/
│   ├── docker/       # Docker Compose + Dockerfiles
│   └── terraform/    # AWS infrastructure (IaC)
└── .github/workflows/ # CI/CD pipelines
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui |
| Data fetching | TanStack Query v5 |
| Backend | NestJS + TypeScript |
| ORM | Drizzle ORM |
| Database | PostgreSQL 16 + pgvector |
| Cache / Queue | Redis + BullMQ |
| Auth | NextAuth.js + WorkOS |
| AI | OpenAI API (GPT-4o) |
| Testing | Vitest + Playwright |

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- Docker + Docker Compose
- npm ≥ 10

### 1. Clone and install

```bash
git clone https://github.com/your-org/impact.git
cd impact
npm install
```

### 2. Start infrastructure

```bash
docker compose -f infrastructure/docker/docker-compose.yml up postgres redis -d
```

### 3. Configure environment

```bash
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
# Edit both files — at minimum set JWT_SECRET and NEXTAUTH_SECRET
```

### 4. Run database migrations

```bash
npm run db:migrate
```

### 5. Start development

```bash
npm run dev
```

- **Web:** http://localhost:3000
- **API:** http://localhost:3001
- **Swagger:** http://localhost:3001/api/docs

---

## Rule Engine

The rule engine lives in `packages/rules` and is a **pure TypeScript** module with zero framework dependencies.

```typescript
import { RuleEngine } from '@impact/rules';

const engine = new RuleEngine(rules);

const result = engine.simulate(studentState, 'DROP_COURSE', {
  courseId: 'BIO201',
});
// → { overallRisk: 'high', impacts: [...], recommendedActions: [...] }
```

### Golden Tests

Every PR runs against the full golden test case library:

```bash
npm run test --workspace=packages/rules
```

Coverage threshold: **85%** lines, **85%** functions, **80%** branches.

---

## Development Commands

```bash
# Run all tests
npm run test

# Type check everything
npm run type-check

# Lint everything
npm run lint

# Build all packages
npm run build

# Database Studio (Drizzle)
npm run db:studio

# E2E tests
npm run test:e2e --workspace=apps/web
```

---

## Key Design Decisions

1. **LLM ≠ Decision Engine.** The rule engine makes all eligibility determinations. AI only interprets and explains.

2. **Differential Evaluation.** Instead of asking "is the student eligible?", the engine asks "what changed between current state and hypothetical state?" This makes explanations dramatically clearer.

3. **Policy Versioning.** Policies are never overwritten. Every policy has a version history with effective dates. Historical simulations are always evaluated against the policy in effect at that time.

4. **Tenant Isolation.** Every query is scoped to `institution_id`. The `TenantGuard` enforces this at the NestJS layer.

5. **Audit Everything.** Every advisor action is written to the append-only `audit_logs` table.

6. **The Disclaimer.** Every simulation result displays: _"This simulation is informational only and does not constitute an official financial-aid determination."_ This is a non-negotiable product requirement.

---

## Portals

| Portal | Users | URL prefix |
|---|---|---|
| Student | Students | `/dashboard`, `/simulate` |
| Advisor | Academic advisors | `/advisor` |
| Financial Aid | FA officers | `/financial-aid` |
| Admin | Institution admins | `/admin` |

---

## Roadmap

- **MVP (Sprint 1–10):** Student simulation, advisor risk queue, CSV import, rule engine, AI explanation
- **Phase 2:** Withdraw, repeat, fail, change major simulations; Banner/Workday integration
- **Phase 3:** Natural language interface ("What if I drop biology?")
- **Phase 4:** Proactive risk detection — system detects risk before student asks

---

## FERPA & Security

This platform handles sensitive student education records. Key requirements:

- All data encrypted in transit (TLS) and at rest
- Tenant isolation enforced at every query
- Role-based access control (Student / Advisor / FA Officer / Admin / Super Admin)
- Audit log for every advisor action
- Configurable data retention per institution
- MFA support via WorkOS
- Penetration testing before enterprise launch

---

## License

Proprietary. All rights reserved.
