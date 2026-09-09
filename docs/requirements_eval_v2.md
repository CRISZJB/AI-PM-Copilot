# Requirements Generation Eval V2

## Prompt Version

Requirements Generation Prompt v2

Provider:
DeepSeek

Status after this regression:
**Recommended FROZEN** (see Final Decision)

Regression against: Prompt v1 findings in `docs/requirements_eval_v1.md`

Pipeline used:

```
Project Input
  → Product Analysis (Prompt v2 FROZEN)
  → MVP Prioritization (Prompt v3 FROZEN)
  → Requirements Generation (Prompt v2)
```

Gates treated as confirmed for the eval run:

- Confirmed Product Analysis
- Confirmed MVP Scope

Same three cases as v1 / MVP evals:

1. AI Study Planner  
2. AI Scam Call Assistant  
3. AI Inventory Planner  

**No Prompt / Schema / API / HITL / UI / business code was modified during this eval.**

---

## Shared criteria

For every case:

1. Must Have → Requirement 1:1  
2. Only Confirmed MVP Scope expanded  
3. No P1 / P2 reintroduced as Requirements  
4. User Story clarity  
5. systemBehavior = product behavior (not engineering design)  
6. Acceptance Criteria testable  
7. Edge Cases reasonable  
8. No unconfirmed product facts  
9. No invented numeric thresholds / SLAs / confidence cutoffs (unless already in confirmed upstream)  
10. No new Features smuggled via Edge Cases  

---

# Case 1 — AI Study Planner

## Upstream Confirmed Must Have (this run)

1. Manual entry of deadlines and free-time blocks  
2. AI study-plan generation with weekly schedule view  
3. Adjust inputs and regenerate or revise plan  

Deferred (must stay out of Requirements list):

- Calendar import/sync (P1)  
- Reschedule missed sessions (P1)  
- Progress check-off (P2)  
- Reminders (P2)  

## Requirements Result (Prompt v2)

| # | featureName | priority |
|---|-------------|----------|
| 1 | Manual entry of deadlines and free-time blocks | P0 |
| 2 | AI study-plan generation with weekly schedule view | P0 |
| 3 | Adjust inputs and regenerate or revise plan | P0 |

Count: **3 / 3** (1:1)

### Criterion checks

| Criterion | Result | Notes |
|-----------|--------|-------|
| 1:1 Must Have | **PASS** | Exact name alignment |
| Confirmed scope only | **PASS** | Input → structured plan → update / regenerate (+ revise tasks as stated in this MVP) |
| No P1/P2 | **PASS** | No calendar / LMS / social / advanced tracking as Requirements |
| User Story clarity | **PASS** | Concrete student stories |
| Product vs engineering | **PASS** | Places tasks in free-time blocks; no algorithm / model / DB language |
| AC testable | **PASS** | Observable lists, weekly schedule placement, incomplete/unrealistic plan surfacing, regenerate without starting over — not vague “reasonably generate a plan” |
| Edge cases | **PASS** | Missing free time, past deadline, invalid range, regenerate failure, overwrite warning needs validation |
| Invented facts / numbers | **PASS** | No invented day counts, SLAs, or accuracy targets |
| Edge Case feature smuggle | **PASS** | No new modules |

### v2 anti-over-abstraction check

PASS. Criteria remain concrete (entered free-time blocks only; associate blocks with courses/deadlines; surface incomplete/unrealistic plans).

## Scores

| Dimension | Score |
|-----------|-------|
| Scope Fidelity | 5.0 |
| Grounding | 4.9 |
| Acceptance Criteria Quality | 4.9 |
| Implementation Boundary | 5.0 |
| Edge Case Discipline | 4.8 |

## Case Result

**PASS**

---

# Case 2 — AI Scam Call Assistant

## Upstream Confirmed Must Have (this run)

1. One-Tap Call Check & Call-Cue Intake  
2. Plain-Language Risk Readout with Caution Guardrail  
3. Safe Next-Step Options & User's Final Say  

Deferred:

- Automatic Live-Call Listening (P1)  
- Post-Call Summary for Trusted Person (P1)  
- Voice-First / Read-Aloud (P1)  
- Learning Library (P2)  
- Carrier Call-Blocking & Official Reporting (P2)  
- Outcome Check-In (P2)  

## Requirements Result (Prompt v2)

| # | featureName | priority |
|---|-------------|----------|
| 1 | One-Tap Call Check & Call-Cue Intake | P0 |
| 2 | Plain-Language Risk Readout with Caution Guardrail | P0 |
| 3 | Safe Next-Step Options & User's Final Say | P0 |

Count: **3 / 3** (1:1)

### Criterion checks

| Criterion | Result | Notes |
|-----------|--------|-------|
| 1:1 Must Have | **PASS** | |
| Confirmed scope only | **PASS** | Trigger → risk/caution → user chooses next step |
| No P1/P2 | **PASS** | No carrier blocking, family summary, listening engine as Requirements |
| Telecom boundary | **PASS** | Explicit: does **not** access / listen / record / analyze live phone audio in this version; check based solely on user-entered cues |
| No auto hang-up / transfer / block | **PASS** | Confirmed never disconnect / block / send info on user’s behalf |
| User Story clarity | **PASS** | |
| Product vs engineering | **PASS** | Pattern comparison described as product behavior; no telecom stack / model infra |
| AC testable | **PASS** | One-tap start, cue questions, fixed caution always shown, no automatic call control |
| Invented numbers | **PASS** | Counts like “2–3 questions” / “1–2 suggestions” appear in **Confirmed MVP** descriptions — allowed as upstream-grounded, not invented by Requirements |
| Edge Case feature smuggle | **PASS** | No new safety product modules |

## Scores

| Dimension | Score |
|-----------|-------|
| Scope Fidelity | 5.0 |
| Grounding | 5.0 |
| Acceptance Criteria Quality | 4.9 |
| Implementation Boundary | 5.0 |
| Edge Case Discipline | 4.9 |

## Case Result

**PASS**

---

# Case 3 — AI Inventory Planner (primary regression)

## Upstream Confirmed Must Have (this run)

1. Historical order data entry via CSV or manual input  
2. Next-day per-dish prep forecast  
3. Review, adjust, and finalize prep quantities  

Deferred:

- Forecast context and confidence notice (**P1** in this run)  
- POS system import/API (**P1**)  
- Actual vs forecast comparison (P2)  
- Export/print (P2)  
- Inventory / procurement extensions (P2)  

> Note: Historical MVP eval v3 often listed a separate P0 “Reference-Only / Low-Data Notice.”  
> In **this** confirmed MVP snapshot, confidence/context notice is P1.  
> Requirements correctly stayed 1:1 with **this** Must Have list. Low-data caution is partially folded into the forecast Requirement using product-defined sufficiency language (see below).

## Requirements Result (Prompt v2)

| # | featureName | priority |
|---|-------------|----------|
| 1 | Historical order data entry via CSV or manual input | P0 |
| 2 | Next-day per-dish prep forecast | P0 |
| 3 | Review, adjust, and finalize prep quantities | P0 |

Count: **3 / 3** (1:1)

### Invented threshold regression (v1 → v2)

| Check | v1 | v2 |
|-------|----|----|
| “at least 7 unique dates” | Present (FAIL grounding) | **Absent** |
| Invented accuracy % | No | No |
| Invented sample-size business rule | Yes (7 days) | **No** |
| Data insufficiency handling | Hard-coded 7 | **Product-defined data-sufficiency standard** + Edge Case: “exact minimum needs product validation” |

Example v2 language (forecast):

- “If the overall supplied history does not meet the **product-defined minimum data-sufficiency standard**, informs the user that the forecast is limited and not a fully reliable plan.”  
- Sparse-history edge case: “below the product-defined data-sufficiency minimum. **The exact minimum needs product validation.**”

### Other criterion checks

| Criterion | Result | Notes |
|-----------|--------|-------|
| Historical order data Requirement | **PASS** | CSV + manual; POS not required |
| Next-day prep forecast Requirement | **PASS** | Suggestions as adjustable; no invented quantities when unsupported |
| Review / adjust / finalize | **PASS** | Explicit confirm; no auto-finalize |
| Separate Reference-Only Requirement | **N/A this run** | Upstream put confidence notice in P1; not smuggled back as extra Feature |
| POS / advanced engine / waste analytics | **PASS** | Not in Requirements |
| Product vs engineering | **PASS** | “Uses accepted historical order records to derive demand patterns” — no time-series / model / DB prescription |
| AC testable | **PASS** | Accept/reject records; forecastable vs not; confirm blocks invalid quantities — without fake day counts |
| Invented numbers | **PASS** | No 7-day / 90% / SLA style inventions. “At least one valid record” appears as empty-vs-nonempty existence check (logical input presence), not a sample-size business threshold — acceptable |
| Edge Case feature smuggle | **PASS** | Empty CSV / bad format / sparse history / invalid quantity only |

## Scores

| Dimension | Score |
|-----------|-------|
| Scope Fidelity | 5.0 |
| Grounding | 4.9 |
| Acceptance Criteria Quality | 4.8 |
| Implementation Boundary | 4.9 |
| Edge Case Discipline | 4.8 |

## Case Result

**PASS**

---

# Cross-case: Implementation Detail Leakage

| Case | Leakage? | Notes |
|------|----------|-------|
| Study Planner | No | Capability + schedule constraints only |
| Scam Call | No | Explicit non-listening; no carrier stack |
| Inventory | No | No forecasting formula / model / POS API as Requirements |

---

# v1 vs v2 comparison

| Question | Answer |
|----------|--------|
| 1. Invented threshold fixed? | **Yes** — Case 3 no longer invents “7 unique dates”; uses product-defined sufficiency + Needs Product Validation |
| 2. Implementation detail leakage reduced? | **Yes** — capability language; telecom/POS/algorithm prescriptions absent |
| 3. Scope Lock held? | **Yes** — no P1/P2 Requirements lists |
| 4. Must Have → Requirement 1:1 held? | **Yes** — 3/3, 3/3, 3/3 |
| 5. AC still testable? | **Yes** — not collapsed into vague “reasonably generate…” |
| 6. New regressions? | **No medium/severe.** Minor notes only: (a) upstream MVP variance on whether low-data notice is P0 vs P1; (b) Case 2 counts mirror confirmed MVP text; (c) “at least one record” as empty-check is fine |

---

# Final Decision

| Item | Result |
|------|--------|
| 1. Case 1 | **PASS** |
| 2. Case 2 | **PASS** |
| 3. Case 3 | **PASS** |
| 4. 3/3 PASS? | **Yes** |
| 5. v1 invented threshold fully fixed? | **Yes** |
| 6. New medium/severe problems? | **No** |
| 7. Requirements Prompt v2 freeze? | **Yes — recommend FROZEN** |

## Recommendation

**Requirements Prompt v2 → FROZEN**

Conditions met:

- Three cases PASS  
- Primary v1 failure (invented numeric threshold) resolved  
- Scope lock and 1:1 preserved  
- Acceptance Criteria remain testable  
- No new medium or severe regressions  

Do **not** change Prompt / Schema / API / HITL in this eval session.  
Freeze marking in handoff / prompt_design may be done in a separate explicit documentation update if desired.

---

# Version history note

| Version | Eval | Outcome |
|---------|------|---------|
| v1 | `docs/requirements_eval_v1.md` | 2 PASS / 1 PASS WITH WARNINGS — not frozen |
| v2 | `docs/requirements_eval_v2.md` (this file) | **3 / 3 PASS — recommend FROZEN** |

End of Requirements Eval V2.
