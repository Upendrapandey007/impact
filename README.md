<div align="center">

# 🎓 Impact — Academic Decision Impact Platform

**Prospective Decision Intelligence & Compliance Infrastructure for Higher Education**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-ea2845.svg?logo=nestjs)](https://nestjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-336791.svg?logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.38-green.svg)](https://orm.drizzle.team/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#license)

<p align="center">
  <a href="#-why-impact-was-created">Why Impact Was Created</a> •
  <a href="#-how-it-works--system-flow">System Flow</a> •
  <a href="#-the-hard-architectural-principle">Core Architectural Principle</a> •
  <a href="#-technologies--languages-used">Languages & Tech Stack</a> •
  <a href="#-core-capabilities">Capabilities</a>
</p>

---

</div>

## 💡 Why Impact Was Created

Every semester in higher education, thousands of students make routine academic choices that trigger sudden, catastrophic consequences:

- A student drops a single elective to focus on harder classes — and immediately loses a **$5,000 institutional merit scholarship** because their credit load dropped below 15.
- A student withdraws from a prerequisite — and unknowingly falls below the **67% federal Satisfactory Academic Progress (SAP) completion pace rate**, causing their Pell Grant to be suspended.
- A student changes their major — and discovers too late that their expected graduation is delayed by two full semesters.

### The Problem in Traditional Systems

In existing university Student Information Systems (SIS), discovery is purely **reactive**:

```
Traditional University Systems (Reactive):
[ Student Decision ] ───────► [ Hidden Consequence ] ───────► [ Discovery (Too Late to Fix) ]
```

### The Impact Solution

Impact converts retrospective consequence discovery into **prospective decision intelligence**:

```
Impact Platform (Prospective Intelligence):
[ Potential Decision ] ─────► [ Deterministic Simulation ] ─► [ Immediate Diff & Alternatives ]
```

Before an academic decision is officially submitted, Impact evaluates the student's live academic and financial state against institutional policies to show exactly what will happen — giving students and advisors the insights needed to make informed choices.

---

## 🔄 How It Works — System Flow

```
                               ┌────────────────────────────────┐
                               │   Student Potential Decision   │
                               │ (Drop, Withdraw, Change Major) │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │     Student State Snapshot     │
                               │ (Credits, GPA, Aid, SAP, Term) │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │    Scenario State Generator    │
                               │  (Constructs Hypothetical State│
                               │      without mutating real DB) │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │   Deterministic Rule Engine    │
                               │  (Evaluates AST Policy Rules:  │
                               │   Scholarships, Pell, SAP, GPA)│
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │ Differential Impact Calculator │
                               │ (Isolates exact state changes: │
                               │  Current vs. Projected Diff)   │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │  Multi-Dimensional Risk Scorer │
                               │ (Financial, Academic, Progress)│
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │   Alternative Funding Matcher  │
                               │ (Recommends replacement campus │
                               │   jobs, work-study, and grants)│
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │      AI Explanation Layer      │
                               │ (Plain-English student summary │
                               │   + direct policy citations)   │
                               └────────────────────────────────┘
```

---

## 🏛️ The Hard Architectural Principle

<div align="center">

### **LLMs understand and explain. The Rule Engine calculates. Never the reverse.**

</div>

1. **Deterministic Accuracy (Zero Hallucination):** No language model ever computes financial aid amounts, GPA projections, or compliance standing. 100% of calculations reside in a pure, deterministic TypeScript rule engine.
2. **Differential Evaluation:** Rather than asking general eligibility questions, Impact evaluates `currentState` and `hypotheticalState` simultaneously to isolate the exact delta.
3. **Multi-Tenant FERPA Isolation:** Every query and data access is strictly partitioned by `institution_id` with audit logging on all actions.
4. **Tamper-Evident Policy Traceability:** Institutional rules link directly to SHA-256 hashed policy versions, providing explicit citations for every decision consequence.
5. **Non-Authoritative Informational Support:** All results are delivered as advisory decision support, ensuring institutional compliance.

---

## 💻 Technologies & Languages Used

Impact is built end-to-end with **TypeScript** across the entire stack for type safety, modularity, and maintainability:

```
                                  IMPACT PLATFORM
   ┌─────────────────────────────────────┬─────────────────────────────────────┐
   │             FRONTEND                │               BACKEND               │
   │  • TypeScript (ES2022)              │  • TypeScript (Node.js 20+)         │
   │  • Next.js 15 (App Router)          │  • NestJS 10 Framework              │
   │  • React 19                         │  • Express & Passport JWT           │
   │  • Tailwind CSS v4                  │  • BullMQ & Redis 7                 │
   │  • Radix UI Design Tokens           │  • Drizzle ORM                      │
   │  • TanStack Query v5                │  • PostgreSQL 16 + pgvector         │
   └─────────────────────────────────────┴─────────────────────────────────────┘
                                         │
                                         ▼
   ┌───────────────────────────────────────────────────────────────────────────┐
   │                        DETERMINISTIC RULE ENGINE                          │
   │  • Pure TypeScript (@impact/rules) — Zero Framework Dependencies          │
   │  • AST Condition Evaluator & Trace Generator                              │
   │  • Multi-Dimensional Weighted Risk Scorer                                 │
   └───────────────────────────────────────────────────────────────────────────┘
```

### Technology Breakdown

| Component | Language / Framework | Description |
|---|---|---|
| **Primary Language** | **TypeScript 5.7** | Strongly-typed language across web, backend, and calculation engines |
| **Frontend Application** | **Next.js 15 + React 19** | High-performance user interfaces with server and client components |
| **Styling & Design System** | **Tailwind CSS v4 + Radix UI** | Modern, accessible UI design with dark-mode glassmorphic aesthetics |
| **Backend REST API** | **NestJS 10** | Modular, enterprise-grade architecture with dependency injection and RBAC |
| **Rule Engine** | **Pure TypeScript (`@impact/rules`)** | Deterministic mathematical calculation layer with zero external dependencies |
| **Database & Vector Store** | **PostgreSQL 16 + pgvector** | Relational data persistence, tenant isolation, and vector similarity search |
| **Object-Relational Mapping**| **Drizzle ORM** | Type-safe SQL query builder and relational schema definitions |
| **Queuing & Cache** | **Redis 7 + BullMQ** | Asynchronous job queues for ingestion and heavy simulation pipelines |
| **Validation Layer** | **Zod & Class-Validator** | Runtime validation for environment configurations and API payloads |
| **Test Framework** | **Vitest** | Automated unit testing and golden decision verification suites |

---

## ⚡ Core Capabilities

### 1. Prospective Decision Simulator
Simulates the downstream effects of multiple academic decisions before they are finalized:
- **Course Drop:** Calculates credit load changes, scholarship minimums, and full-time status.
- **Term Withdrawal:** Projects financial aid return-to-Title-IV (R2T4) risks and transcript marks.
- **Major Change:** Identifies transfer credit retention, missing prerequisites, and graduation timeline shifts.
- **Credit Reduction:** Highlights threshold boundaries (e.g., dropping below 12 credits for full-time aid).

### 2. Multi-Dimensional Risk Scoring
Categorizes decision consequences into intuitive risk indicators (`Low`, `Moderate`, `High`, `Critical`) across four dimensions:
- **Financial Risk:** Loss of Pell, institutional scholarships, or loans.
- **Academic Progress Risk:** GPA shifts and prerequisite invalidations.
- **SAP Compliance Risk:** Quantitative completion pace rate and maximum timeframe.
- **Graduation Risk:** Semester delays and credit deficits.

### 3. Alternative Funding & Opportunity Matcher
When a simulated decision leads to financial aid or scholarship loss, the platform automatically scans available opportunities to recommend viable alternatives:
- On-campus student jobs and teaching assistantships matching student major and available hours.
- State and institutional replacement grants.
- Work-study positions to bridge financial shortfalls.

### 4. Policy Versioning & Evidence Citations
Institutional policies are versioned with effective date ranges. For every identified consequence, Impact produces a transparent **Rule → Data → Result** explanation citing the specific institutional catalog or policy section.

---

## 📄 License

Proprietary. © Impact Platform. All rights reserved.
