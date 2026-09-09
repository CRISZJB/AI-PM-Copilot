# AI Architecture — AI PM Copilot

This document defines the **AI Workflow** and **structured data contract** used by the product.

Product Analysis runs through a live DeepSeek adapter (`src/lib/ai/run-product-analysis.ts`).
MVP Prioritization runs through a live DeepSeek adapter (`src/lib/ai/run-mvp-prioritization.ts`) **only after** Product Analysis is confirmed, and only when the PM explicitly clicks Generate MVP Scope.
Requirements run through a live DeepSeek adapter (`src/lib/ai/run-requirements.ts`) **only after** Analysis + MVP are confirmed, and only when the PM explicitly clicks Generate Requirements.
PRD is **not** an LLM stage: `assemblePrd` → `mergePrd(PrdOverride)` → Workspace / Markdown export.

---

## Core workflow

```
Project Input
    ↓
DeepSeek Product Analysis     ← AI proposes (Prompt v2 FROZEN)
    ↓
Draft → Review / Edit → Confirm
    ↓
Confirmed Product Analysis    ← only this may feed MVP AI
    ↓
Explicit "Generate MVP Scope"
    ↓
DeepSeek MVP Prioritization   ← Prompt v3 FROZEN (uses confirmed analysis + PM edits)
    ↓
Draft MVP Scope
    ↓
PM Review / Edit / Reprioritize
    ↓
Confirm MVP Scope
    ↓
Confirmed MVP Scope           ← only this may feed Requirements AI
    ↓
Explicit "Generate Requirements"
    ↓
DeepSeek Requirements         ← Prompt v2 FROZEN
    ↓
PRD v2 (no LLM)
    assemblePrd(workspace)           ← read-only projection
         + PrdOverride (PM only)     ← independent storage
         → mergePrd → PrdDocument
         → PRD Workspace / prdToMarkdown
```

### Principles

1. **AI only does reasoning stages** — Analysis, MVP Prioritization, Requirements.
2. **PRD does not call an LLM.** It projects upstream decisions and merges PM supplement.
3. **Confirmed data is the source of truth for the next stage.**  
   After the PM edits Analysis or MVP, the next AI stage must consume those confirmed snapshots — not ignore edits and regenerate from the raw idea alone.
4. **Decision consistency & traceability** — PRD sections label their source stage.
5. **Human-in-the-loop gates** — Analysis and MVP each use `draft` / `confirmed`; edit after confirm returns to `draft`.
6. **Product Analysis Prompt v2 is FROZEN** — do not create Prompt v3 yet.
7. **MVP Prioritization Prompt v3 is FROZEN** — consumes Confirmed Product Analysis (including PM Edited values).
8. **Requirements Prompt v2 is FROZEN** — do not auto-run after Confirm MVP.
9. **Do not auto-generate MVP on Analysis Confirm** — PM must explicitly Generate.
10. **PrdOverride must not write back** Analysis / MVP / Requirements.

---

## 1. Product Analysis

### Input

`ProjectInput`

| Field | Meaning |
|-------|---------|
| `projectName` | Product name |
| `productIdea` | Idea description |
| `targetUser` | Stated audience |
| `problem` | Stated problem |
| `businessGoal` | Goal / success intent |
| `constraints` | Scope constraints |

### Output

`ProductAnalysis`

Evidence-aware fields use (`EvidenceField` in `src/ai/types/evidence.ts`; Zod: `EvidenceFieldSchema` in `src/ai/schemas/product-analysis.ts`):

```ts
{
  value: string
  source: "user_input" | "ai_inference" | "not_provided"
  needsValidation: boolean
  editedByUser?: boolean  // set by app after PM edits; optional for LLM output
}
```

#### Analysis review status (workspace, not LLM)

Stored on `ProjectWorkspace.analysisStatus`:

| Status | Meaning |
|--------|---------|
| `draft` | After live AI generation, after edits, or after regenerate — awaiting PM confirm |
| `confirmed` | PM locked analysis; allowed as context for future MVP Prioritization AI |

Rules:

- First DeepSeek generation → `draft`
- Confirm Analysis → `confirmed`
- Any save of edits (including after confirmed) → back to `draft`
- Downstream gate: `getConfirmedAnalysis(workspace)` throws unless `confirmed`

Helpers: `src/lib/analysis-gate.ts`, store actions in `src/lib/project-store.ts`.

#### Provenance `source` (Prompt v2 / current schema)

| Source | Meaning |
|--------|---------|
| `user_input` | Information the PM explicitly provided |
| `ai_inference` | A hypothesis or inference based on existing context — not a verified fact |
| `not_provided` | The PM did not provide this information; the AI must **not** invent a fill-in |

#### `needsValidation`

- Marks whether an **AI inference** still needs follow-up product validation.
- `not_provided` is **not** the same as `needsValidation`.
- For `not_provided`, use a value like `"Not provided"` and set `needsValidation: false`.

#### Item-level provenance (Prompt v2)

These list fields are arrays of `EvidenceField` and should carry provenance **per item**, not only at section level:

- Goals (`targetUser.goals`)
- Behaviors (`targetUser.behaviors`)
- Pain Points (`painPoints`)
- Core Scenarios (`coreScenarios`)
- Assumptions (`assumptions`)
- Open Questions (`openQuestions`)

Scalar evidence fields (`segment`, `ageRange`, `coreProblem`, `productPositioning`) also use the same three-state `source`.

Includes:

- `targetUser` (segment, ageRange, goals, behaviors)
- `coreProblem`
- `painPoints[]`
- `coreScenarios[]`
- `productPositioning`
- `assumptions[]`
- `openQuestions[]`

### Stage adapter

- Live (current): `src/lib/ai/run-product-analysis.ts` via DeepSeek (`src/lib/ai/deepseek-client.ts`); prompt: `src/lib/ai/prompts/product-analysis.ts` (**Prompt v2 FROZEN**)
- API: `POST /api/ai/product-analysis`
- Mock fallback / sample: `src/ai/pipeline/mock/analyzeProduct.ts`
- Interface: `AnalysisStage.run(input) → ProductAnalysis`
- Runtime validation: `ProductAnalysisSchema` (Zod) — invalid payloads are rejected

---

## 2. MVP Prioritization

### Input

1. `ProjectInput`
2. **Confirmed** `ProductAnalysis` (`analysisStatus === "confirmed"`), including PM Edited field values

MVP must **not** re-run Product Analysis from the raw idea alone.

### Output

`MvpScope` (`src/ai/types/mvp-scope.ts`, Zod: `MvpScopeSchema`)

- `coreHypothesis` — V1 validation focus (hypothesis language, not verified fact)
- `prioritizationLogic[]`
- `tradeOffs[]`
- `features[]` where each feature has:
  - `id`, `name`, `description`
  - `priority`: `P0` | `P1` | `P2`
  - `category`: `must_have` | `should_have` | `not_now` (must match priority)
  - `rationale`
  - `prioritizationBasis[]` enum
  - optional `editedByUser` / `reprioritizedByUser` (app-only)

### Workspace review status

- `mvpScopeStatus`: `none` | `draft` | `confirmed`
- `mvpScopeSource`: `none` | `mock` | `live`
- Live Create Project path starts at `none` (empty scope) until explicit Generate
- Sample / offline mock pipeline may still use `mock` source — never mix mock + live features in one list

### Stage adapter

- Live: `src/lib/ai/run-mvp-prioritization.ts` (DeepSeek); prompt: `src/lib/ai/prompts/mvp-prioritization.ts` (**Prompt v3 — FROZEN**)
- API: `POST /api/ai/mvp-scope` — rejects unless `analysisStatus === "confirmed"` **before** calling DeepSeek
- Mock sample / fallback: `src/ai/pipeline/mock/prioritizeMvp.ts`
- Interface: `MvpStage.run(input, confirmedAnalysis) → MvpScope`
- Runtime validation: `MvpScopeSchema` — invalid payloads are rejected (no Markdown-as-source)

### UI gate

- Confirm Analysis does **not** auto-call MVP
- PM clicks **Generate MVP Scope** → Draft
- Edit / Reprioritize → Draft (marks PM flags)
- **Confirm MVP Scope** → Confirmed (does not call Requirements LLM)

---

## 3. Requirements Generation

### Input

1. `ProjectInput`
2. **Confirmed** `ProductAnalysis`
3. **Confirmed** `MvpScope`

Typically scoped to `must_have` / `P0` features.

### Output

`Requirement[]`

Each requirement includes:

- `id`, `featureName`, `priority`
- `userStory` `{ asA, iWant, soThat }`
- `requiredInputs` / `optionalInputs` / `userActions`
- `systemBehavior[]`
- `acceptanceCriteria[]` as `{ given, when, then, and? }`
- `missingInformation?`
- `edgeCases[]`

### Stage adapter

- Live (current): `src/lib/ai/run-requirements.ts` via DeepSeek; prompt: `src/lib/ai/prompts/requirements.ts` (**Prompt v2 FROZEN**)
- API: `POST /api/ai/requirements` — requires confirmed Analysis **and** confirmed MVP
- Mock sample / fallback: `src/ai/pipeline/mock/generateRequirements.ts`
- Interface: `RequirementsStage.run(input, confirmedAnalysis, confirmedMvp) → Requirement[]`
- Runtime validation: Requirements Zod schemas — invalid payloads are rejected

### UI gate

- Confirm MVP does **not** auto-call Requirements
- PM clicks **Generate Requirements** / **Regenerate**
- There is **no** Requirements Confirm status machine (by design)

---

## 4. PRD v2 (no LLM)

PRD is a **projection + PM supplement**, not a generation step.

### Pipeline

```
assemblePrd(workspace) → AssembledPrd     (read-only; from input/analysis/mvp/requirements)
PrdOverride                               (PM-only; sessionStorage, not ProjectWorkspace)
mergePrd(assembled, override) → PrdDocument
prdToMarkdown(document) → download / copy
```

### AssembledPrd (`src/ai/prd/assemblePrd.ts`)

- Reads `input`, `analysis`, `mvpScope`, `requirements`, `prdSync`
- Adds projected fields such as `constraints`, `prioritizationLogic`, `tradeOffs`
- Builds HITL-oriented `aiBehaviorRules` and display `risks`
- Must **not** invent personas, re-prioritize MVP, or invent acceptance criteria

### PrdOverride (PM layer)

Minimal fields:

- `successMetrics`
- `validationPlan`
- `openDecisions`
- `pmNotes`

Stored in `src/lib/prd-override-store.ts` under key `ai-pm-copilot-prd-override-v1`, isolated by normalized `projectName`.

**Must not** write back Analysis / MVP / Requirements.

### UI

- `PRDSection` = PRD Workspace: read-only assembly + editable PM supplement
- Save / Download Markdown / Copy Markdown via `mergePrd` → `prdToMarkdown`
- `markPrdSynced()` updates `prdSync` meta only when PM marks reviewed

If upstream confirmed data changes, `prdSync` becomes **outdated** until the PM reviews — the document must not silently overwrite itself; PM override is retained.

---

## 5. Confirmed data flows forward

| After PM action | Stored as | Used by next stage |
|-----------------|-----------|--------------------|
| Generate Analysis | `analysis` + `analysisStatus: draft` | — (await confirm) |
| Edit Analysis | `analysis` (+ `editedByUser`) + `analysisStatus: draft` | — (must re-confirm) |
| Confirm Analysis | `analysisStatus: confirmed` | Enables explicit MVP Generate |
| Generate MVP | `mvpScope` + `mvpScopeStatus: draft` + `mvpScopeSource: live` | — (await confirm) |
| Edit / Reprioritize MVP | `mvpScope` (+ flags) + `mvpScopeStatus: draft` | — (must re-confirm) |
| Confirm MVP | `mvpScopeStatus: confirmed` | Enables explicit Requirements Generate |
| Generate Requirements | `workspace.requirements` | PRD assembly |
| Save PRD Override | independent sessionStorage | merge / export only |
| Mark PRD synced | `prdSync.syncStatus: up-to-date` | — |

Gate helpers: `src/lib/analysis-gate.ts` (`getConfirmedAnalysis`, `getConfirmedMvpScope`).

Live Requirements and sample mock regeneration must call confirmed snapshots — never ignore PM edits.

---

## 6. Code map

```
src/ai/
  types/                 ← AI Contract (TypeScript)
  schemas/               ← Zod (Analysis / MVP / Requirements)
  pipeline/mock/         ← Sample / offline adapters
  prd/
    assemblePrd.ts       ← Deterministic assembly
    override-types.ts    ← PrdOverride / PrdDocument
    mergePrd.ts
    toMarkdown.ts
    empty-override.ts
  index.ts

src/lib/
  prd-override-store.ts  ← PM Override sessionStorage
  project-store.ts       ← Workspace + markPrdSynced
  analysis-gate.ts

docs/ai_architecture.md  ← This file
```

Workspace shape: `ProjectWorkspace` (`src/ai/types/workspace.ts`) — **does not** embed PRD body or Override.

---

## 7. Live vs mock (current status)

| Stage | Status |
|-------|--------|
| Product Analysis | **Live DeepSeek** (Prompt **v2 FROZEN** + Zod). Review / Edit / Confirm gate. |
| MVP Prioritization | **Live DeepSeek** (Prompt **v3 FROZEN** + Zod). Explicit Generate; Draft / Confirm gate. Mock retained for sample only. |
| Requirements | **Live DeepSeek** (Prompt **v2 FROZEN** + Zod). Explicit Generate. Mock retained for sample only. |
| PRD | **assemblePrd + PrdOverride + Markdown export** — **no LLM** |

**Do not** create Product Analysis Prompt v3. **Do not** unfreeze MVP Prompt v3 or Requirements Prompt v2 without an explicit decision. **Do not** auto-run Requirements after Confirm MVP. **Do not** turn PRD into an LLM generator.
