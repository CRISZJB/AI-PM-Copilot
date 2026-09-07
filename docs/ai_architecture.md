# AI Architecture — AI PM Copilot

This document defines the **AI Workflow** and **structured data contract** used by the product.

Product Analysis runs through a live DeepSeek adapter (`src/lib/ai/run-product-analysis.ts`).
MVP Prioritization runs through a live DeepSeek adapter (`src/lib/ai/run-mvp-prioritization.ts`) **only after** Product Analysis is confirmed, and only when the PM explicitly clicks Generate MVP Scope.
Requirements still use mock adapters until that stage is wired.
PRD remains programmatic assembly only (no LLM).

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
Confirmed MVP Scope           ← only this may feed future Requirements AI
    ↓
Requirements Generation       ← still Mock
    ↓
PRD Assembly                  ← Programmatic only (no LLM)
```

### Principles

1. **AI only does reasoning stages** — Analysis, MVP Prioritization, Requirements.
2. **PRD does not call an LLM.** It reads confirmed decisions and assembles a document.
3. **Confirmed data is the source of truth for the next stage.**  
   After the PM edits Analysis or MVP, the next AI stage must consume those confirmed snapshots — not ignore edits and regenerate from the raw idea alone.
4. **Decision consistency & traceability** — PRD sections label their source stage.
5. **Human-in-the-loop gates** — Analysis and MVP each use `draft` / `confirmed`; edit after confirm returns to `draft`.
6. **Product Analysis Prompt v2 is FROZEN FOR CURRENT MVP** — do not create Prompt v3 yet.
7. **MVP Prioritization must not re-analyze the raw idea** — it consumes Confirmed Product Analysis (including PM Edited values).
8. **Do not auto-generate MVP on Analysis Confirm** — PM must explicitly Generate.

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

- Live (current): `src/lib/ai/run-product-analysis.ts` via DeepSeek (`src/lib/ai/deepseek-client.ts`); prompt: `src/lib/ai/prompts/product-analysis.ts` (**Prompt v2**)
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

- Mock: `src/ai/pipeline/mock/generateRequirements.ts`
- Interface: `RequirementsStage.run(input, confirmedAnalysis, confirmedMvp) → Requirement[]`

---

## 4. Why PRD does not call an LLM

PRD is a **projection**, not a generation step.

`assemblePrd(workspace)` in `src/ai/prd/assemblePrd.ts`:

- Reads `input`, `analysis`, `mvpScope`, `requirements`
- Organizes them into a readable PRD document
- Adds sync metadata only

It must **not**:

- invent a new persona
- re-decide MVP priority
- invent new acceptance criteria

If upstream confirmed data changes, the PRD becomes **outdated** until the PM reviews and syncs — it should not silently overwrite itself.

---

## 5. Confirmed data flows forward

| After PM action | Stored as | Used by next stage |
|-----------------|-----------|--------------------|
| Generate Analysis | `analysis` + `analysisStatus: draft` | — (await confirm) |
| Edit Analysis | `analysis` (+ `editedByUser`) + `analysisStatus: draft` | — (must re-confirm) |
| Confirm Analysis | `analysisStatus: confirmed` | Enables explicit MVP Generate |
| Generate MVP | `mvpScope` + `mvpScopeStatus: draft` + `mvpScopeSource: live` | — (await confirm) |
| Edit / Reprioritize MVP | `mvpScope` (+ flags) + `mvpScopeStatus: draft` | — (must re-confirm) |
| Confirm MVP | `mvpScopeStatus: confirmed` | Future Requirements via `getConfirmedMvpScope()` |
| Edit Requirements | `workspace.requirements` | PRD Assembly |

Gate helpers: `src/lib/analysis-gate.ts` (`getConfirmedAnalysis`, `getConfirmedMvpScope`).

Helper for re-running requirements after MVP edits (still mock):

`regenerateRequirementsFromConfirmed(workspace)`

Future Requirements LLM must call `getConfirmedAnalysis` + `getConfirmedMvpScope` first.

---

## 6. Code map

```
src/ai/
  types/                 ← AI Contract (TypeScript)
  pipeline/mock/         ← Mock adapters (swap for LLM later)
  prd/assemblePrd.ts     ← Deterministic PRD assembly
  index.ts               ← Public exports

docs/ai_architecture.md  ← This file
```

Workspace shape: `ProjectWorkspace` (`src/ai/types/workspace.ts`)

---

## 7. Live vs mock (current status)

| Stage | Status |
|-------|--------|
| Product Analysis | **Live DeepSeek** (Prompt **v2 FROZEN FOR CURRENT MVP** + Zod). Review / Edit / Confirm gate. |
| MVP Prioritization | **Live DeepSeek** (Prompt **v3 FROZEN** + Zod). Explicit Generate; Draft / Confirm gate. Mock retained for sample only. |
| Requirements | **Mock** — `src/ai/pipeline/mock/generateRequirements.ts` |
| PRD | **Assembly only** — `assemblePrd` (no LLM) |

When wiring Requirements LLM later, keep Analysis + MVP contracts and gates. Do **not** turn PRD into an LLM generator.

**Do not** create Product Analysis Prompt v3. **Do not** unfreeze MVP Prioritization Prompt v3 without an explicit decision. **Do not** auto-run Requirements after Confirm MVP.
