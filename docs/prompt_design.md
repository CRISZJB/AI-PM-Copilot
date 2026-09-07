# Product Analysis Prompt Design

## Product Analysis Prompt v1

### 1. Goal

Help a PM turn sparse Project Input into a structured early-stage Product Analysis that:

- organizes what the user already said
- proposes careful hypotheses
- separates `user_input` from `ai_inference`
- flags items that still need validation

The model must not invent user research, market stats, or named personas.

### 2. Input

`ProjectInput`:

- `projectName`
- `productIdea`
- `targetUser`
- `problem`
- `businessGoal`
- `constraints`

Prompt source (historical): `src/lib/ai/prompts/product-analysis.ts` at v1

### 3. Output schema

Runtime schema: `ProductAnalysisSchema` in `src/ai/schemas/product-analysis.ts`

Matches TypeScript contract `ProductAnalysis` in `src/ai/types/product-analysis.ts`.

Key shape:

- `targetUser` (segment, ageRange, goals[], behaviors[])
- `coreProblem`
- `painPoints[]`
- `coreScenarios[]`
- `productPositioning`
- `assumptions[]`
- `openQuestions[]`

Each evidence field:

```ts
{
  value: string
  source: "user_input" | "ai_inference"
  needsValidation: boolean
}
```

Delivered via DeepSeek Chat Completions JSON Output (`response_format: json_object`), then validated with `ProductAnalysisSchema`. No Markdown-as-source-of-truth parsing.

### 4. Why distinguish `user_input` / `ai_inference`

PMs need to know what was stated versus what the model proposed.

Without provenance labels, AI output looks like verified research and overstates certainty.

### 5. Why `needsValidation`

Inferences that would change prioritization, positioning, or MVP bets should be marked for follow-up research.

This supports the product principle: **AI proposes. PM decides.**

### 6. Risks observed in v1 (from eval_v1.md)

- Missing information (e.g. age) mislabeled as `ai_inference`
- Unsupported demographic completion (e.g. inventing "约65岁以上")
- Section-level provenance mixed user input and inference in one badge group
- `needsValidation` did not prevent overconfident claims like "多数用户"

### 7. Version history

| Version | Date | Notes |
|---------|------|-------|
| v1 | 2026-09-06 | First live Product Analysis integration |

---

## Product Analysis Prompt v2

### Why v2

Based on three cross-domain eval cases in `docs/eval_v1.md`:

1. AI Study Planner
2. AI Scam Call Assistant
3. AI Inventory Planner

Systematic issues:

1. **Missing information misclassification** — absent age marked as AI Inference
2. **Unsupported demographic inference** — inventing age bands like "约65岁以上"
3. **Coarse provenance** — section-level badges hid item-level sources
4. **Validation labels as license** — "多数用户" style claims despite Needs Validation

Status after v1 eval: **NEEDS ITERATION** → Prompt v2.

### v2 goals

- Add explicit `not_provided` provenance
- Forbid unnecessary demographic completion
- Prefer cautious inference language (may / might / could / hypothesis)
- Require item-level provenance on list items
- Clarify that Needs Validation does not allow unsupported specificity

### Source enum (v2)

```ts
source: "user_input" | "ai_inference" | "not_provided"
```

| Source | Meaning |
|--------|---------|
| `user_input` | Explicitly provided by the PM |
| `ai_inference` | Cautious hypothesis based on current input |
| `not_provided` | Absent from input — value like "Not provided"; `needsValidation: false` |

### Item-level provenance

Already supported by schema arrays of `EvidenceField`. Prompt v2 requires each list item to carry its own `source` / `needsValidation`. UI shows per-item badges (no section-level aggregate).

### Prompt source

Current live prompt: `src/lib/ai/prompts/product-analysis.ts` (**v2**)

### Remaining risks (v2)

- Models may still occasionally invent soft stereotypes despite instructions
- `not_provided` compliance depends on model following Prompt v2
- Multilingual inputs remain lightly tested

### Version history (continued)

| Version | Date | Notes |
|---------|------|-------|
| v2 | 2026-09-06 | Eval-driven: not_provided, demographic ban, item-level provenance, cautious language |
| v2 | 2026-09-06 | Regression eval PASS — **FROZEN FOR CURRENT MVP** (do not create v3 yet) |

---

## MVP Prioritization Prompt v1

### Goal

Recommend the **minimum** MVP feature set needed to validate the core product hypothesis, using **Confirmed Product Analysis** (including PM Edited values) plus Project Input constraints.

This stage must **not** re-run Product Analysis or invent a new target user / core problem / positioning.

### Input

1. `ProjectInput`
2. Confirmed `ProductAnalysis` (`analysisStatus === "confirmed"`)

### Output

Structured `MvpScope` validated by `MvpScopeSchema`:

- `coreHypothesis`
- `prioritizationLogic[]`
- `tradeOffs[]`
- `features[]` with P0/P1/P2 ↔ must_have/should_have/not_now

### Downstream

Only **Confirmed MVP Scope** (`mvpScopeStatus === "confirmed"`) may feed future Requirements Generation.

Requirements LLM is **not** wired yet.

### Prompt source

`src/lib/ai/prompts/mvp-prioritization.ts`

### API

`POST /api/ai/mvp-scope` — rejects unconfirmed analysis before any DeepSeek call.

### Version history

| Version | Date | Notes |
|---------|------|-------|
| v1 | 2026-09-06 | First live MVP Prioritization; validation-first P0; confirmed-analysis gate |

### Risks observed in v1 (from mvp_eval_v1.md)

Three cases (Study Planner, Scam Call Assistant, Inventory Planner) found P0 boundary instability:

1. **Pattern A** — Validation / Measurement mechanisms promoted to P0 (e.g. completion tracking, post-call outcome confirmation) because Business Goals mentioned related metrics
2. **Pattern B** — Production Implementation Mechanisms promoted to P0 (e.g. one-click real-call guarding) even when prototypes / WoZ could validate core value
3. **Pattern C** — Explicit-constraint minimum Guardrails sometimes under-prioritized (e.g. data incompleteness warning as P1)

Status after three-case eval: iterate to Prompt v2. Keep v1 eval history.

---

## MVP Prioritization Prompt v2

### Why v2

Address Failure Patterns A/B/C from `docs/mvp_eval_v1.md` without changing Schema, API, or Human-in-the-loop gates.

### v2 core additions

1. **Classify before prioritize** — Product Capability / UX·Implementation Mechanism / Validation Method / Measurement Mechanism / Safety·Trust Guardrail
2. **P0 Necessity Test** — if early validation is still possible via prototype, WoZ, researcher help, external measurement, etc., usually not P0
3. **Business Goal ≠ feature list** — success metrics must not auto-map to in-product tracking features
4. **Implementation independence** — core capability vs eventual production integration
5. **Constraint-derived minimum Guardrails** — lightweight trust/safety warnings may be P0; complex confidence systems usually not
6. **Stricter Must Have count** — prefer 2–3; allow 4 only when clearly necessary

### Preserved from v1

- Confirmed Product Analysis as context (no re-analysis)
- Obey Project Constraints
- Do not invent Target User / Problem / Positioning
- Unknown complexity → `complexity_needs_validation`
- AI proposes, PM decides
- Structured JSON + existing `MvpScopeSchema`

### Prompt source

Current live prompt at time of v2: `src/lib/ai/prompts/mvp-prioritization.ts` (**v2** — superseded by v3)

### Downstream

Only Confirmed MVP Scope may feed future Requirements Generation. Requirements LLM still not wired.

### Risks observed in v2 (from mvp_eval_v2.md)

Three-case regression improved Patterns A/B/C, but found under-scoping:

1. **Prototype Validation ≠ User-facing Product MVP** — WoZ / researcher assistance over-applied to defer minimum user interactions
2. Case 1: Plan Review / Edit missing from explicit P0 loop
3. Case 3: minimum historical-order input deferred to P1 because researchers could prepare data offline

Status after v2 regression: iterate to Prompt v3. Keep v1 + v2 eval history.

### Version history (continued)

| Version | Date | Notes |
|---------|------|-------|
| v2 | 2026-09-06 | Eval-driven: Feature vs Validation Method; P0 Necessity Test; Business Goal / Implementation independence; Constraint guardrails |

---

## MVP Prioritization Prompt v3

### Why v3

Fix under-scoping regression from `docs/mvp_eval_v2.md` by introducing **Minimum User Value Loop** and clearer boundaries for Wizard-of-Oz / researcher assistance — without undoing v2 anti-expansion rules.

### v3 core additions

1. **Minimum User Value Loop** — real user completes minimum core value without researcher doing their core behaviors
2. **Validation levels** — Concept vs Product MVP vs Production; this stage targets Product MVP Validation
3. **WoZ boundary** — may replace complex implementation; must not replace minimum user input / output / decide / necessary human control / constraint guardrails
4. **Two-stage P0 Necessity Test** — Stage 1 stand-in check + Stage 2 “implementation vs core user behavior”
5. **Minimum input rule** — defer integration, not necessarily the user’s minimum input path
6. **In-product human control rule** — evaluate Review / Edit / Confirm / Decide when AI output drives decisions

### Preserved from v2

- Feature vs Validation Method / Measurement classification
- Business Goal ≠ feature list
- Implementation Mechanism ≠ core capability (for heavy integrations)
- Constraint-derived minimum Guardrails
- Must Have prefer 2–3
- complexity unknown → `complexity_needs_validation`
- Confirmed Product Analysis as authoritative context
- AI proposes, PM decides
- Existing `MvpScopeSchema` unchanged

### Prompt source

Current live prompt: `src/lib/ai/prompts/mvp-prioritization.ts` (**v3 — FROZEN**)

Eval: `docs/mvp_eval_v3.md` → **3 / 3 PASS / FROZEN**

Do **not** iterate to Prompt v4 without an explicit product decision.

### Downstream

Only Confirmed MVP Scope may feed future Requirements Generation. Requirements LLM still not wired.

### Version history (continued)

| Version | Date | Notes |
|---------|------|-------|
| v3 | 2026-09-06 | Eval-driven under-scoping fix: Minimum User Value Loop; WoZ boundaries; two-stage Necessity Test |
| v3 | 2026-09-07 | 3-case regression PASS — **FROZEN** |
