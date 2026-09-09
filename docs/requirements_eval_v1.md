# Requirements Generation Eval V1

## Prompt Version

Requirements Generation Prompt v1

Provider:
DeepSeek

Status:
**EVAL ONLY — not frozen**

Pipeline used for this regression:

```
Project Input
  → Product Analysis (Prompt v2 FROZEN)
  → MVP Prioritization (Prompt v3 FROZEN)
  → Requirements Generation (Prompt v1)
```

Gates treated as confirmed for the eval run (same contract as live API):

- Confirmed Product Analysis
- Confirmed MVP Scope

3-case regression: Study Planner / Scam Call Assistant / Inventory Planner  
(same case set as `docs/mvp_eval_v3.md`)

## Eval Criteria

1. Requirements only from Confirmed MVP Must Have / P0
2. No new features outside confirmed MVP
3. Implementation Mechanism not treated as a product feature
4. No invented unconfirmed facts / thresholds
5. User Story clarity
6. Acceptance Criteria testability
7. Edge Cases reasonableness

---

# Case 1 — AI Study Planner

## Upstream Confirmed Must Have (this run)

1. Enter Deadlines and Weekly Free-Time Blocks
2. Generate and Display a Structured Study Plan
3. Update Inputs and Regenerate the Plan

Deferred (should not appear as Requirements scope):

- Show Plan Assumptions / Disclaimer (P1)
- Manually Edit Individual Plan Tasks (P1)
- Completion tracking (P1)
- Preferred session lengths (P1)
- Calendar / LMS import (P2)
- Intelligent conflict-aware rescheduling (P2)

## Requirements Result (Prompt v1)

| # | featureName | priority |
|---|-------------|----------|
| 1 | Enter Deadlines and Weekly Free-Time Blocks | P0 |
| 2 | Generate and Display a Structured Study Plan | P0 |
| 3 | Update Inputs and Regenerate the Plan | P0 |

Count: **3 requirements / 3 Must Have** (1:1)

### Criterion checks

| Criterion | Result | Notes |
|-----------|--------|-------|
| Based on Confirmed MVP only | **PASS** | Exact Must Have names; no P1/P2 requirements |
| No MVP-out features | **PASS** | No calendar sync, LMS, tutoring, social, completion tracking |
| Implementation ≠ Feature | **PASS** | Manual entry kept; no calendar/API integration as a requirement |
| No invented facts | **PASS** | Does not invent personas or research findings; scheduling only from user inputs |
| User Story clarity | **PASS** | Clear asA / iWant / soThat for each P0 |
| AC testable | **PASS** | Given/When/Then with observable UI/state outcomes |
| Edge cases reasonable | **PASS** | Invalid time range, insufficient free time, regenerate failure, midterm with no slot |

### Notable quality

- Strong missing-information handling: do not fabricate availability or deadlines.
- Regenerate keeps previous plan until explicit Regenerate — good HITL boundary.
- Individual session edit correctly absent (remains deferred P1 upstream).

## Case Result

**PASS**

---

# Case 2 — AI Scam Call Assistant

## Upstream Confirmed Must Have (this run)

1. One-Tap Call Check Session
2. Plain-Language Cautious Verdict
3. User-Controlled Safe Next Steps

Deferred:

- After-Call Safety Review (P1)
- Share with family (P1)
- Call history (P1)
- Native live-call audio integration (P2)
- Adaptive risk model (P2)
- Official-number directory (P2)

## Requirements Result (Prompt v1)

| # | featureName | priority |
|---|-------------|----------|
| 1 | One-Tap Call Check Session | P0 |
| 2 | Plain-Language Cautious Verdict | P0 |
| 3 | User-Controlled Safe Next Steps | P0 |

Count: **3 / 3** (1:1)

### Criterion checks

| Criterion | Result | Notes |
|-----------|--------|-------|
| Based on Confirmed MVP only | **PASS** | Exact Must Have coverage |
| No MVP-out features | **PASS** | No family share, history, banking/legal advisory as features |
| Implementation ≠ Feature | **PASS** | Explicitly supports staged/simulated call; native telephony deferred |
| No invented facts | **PASS** | Verdict framed as assistive / uncertain; no fabricated authority |
| User Story clarity | **PASS** | Grounded in older adults living alone + in-the-moment decision |
| AC testable | **PASS** | Permission deny, Likely Scam scenario, Needs More Checking default, no auto hang-up |
| Edge cases reasonable | **PASS** | Permission deny, disconnect, stop, conflicting signals, analysis failure |

### Notable quality

- Constraint alignment strong: never auto hang-up / move money / legal action.
- Cautious default to “Needs More Checking” when signals are weak.
- Warns not to use caller-provided “official” numbers.

### Minor note (not a fail)

- `requiredInputs` mentions conversation audio/transcript access; acceptable for MVP when paired with staged-environment language, but Prompt could further stress “MVP may use simulated/WoZ capture” so AC writers do not imply carrier integration.

## Case Result

**PASS**

---

# Case 3 — AI Inventory Planner

## Upstream Confirmed Must Have (this run)

1. Upload or enter historical order data
2. Generate next-day prep forecast from order history
3. Review, adjust, and confirm final prep quantities

Deferred:

- POS / order-system automated import (P1)
- Confidence notes / actual-vs-forecast feedback (P1)
- Holidays/weather/events (P2)
- Automated daily retraining pipeline (P2)
- Prep-list export (P2)

## Requirements Result (Prompt v1)

| # | featureName | priority |
|---|-------------|----------|
| 1 | Upload or enter historical order data | P0 |
| 2 | Generate next-day prep forecast from order history | P0 |
| 3 | Review, adjust, and confirm final prep quantities | P0 |

Count: **3 / 3** (1:1)

### Criterion checks

| Criterion | Result | Notes |
|-----------|--------|-------|
| Based on Confirmed MVP only | **PASS** | One requirement per Must Have |
| No MVP-out features | **PASS** | No POS integration / ERP / auto-ordering as features |
| Implementation ≠ Feature | **PASS** | CSV/manual entry; POS only appears as an edge-case data shape, not a P0 feature |
| No invented facts | **WARN** | Invents a concrete **“at least 7 unique dates”** minimum not stated in confirmed MVP text |
| User Story clarity | **PASS** | Clear owner/kitchen-lead stories |
| AC testable | **PASS** | Strong validation / confirm / override ACs |
| Edge cases reasonable | **PASS** | Malformed CSV, invalid rows, outliers, no-confirm-on-navigate-away |

### Issues

1. **Invented threshold:** MVP said “minimum number of days” generically; Requirements hard-coded **7 unique dates** in systemBehavior + AC. That is an unconfirmed product rule.
2. **Over-specified mechanism (mild):** Describes weekday-comparison / fallback forecasting internals beyond “basic pattern-based” MVP language. Acceptable as implementation guidance, but risks locking a mechanism that MVP intentionally left flexible.
3. **Guardrail coverage (context):** Frozen MVP eval v3 often had an explicit Reference-Only / Low-Data Notice as P0. This run’s MVP packed caution into forecast/review copy instead of a separate Must Have — Requirements partially cover “not auto-order / not a guarantee,” which is OK for *this* upstream snapshot, but weaker than a dedicated guardrail requirement when MVP lists one.

## Case Result

**PASS WITH WARNINGS**

---

# Cross-case synthesis

## What worked

1. **Strict Must Have → Requirement cardinality** across all three cases (3/3, 3/3, 3/3).
2. **No P1/P2 leakage** into the requirements list (calendar, telecom, POS, analytics, family share stayed out).
3. **HITL preserved** where MVP required it (regenerate, safe next steps, review/confirm prep).
4. **User stories + Given/When/Then ACs** generally clear and testable.
5. **Edge cases** cover failure, ambiguity, and control boundaries without becoming new features.

## Problem summary

| Severity | Issue | Seen in |
|----------|-------|---------|
| Medium | Invents concrete numeric thresholds not present in confirmed MVP | Case 3 (7 unique dates) |
| Low | May over-specify implementation internals inside systemBehavior | Case 3 forecast method |
| Low | Audio/transcript input wording could be misread as requiring production telephony | Case 2 |
| Context | Guardrail depth depends on whether MVP listed an explicit P0 guardrail | Case 3 vs historical v3 P0 set |

## Scores (evaluator judgment)

| Case | Scope Discipline | No invented facts | Story / AC quality | Edge cases | Overall |
|------|------------------|-------------------|--------------------|------------|---------|
| Study Planner | 5.0 | 4.8 | 4.9 | 4.8 | **PASS** |
| Scam Call Assistant | 5.0 | 4.7 | 4.9 | 4.9 | **PASS** |
| Inventory Planner | 4.8 | 3.8 | 4.8 | 4.7 | **PASS w/ WARN** |

---

# Prompt v1 — iterate or freeze?

## Recommendation

**Do not freeze Prompt v1 yet.**

v1 is **good enough for Demo / continued product work**, but should get a **small Prompt v1.1** (or keep calling it v1 with a patch) before freeze.

## Suggested Prompt iteration (prompt-only; not done in this session)

1. **Do not invent product rules** (numeric thresholds, SLAs, column schemas) unless they appear in Project Input, Confirmed Analysis, or Confirmed MVP. Prefer: “use the minimum required by confirmed MVP / shown in guidance” or leave as open question.
2. **Prefer capability language over mechanism internals** unless needed for testability.
3. **Re-state:** deferred MVP items (P1/P2) must not reappear as acceptance criteria for P0.
4. **For AI assistive products:** keep “staged / WoZ / simulated OK when MVP defers integration” explicit in the prompt.

## What not to do yet

- Do not reopen Analysis Prompt v2 or MVP Prompt v3 because of these findings.
- Do not change Schema / API / HITL based on this eval alone.
- Do not treat Case 3 threshold invention as a reason to expand Requirements scope.

---

# Final Decision

| Item | Decision |
|------|----------|
| Case 1 | PASS |
| Case 2 | PASS |
| Case 3 | PASS WITH WARNINGS |
| Prompt v1 freeze | **Not yet** — iterate lightly on invented-threshold / over-specification |
| Product code | Unchanged in this eval session |

End of Requirements Eval V1.
