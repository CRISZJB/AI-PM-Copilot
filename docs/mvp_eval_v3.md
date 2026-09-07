# MVP Prioritization Eval V3

## Prompt Version

MVP Prioritization Prompt v3

Provider:
DeepSeek

Status:
**FROZEN**

Regression against: Prompt v2 under-scoping findings in `docs/mvp_eval_v2.md`  
Also checks that v1 over-scoping issues do not return.

3-case regression completed successfully (Study Planner / Scam Call Assistant / Inventory Planner).



---

# Case 1 — AI Study Planner

## Regression Result

PASS

## P0 — Prompt v3

- Capture planning inputs: tasks, deadlines, available time
- Generate a structured daily study plan
- Update inputs and regenerate/reject the plan

## Key Improvement vs v2

Prompt v3 restores a complete Minimum User Value Loop:

User provides core inputs
→ AI generates the core output
→ user can reject / update inputs / regenerate
→ user retains final control.

This fixes the v2 under-scoping risk without restoring the broader v1 scope.

## Human-in-the-loop Boundary

v3 distinguishes minimum control from richer editing:

P0:
- Reject
- Update inputs
- Regenerate
- Decide

P1:
- Manually edit individual generated sessions

This is preferable to mechanically requiring full editing capability in P0.

## v1 Regression Check

PASS.

The following v1 scope-expansion issues did not return:

- Execution-consistency tracking remains P2
- Calendar / course-management integrations remain P2
- Social collaboration remains P2
- Rich plan explanation remains P1

## Important Boundary

"Update inputs and regenerate/reject" should be interpreted as minimum user control over the current AI proposal.

It should not be expanded into a full adaptive / automatic rescheduling system.

## Scores

Relevance: 4.9 / 5
Scope Discipline: 4.9 / 5
Constraint Alignment: 4.9 / 5
Rationale Quality: 4.9 / 5
Consistency: 4.9 / 5

## Case Result

PASS

# Case 2 — AI Scam Call Assistant

## Regression Result

PASS

## P0 — Prompt v3

- 一键进入“帮我听”模式（语音或唯一大按钮）
- 实时风险分级提示 + 安全行动建议（含不确定性边界）

## Key Improvement

Prompt v3 distinguishes:

Minimum user-facing interaction

from:

Production implementation.

The user must be able to initiate the core experience without a researcher doing it for them.

However, real telecom integration is not required for P0.

The minimum loop can be tested through simulated calls, role-play audio, or Wizard-of-Oz infrastructure.

## Minimum User Value Loop

User initiates "帮我听"
→ AI presents non-deterministic risk guidance
→ AI provides safe optional actions
→ user retains final decision authority

This forms a complete user-facing MVP loop.

## Implementation Boundary

P0:

- User-triggered minimum entry point
- Risk guidance
- Uncertainty guardrail
- Safe-action guidance
- User decision

P1:

- Real incoming-call integration and risk-analysis engine
- Family / trusted-contact assistance

P2:

- Call-risk history / family review page
- Configurable personalization

Result:

Minimum User Value Loop does not force production telecom integration into P0.

## v1 Regression Check

PASS.

The following v1 problems did not return:

- Real telecom integration is not P0
- Post-call outcome measurement is not P0
- Family-contact integration is not P0
- Safety guardrails remain explicit
- AI does not make automatic financial or hang-up decisions

## Scores

Relevance: 5.0 / 5
Scope Discipline: 4.9 / 5
Constraint Alignment: 5.0 / 5
Rationale Quality: 5.0 / 5
Consistency: 5.0 / 5

## Case Result

PASS


---

# Case 3 — AI Inventory Planner

## Regression Result

PASS

## P0 — Prompt v3

- Provide Historical Order Data
- Generate Next-Day Prep Suggestions
- Reference-Only and Low-Data Notice

## Minimum User Value Loop

Restaurant owner provides their own historical order data
via minimum user-facing input such as manual entry or CSV

→ AI generates next-day preparation suggestions

→ product clearly communicates that low/incomplete data makes the suggestion reference-only

→ no automatic ordering occurs

→ owner retains final purchasing decision

## Key Improvement vs v2

Prompt v2 placed historical-order input/import in P1 because researcher-prepared data could substitute for it.

Prompt v3 correctly distinguishes:

complex production integration

from:

minimum user-facing input required for the core value loop.

Manual / CSV input is P0.

POS / ordering-platform integration remains P2.

Result:

Defer the integration,
not the user's minimum input capability.

## Constraint Guardrail

Confirmed constraints include:

- V1 only provides recommendations
- V1 does not automatically order
- historical order data may be incomplete

v3 converts these constraints into a minimum P0 guardrail:

- recommendation is informational / reference-only
- incomplete or sparse data is surfaced
- no automatic ordering
- owner makes the final decision

This does not expand into a complex confidence system.

## Validation Method Regression Check

PASS.

Waste / lost-sales analytics remains P2.

Business-goal outcomes can be evaluated externally during early validation.

Measurement mechanisms are not promoted to P0 product features.

## Implementation Regression Check

PASS.

The following remain deferred:

- POS / Order System Integration = P2
- Advanced / Adaptive Forecast Engine = P2

Production integrations and advanced prediction infrastructure do not replace the minimum user value loop.

## Scores

Relevance: 5.0 / 5
Scope Discipline: 5.0 / 5
Constraint Alignment: 5.0 / 5
Rationale Quality: 4.9 / 5
Consistency: 5.0 / 5

## Case Result

PASS


---

# Prompt v3 Overall Regression Conclusion

Case 1 — AI Study Planner: PASS  
Case 2 — AI Scam Call Assistant: PASS  
Case 3 — AI Inventory Planner: PASS  

Prompt v3 successfully balances:

- minimum user-facing product value loop
- scope discipline
- implementation independence
- validation-method separation
- business-goal separation
- minimum safety / trust guardrails
- human-in-the-loop control

Key evolution:

v1:  
P0 tended to expand because validation methods, measurement mechanisms, business goals and implementation mechanisms were promoted into product features.

v2:  
Scope discipline improved significantly, but Wizard-of-Oz / researcher substitution could over-shrink the user-facing MVP.

v3:  
Introduces Minimum User Value Loop and clearer Wizard-of-Oz boundaries.  
Researchers may replace complex implementation, but may not replace the user's minimum core product behavior.

Regression result:

**3 / 3 cases PASS.**

Decision:

**MVP Prioritization Prompt v3 is FROZEN.**

