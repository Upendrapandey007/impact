---
description: Core architectural invariants, patterns, and guidelines for the Impact platform
globs: "**/*"
---

# Impact — Academic Decision Impact Platform Guidelines

## 1. Core Mission & Invariants

- **Product Purpose:** Impact provides prospective decision intelligence for higher education ("What happens if I drop this course / withdraw / change major?").
- **CRITICAL INVARIANT — LLM ≠ Decision Engine:** 
  - The LLM is used **strictly** to extract user intent and generate human-readable explanations.
  - **Deterministic Rule Engine (`packages/rules`)** must perform 100% of calculations for eligibility, credits, SAP status, graduation shifts, and risk levels. LLMs must NEVER independently calculate or determine eligibility.
- **Differential Evaluation:** Always evaluate both `currentState` and `hypotheticalState` and report the diff (Rule → Data → Result).
- **Mandatory Disclaimer:** All simulations must include the disclaimer that results are informational decision support and not official institutional determinations.

---

## 2. Monorepo Architecture

- **`packages/rules`**: Pure TypeScript (zero framework deps). Contains `RuleEngine`, `ConditionEvaluator`, `ScenarioBuilder`, `ImpactCalculator`, and `RiskScorer`. Tested via Vitest golden cases.
- **`packages/database`**: Drizzle ORM with 20+ tables, relational schemas (`relations()`), and PostgreSQL 16 + pgvector support.
- **`packages/types`**: Canonical TypeScript domain models (`StudentState`, `Impact`, `RiskScores`, `SimulationResult`, etc.).
- **`packages/config`**: Zod-based environment variable validation for API and Web.
- **`packages/ui`**: Shared design system components (`RiskBadge`, `StatusCard`, `Button`).
- **`apps/api`**: NestJS 10 modular backend with JWT auth, `TenantGuard` multi-tenant isolation, BullMQ queues, and Swagger OpenAPI documentation.
- **`apps/web`**: Next.js 15 App Router with Tailwind CSS v4, dark-mode glassmorphism aesthetics, accessible risk indicators, and simulation explorer.

---

## 3. Key Development Guidelines

1. **Multi-Tenancy:** Every tenant-owned database record must include `institution_id`. All API routes must enforce tenant scoping via `TenantGuard`.
2. **Policy Versioning:** Policy versions are immutable and append-only. Rules reference specific policy versions with effective date ranges.
3. **Audit Logging:** Every advisor override, note, or administrative modification must write an immutable entry to `audit_logs`.
4. **Golden Test Suite:** Any modification to `packages/rules` must pass the entire test suite (`npm run test --workspace=packages/rules`).
5. **Accessibility (WCAG 2.2 AA):** Never convey risk via color alone; always combine color with text labels and status icons (`RiskBadge`).
