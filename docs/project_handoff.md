# AI PM Copilot — Project Handoff

**Purpose:** Primary context for a new Cursor chat to continue development without loss.

**Last updated:** 2026-09-06  
**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Zod 4 + openai SDK (DeepSeek-compatible)

**Note:** `product_spec.md` was reconstructed at the repo root from implementation history. Prefer handoff + architecture + code when they diverge on status.

---

# 1. Project Goal

## What it is

**AI PM Copilot** is a web MVP for an **AI Product Manager portfolio**. It helps turn a vague product idea into a structured product workflow:

**Product Analysis → MVP Scope → Requirements → PRD Draft**

It is **not** a generic ChatGPT chat box. It is a structured AI product workflow tool.

## Target user

- Portfolio audience: hiring managers / reviewers evaluating AI PM craft
- In-product user metaphor: a product manager exploring an early idea

## Problem it solves

PMs often jump from a vague idea to features or a free-form PRD. This product forces:

1. Structured input  
2. Explicit analysis with provenance  
3. Prioritization judgment  
4. Testable requirements  
5. A PRD assembled from confirmed decisions  

## Core product principles

- **AI proposes. PM decides.**
- AI must not present inference as verified fact.
- AI must not silently invent missing information.
- **Human-in-the-loop** (especially plan review / edit in the demo product case).
- MVP validates only the **core hypothesis**.
- **PRD = Single Source of Truth assembly**, not a fresh LLM rewrite.
- Confirmed / edited stage outputs feed the next stage (Analysis + MVP gates implemented).

---

# 2. Current Product Workflow

```
Create Project (/create)
    ↓  POST /api/ai/product-analysis  (DeepSeek live, Prompt v2 FROZEN)
Product Analysis (workspace.analysis)
    ↓  analysisStatus = draft
Review / Edit / Confirm
    ↓  analysisStatus = confirmed
Explicit Generate MVP Scope
    ↓  POST /api/ai/mvp-scope  (DeepSeek live, Prompt v3 FROZEN; requires confirmed analysis)
MVP Scope Draft
    ↓  Review / Edit / Reprioritize / Confirm
mvpScopeStatus = confirmed
Requirements (workspace → requirements) ← still Mock
    ↓  intended: Review / Edit
PRD Draft (assemblePrd)              ← no LLM
```

| Stage | Status | Input | Output |
|-------|--------|-------|--------|
| Create Project | UI form | User fills fields | `ProjectInput` |
| Product Analysis | **Live DeepSeek** | `ProjectInput` | `ProductAnalysis` (Zod), `analysisStatus: draft` |
| Review / Edit / Confirm Analysis | **Implemented** | Draft analysis | Edits + Confirm → `confirmed` |
| MVP Scope | **Live DeepSeek** (explicit Generate) | ProjectInput + Confirmed Analysis | `MvpScope`, `mvpScopeStatus: draft`, `mvpScopeSource: live` |
| Review / Reprioritize / Confirm MVP | **Implemented** | Draft MVP | flags + Confirm → `confirmed` |
| Requirements | **Mock** | — | `Requirement[]` placeholder |
| PRD | **Assembly only** | `assemblePrd(workspace)` | `AssembledPrd` (no LLM) |

### Routes

| Route | Page |
|-------|------|
| `/` | Landing |
| `/create` | Create Project |
| `/workspace` | Product Workspace (sidebar sections) |
| `POST /api/ai/product-analysis` | Live Product Analysis API |
| `POST /api/ai/mvp-scope` | Live MVP Prioritization API (confirmed analysis required) |

After Analyze succeeds, client saves workspace via `createWorkspaceWithAnalysis()` (MVP starts as `none`) and navigates to `/workspace?section=analysis`.

---

# 3. Current AI Architecture

## Provider

- **LLM Provider:** DeepSeek  
- **SDK:** `openai` npm package with custom `baseURL`  
- **Client file:** `src/lib/ai/deepseek-client.ts`  

### Product Analysis

- **Runner:** `src/lib/ai/run-product-analysis.ts`  
- **Prompt:** `src/lib/ai/prompts/product-analysis.ts` (**Prompt v2 — FROZEN FOR CURRENT MVP**)  
- **API:** `src/app/api/ai/product-analysis/route.ts`

### MVP Prioritization

- **Runner:** `src/lib/ai/run-mvp-prioritization.ts`  
- **Prompt:** `src/lib/ai/prompts/mvp-prioritization.ts` (**Prompt v3 — FROZEN**)  
- **API:** `src/app/api/ai/mvp-scope/route.ts` (requires `analysisStatus: "confirmed"`)

## Stage wiring

| Stage | Implementation |
|-------|----------------|
| Product Analysis | Live DeepSeek + mock sample `analyzeProduct.ts` |
| MVP Scope | Live DeepSeek + mock sample `prioritizeMvp.ts` (sample only; live path starts `none`) |
| Requirements | Mock only: `generateRequirements.ts` |
| PRD | `assemblePrd.ts` — programmatic |

## Live call shape

DeepSeek Chat Completions + `response_format: { type: "json_object" }`, schema in prompt, then Zod (`ProductAnalysisSchema` / `MvpScopeSchema`). Invalid → error; no free-text passthrough.

## Workspace / pipeline helpers

- Types: `src/ai/types/*` (`WORKSPACE_SCHEMA_VERSION = 4`)
- Zod: `src/ai/schemas/product-analysis.ts`, `src/ai/schemas/mvp-scope.ts`
- Gates: `src/lib/analysis-gate.ts`
- Store: `src/lib/project-store.ts` (sessionStorage)

---

# 4. Environment Configuration

**Names only (never commit real secrets):**

```
DEEPSEEK_API_KEY
DEEPSEEK_MODEL
DEEPSEEK_BASE_URL
```

| File | Role |
|------|------|
| `.env.local` | Real local secrets (gitignored) |
| `.env.example` | Template only (`DEEPSEEK_MODEL=deepseek-v4-flash`, base URL example) |
| `.gitignore` | Ignores `.env` / `.env.*`, keeps `!.env.example` |

Default base URL in code if unset: `https://api.deepseek.com`.

Dev script for smoke tests (optional): `npm run test:analysis` → `scripts/test-product-analysis.ts`.

---

# 5. Data Contracts

## ProjectInput

- **TS:** `src/ai/types/project-input.ts`  
- **Zod:** `ProjectInputSchema` in `src/ai/schemas/product-analysis.ts`  
- Fields: `projectName`, `productIdea`, `targetUser`, `problem`, `businessGoal`, `constraints`

## ProductAnalysis

- **TS:** `src/ai/types/product-analysis.ts`  
- **Zod:** `ProductAnalysisSchema`  
- Fields: `targetUser` (segment, ageRange, goals[], behaviors[]), `coreProblem`, `painPoints[]`, `coreScenarios[]`, `productPositioning`, `assumptions[]`, `openQuestions[]`

## Evidence / provenance

- **TS:** `src/ai/types/evidence.ts`  
- **Zod:** `EvidenceSourceSchema` / `EvidenceFieldSchema`

```ts
source: "user_input" | "ai_inference" | "not_provided"
needsValidation: boolean
```

| Source | Meaning |
|--------|---------|
| `user_input` | Explicitly provided by PM |
| `ai_inference` | Cautious hypothesis from current input |
| `not_provided` | Absent from input (e.g. Age → `"Not provided"`); `needsValidation: false` |

**`needsValidation`:** Mark inferences that would materially affect product decisions. Prompt v2: this is **not** a license for unsupported specificity (“多数用户”, invented ages, etc.).

**Prompt v2 + `not_provided`:** Yes — live in schema, prompt, UI badges, mock adapter helper `fromNotProvided()`.

**Item-level provenance lists:** Goals, Behaviors, Pain Points, Core Scenarios, Assumptions, Open Questions (each item is `EvidenceField`). UI shows per-item badges in `AnalysisSection` (not section-level aggregates).

## MVP Scope

- **TS:** `src/ai/types/mvp-scope.ts`  
- `MvpScope`: `prioritizationLogic`, `tradeOffs`, `features[]`  
- Feature: `priority` P0/P1/P2, `category` `must_have` | `should_have` | `not_now`, `rationale`, `prioritizationBasis[]`

## Requirement

- **TS:** `src/ai/types/requirements.ts`  
- Includes `userStory`, inputs/actions, `systemBehavior`, `acceptanceCriteria` `{ given, when, then, and? }`, `edgeCases`, optional `missingInformation`

## Workspace

- **TS:** `src/ai/types/workspace.ts`  
- `ProjectWorkspace` version `WORKSPACE_SCHEMA_VERSION = 4`: `input`, `analysis`, `analysisStatus`, `mvpScope`, `mvpScopeStatus` (`none` \| `draft` \| `confirmed`), `mvpScopeSource` (`none` \| `mock` \| `live`), `requirements`, `prdSync`
- Evidence fields may include optional `editedByUser`
- MVP features may include optional `editedByUser` / `reprioritizedByUser`
- `MvpScope.coreHypothesis` — validation focus string

---

# 6. Current Product Decisions

1. **AI proposes. PM decides.**  
2. Inference ≠ fact; use provenance labels.  
3. Do not silently invent missing info (`not_provided` instead of fake demographics).  
4. Human-in-the-loop for the demo product’s plan acceptance.  
5. MVP only validates the core hypothesis: whether AI can turn goals / deadlines / available time into a useful structured study plan.  
6. PRD assembles upstream decisions (`Source: Product Analysis | MVP Scope | Requirements`).  
7. Next AI stages should consume **confirmed** snapshots, not ignore PM edits (architecture intent).

---

# 7. Current MVP Scope (demo case: AI Study Planner)

## P0 / Must Have

- **AI Study Plan Generator** — validates core generation value  
- **Plan Review & Edit** — human-in-the-loop: AI proposes, user decides  

## P1 / Should Have

- Daily Task Management  
- Adaptive Plan Adjustment  
- Smart Reminders  
- Progress Analytics  

## Not Now / P2

- Social Study Groups  
- Gamification  
- Course Marketplace  

## Why P0 was tightened

V1 only needs the minimum loop **generate → review → decide**. Daily views, adaptive rescheduling, reminders, and analytics are not required to validate the core hypothesis. Social / gamification / marketplace conflict with the planning-only constraint.

Mock source of truth for this list: `src/ai/pipeline/mock/prioritizeMvp.ts`.

---

# 8. Product Analysis Prompt History

## Prompt v1

- First live DeepSeek integration  
- Structured ProductAnalysis + `user_input` / `ai_inference` + `needsValidation`  
- Avoid invented personas / fake research  

**Eval:** `docs/eval_v1.md` — three cases, PASS WITH SYSTEMATIC ISSUES / NEEDS ITERATION

### Eval cases (do not replace in next regression)

1. **AI Study Planner**  
2. **AI Scam Call Assistant**  
3. **AI Inventory Planner**  

### Systematic issues from eval_v1.md

1. Missing info (e.g. Age) labeled as AI Inference  
2. Unsupported demographic inference (e.g. “约65岁以上”)  
3. Section-level provenance too coarse  
4. Needs Validation used as a license for unsupported claims (“多数…”)

## Prompt v2 (current live — FROZEN)

File: `src/lib/ai/prompts/product-analysis.ts`  
Docs: `docs/prompt_design.md` (v1 history preserved + v2 section)  
Eval: `docs/eval_v1.md` + `docs/regression_eval_v2.md` → **PASS / FROZEN FOR CURRENT MVP**

Do **not** create Prompt v3. Do **not** iterate Prompt further in this phase.

Changes:

- Added `not_provided`  
- Ban unsupported demographic completion  
- Cautious language (may / might / could / hypothesis)  
- Forbid “most/usually/typically/多数/通常” without evidence  
- Require item-level provenance on list items  
- UI: per-item badges including **Not Provided**

---

# 9. Current Eval Status

### Product Analysis

- Completed: **Prompt v1** human eval (`docs/eval_v1.md`)
- Completed: **Prompt v2** regression eval (`docs/regression_eval_v2.md`) — **PASS / FROZEN FOR CURRENT MVP**

### MVP Prioritization

- Completed: **Prompt v1** three-case eval (`docs/mvp_eval_v1.md`) — **PASS WITH SYSTEMATIC P0 BOUNDARY RISK / NEEDS ITERATION**
- Completed: **Prompt v2** regression (`docs/mvp_eval_v2.md`) — improved A/B/C; **PASS WITH UNDER-SCOPING RISK** on Cases 1 & 3
- Completed: **Prompt v3** regression (`docs/mvp_eval_v3.md`) — **3 / 3 PASS / FROZEN**
- Live prompt: **Prompt v3 — FROZEN** (Minimum User Value Loop; WoZ boundaries; two-stage Necessity Test)

Dimensions for MVP eval (1–5): **Relevance, Scope Discipline, Constraint Alignment, Rationale Quality, Consistency**

### Next product work

MVP Prioritization Prompt v3 is frozen.  
**Do not** wire Requirements LLM until product explicitly starts the Requirements stage.

---

# 10. Known Issues

1. DeepSeek JSON mode is softer than strict structured outputs; Zod rejects bad payloads.
2. MVP regenerate re-runs full prioritization then merges PM-protected features (not true per-feature regenerate).
3. Requirements still mock; Confirm MVP does not call Requirements LLM (by design).
4. Sample mock workspace can still show mock MVP; live Create Project path starts at `mvpScopeStatus: none` and must Generate.
5. MVP Prompt v1/v2/v3 evals complete; **Prompt v3 FROZEN**. Requirements LLM still not wired.

---

# 11. Next Exact Task

Product Analysis Prompt v2 remains **FROZEN FOR CURRENT MVP**.  
MVP Prioritization Prompt v3 is **FROZEN**.

Active track: wait for an explicit product decision before starting **Requirements LLM**.

**Do not** auto-start Requirements generation after Confirm MVP Scope.

---

# 12. Important Do Not Change

- Do not delete `docs/eval_v1.md`, `docs/mvp_eval_v1.md`, `docs/mvp_eval_v2.md`, or `docs/mvp_eval_v3.md`
- Do not overwrite Prompt v1 history in `docs/prompt_design.md` (Product Analysis or MVP)
- Do not loosen Zod validation to “accept anything”
- Do not put API keys in code or docs
- Do not create Product Analysis Prompt v3 / unfreeze Analysis Prompt v2 without an explicit product decision
- Do not unfreeze MVP Prioritization Prompt v3 / create v4 without an explicit product decision
- Do not wire Requirements LLM without confirmed MVP gate + explicit product go-ahead
- Do not redesign frozen UX (Landing / Create / Workspace sections) unless fixing a clear bug
- Do not turn PRD into an independent LLM generator

---

# Quick file map

| Concern | Path |
|---------|------|
| Handoff (this file) | `docs/project_handoff.md` |
| Architecture | `docs/ai_architecture.md` |
| Prompt history | `docs/prompt_design.md` |
| Eval v1 | `docs/eval_v1.md` |
| DeepSeek client | `src/lib/ai/deepseek-client.ts` |
| Analysis runner | `src/lib/ai/run-product-analysis.ts` |
| Analysis prompt v2 | `src/lib/ai/prompts/product-analysis.ts` |
| Analysis API | `src/app/api/ai/product-analysis/route.ts` |
| Analysis UI | `src/components/workspace/AnalysisSection.tsx` |
| Create form | `src/components/create/ProjectForm.tsx` |
| PRD assembly | `src/ai/prd/assemblePrd.ts` |
| Mock MVP / Requirements | `src/ai/pipeline/mock/*` |

---

# Consistency check (handoff vs code)

Verified against current repo before writing:

- DeepSeek env names and client path  
- Live Analysis API only; MVP/Requirements mock; PRD assembly  
- Evidence enum includes `not_provided`  
- Prompt file documents v2  
- P0 feature names match `prioritizeMvp.ts`  
- `product_spec.md` absent (called out)  
- Next task = v2 regression eval, not MVP LLM  

End of handoff.
