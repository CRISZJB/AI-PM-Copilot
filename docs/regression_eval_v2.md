# Product Analysis Regression Eval — Prompt v2

## Goal

Compare Product Analysis Prompt v2 against Prompt v1 using the exact same test cases.

## Evaluation Dimensions

- Relevance
- Groundedness
- Structure
- Actionability
- Consistency

## Regression Checks

- Missing age should become Not Provided
- Unsupported demographic details should not be invented
- Provenance should be more precise at item level
- Relevance should not decline
- Schema should remain stable

# Case 1 — AI Study Planner

## Prompt Version

Product Analysis Prompt v2


## Score

Relevance: 4.5 / 5

Groundedness: 4.8 / 5

Structure: 5 / 5

Actionability: 4.5 / 5

Consistency: 4.7 / 5


## Comparison with Prompt v1

| Dimension | Prompt v1 | Prompt v2 |
|---|---:|---:|
| Relevance | 4.5 | 4.5 |
| Groundedness | 4.0 | 4.8 |
| Structure | 5.0 | 5.0 |
| Actionability | 4.5 | 4.5 |
| Consistency | 4.5 | 4.7 |


## Regression Checks

### Missing information handling

PASS

Prompt v1:

Age information was missing but represented as AI Inference / Needs Validation.

Prompt v2:

Age: Not provided
Source: Not Provided

Missing information is no longer represented as inference.


### Unsupported demographic completion

PASS

The model did not invent:

- exact age
- school
- education level
- income
- location
- other unsupported demographic details.


### Item-level provenance

PASS

Goals, Behaviors and Pain Points now distinguish individual statements as:

- From Input
- AI Inference
- Needs Validation

rather than attaching mixed provenance labels to the whole section.


### Relevance regression

PASS

The stricter grounding rules did not materially reduce product relevance.

The model still generated useful:

- goals
- behaviors
- pain points
- scenarios
- assumptions
- research questions


## What Improved

- Missing demographic information is correctly represented as Not Provided.
- AI no longer fills missing age information with an inferred value.
- Provenance is more precise at individual statement level.
- Inference language remains cautious without making the analysis empty or generic.
- Assumptions remain actionable for product validation.


## New Issue Observed

### Synthesized content may still be labeled as From Input

Product Positioning is labeled:

From Input

but the text combines and rewrites several user-provided inputs.

The content is grounded in user input and does not appear to introduce unsupported facts, but it is not literally user-provided text.

Potential future distinction:

derived_from_input

Do not change the schema yet.

Check whether this pattern repeats in Case 2 and Case 3 first.


## Case Result

PASS

Prompt v2 fixes the primary Prompt v1 failures for this test case without an observable loss in relevance or actionability.

# Case 2 — AI Scam Call Assistant

## Prompt Version

Product Analysis Prompt v2


## Score

Relevance: 4.5 / 5

Groundedness: 4.7 / 5

Structure: 5 / 5

Actionability: 4.5 / 5

Consistency: 4.7 / 5


## Comparison with Prompt v1

| Dimension | Prompt v1 | Prompt v2 |
|---|---:|---:|
| Relevance | 4.5 | 4.5 |
| Groundedness | 3.5 | 4.7 |
| Structure | 5.0 | 5.0 |
| Actionability | 4.5 | 4.5 |
| Consistency | 4.5 | 4.7 |


## Regression Checks

### Missing information handling

PASS

Prompt v1 generated an unsupported age inference:

"约65岁以上"

Prompt v2 correctly shows:

Age: Not provided

Source:

Not Provided


### Unsupported demographic completion

PASS

Prompt v2 did not invent:

- exact age
- retirement status
- income
- education
- location
- other unsupported demographic details.


### Item-level provenance

PASS

Individual goals, behaviors, pain points, scenarios and assumptions now carry their own provenance labels.

Example:

"数字工具使用能力有限"
→ From Input

"在独居环境中独自接听陌生来电"
→ AI Inference / Needs Validation


### Constraint awareness

PASS

The analysis respected the explicit constraint that:

- AI cannot guarantee a call is fraudulent
- AI should not make financial decisions for the user
- risk judgments should not be presented as certain facts


### Relevance regression

PASS

The stricter grounding rules did not materially reduce relevance or actionability.


## What Improved

- Unsupported age inference was eliminated.
- Missing age is represented correctly as Not Provided.
- Population-level unsupported claims such as "most elderly users..." were avoided.
- Inferred behavior is expressed more cautiously.
- AI uncertainty remains visible in product positioning.
- Open Questions remain useful for trust, interaction design and human escalation decisions.


## New / Continuing Issue

### Synthesized input may still be labeled as From Input

Some statements combine multiple user inputs into a new summarized statement while still being labeled:

From Input

Example:

A scenario combining:
- elderly user
- living alone
- receiving unknown calls
- needing to judge fraud risk

is grounded in the user input but is not literally a user-provided statement.

This repeats the pattern observed in Case 1.

Potential future provenance state:

derived_from_input

Do not change the schema yet.

Check whether the same pattern appears again in Case 3.


## Case Result

PASS

Prompt v2 fixes the major Prompt v1 grounding failure for this case without a meaningful loss in relevance or actionability.

# Case 3 — AI Inventory Planner

## Prompt Version

Product Analysis Prompt v2


## Score

Relevance: 4.5 / 5

Groundedness: 4.7 / 5

Structure: 5 / 5

Actionability: 4.5 / 5

Consistency: 4.7 / 5


## Comparison with Prompt v1

| Dimension | Prompt v1 | Prompt v2 |
|---|---:|---:|
| Relevance | 4.5 | 4.5 |
| Groundedness | 4.0 | 4.7 |
| Structure | 5.0 | 5.0 |
| Actionability | 4.5 | 4.5 |
| Consistency | 4.5 | 4.7 |


## Regression Checks

### Missing information handling

PASS

Age is represented as:

Age: Not provided

Source:

Not Provided


### Unsupported demographic completion

PASS

The model did not invent:

- owner age
- income
- store revenue
- order volume
- store size
- location
- other unsupported business or demographic data.


### Constraint awareness

PASS

The analysis correctly retained:

- historical order data may be incomplete
- V1 provides recommendations only
- V1 does not automatically place orders


### Prediction uncertainty

PASS

The output did not present AI inventory recommendations as guaranteed future demand.

AI-generated operational assumptions remain marked:

AI Inference / Needs Validation


### Item-level provenance

PASS

Individual behaviors, pain points, scenarios and assumptions have their own provenance.


### Relevance regression

PASS

The stricter Prompt v2 grounding rules did not materially reduce relevance or actionability.


## Continuing Issue

Some statements combine user-provided information with model-generated synthesis while being labeled:

From Input

Example:

"历史订单数据不完整可能会影响AI预测的可靠性"

The missing historical data constraint came from the user, while the effect on prediction reliability is derived from that input.

This repeats the pattern found in Case 1 and Case 2.

Potential future provenance:

derived_from_input

Decision:

Do not add this state yet.

Treat it as a future provenance refinement rather than a blocking MVP issue.


## Case Result

PASS

# Prompt v2 Regression Summary

## Test Coverage

Prompt v2 was tested against the exact same three cases used for Prompt v1:

1. AI Study Planner
2. AI Scam Call Assistant
3. AI Inventory Planner


## Average Scores

| Dimension | Prompt v1 | Prompt v2 |
|---|---:|---:|
| Relevance | 4.5 | 4.5 |
| Groundedness | 3.8 | 4.7 |
| Structure | 5.0 | 5.0 |
| Actionability | 4.5 | 4.5 |
| Consistency | 4.5 | 4.7 |


## Confirmed Improvements

Prompt v2 successfully improved:

- missing information handling
- unsupported demographic inference
- item-level provenance
- cautious inference language

without meaningful regression in:

- relevance
- structure
- actionability


## Remaining Issue

The distinction between:

user_input

and:

content synthesized only from user-provided facts

is still imperfect.

A future provenance state such as:

derived_from_input

may improve traceability.

This is not considered a blocking issue for the current MVP.


## Final Decision

Product Analysis Prompt v2:

PASS

Status:

FROZEN FOR CURRENT MVP

Do not iterate to Prompt v3 yet.

Next product priority:

Implement the Review / Edit / Confirm human-in-the-loop gate before sending Product Analysis into downstream MVP prioritization.