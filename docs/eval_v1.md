# Product Analysis Eval V1

## Prompt Version

Product Analysis Prompt v1

Provider:
DeepSeek

## Evaluation Dimensions

Each dimension is scored from 1–5.

- Relevance
- Groundedness
- Structure
- Actionability
- Consistency


---

# Case 1 — AI Study Planner

## Input

Target User:
大学生

Problem:
学生同时面对多个课程任务和 deadline，但很难合理安排每天学习时间。

Business Goal:
验证 AI 是否能够帮助学生快速形成结构化学习计划。

Constraints:
第一版只做学习计划，不做社交、课程内容和打卡系统。


## Score

Relevance: 4.5 / 5

Groundedness: 4 / 5

Structure: 5 / 5

Actionability: 4.5 / 5

Consistency: 4.5 / 5


## What Worked

- Output remained strongly relevant to study planning.
- No fabricated persona name, school, income, or other unsupported demographic details.
- Core Problem correctly reflected user-provided input.
- AI-generated pain points were expressed as hypotheses.
- Assumptions were useful for product validation.
- Open Questions could guide further user research.
- Structured output successfully matched the UI schema.


## Issues Found

### 1. Missing information is labeled as AI inference

Example:

"Age 未在输入中说明"

was labeled:

AI Inference / Needs Validation

But this is not really an inference.

It should potentially be represented as:

Not Provided / Missing Information.


### 2. Provenance is sometimes section-level instead of item-level

For example:

Goals

may contain both:

- information derived from user input
- AI-generated inference

but the whole section currently displays:

From Input
AI Inference
Needs Validation

This makes it difficult to understand which individual statement came from which source.


### 3. Assumptions contain multiple types

Current assumptions include:

- User Behavior Assumption
- Value Assumption
- Scope Assumption
- Usability Assumption

Future versions may benefit from explicitly categorizing assumption types.


## Prompt V1 Status

PASS WITH IMPROVEMENTS

Do not modify the prompt yet.

Run additional test cases first to determine whether these issues are systematic.

# Case 2 — AI Scam Call Assistant

## Score

Relevance: 4.5 / 5

Groundedness: 3.5 / 5

Structure: 5 / 5

Actionability: 4.5 / 5

Consistency: 4.5 / 5


## What Worked

- Analysis remained strongly relevant to scam-call risk and elderly users.
- Product positioning respected the constraint that AI must not present fraud detection as certain fact.
- Pain points and scenarios were highly relevant to the problem.
- Open Questions surfaced important AI product concerns including:
  - intervention timing
  - uncertainty communication
  - false positive / false negative impact
  - privacy and consent
  - escalation to family members
- No fabricated market statistics or research findings were presented as verified facts.


## Issues Found

### 1. Unsupported demographic specificity

The model generated:

"约65岁以上"

although the user only provided "老年人".

This is unnecessarily specific and unsupported.

Preferred behavior:

- Not Provided
- Exact age range not specified

rather than inventing a demographic boundary.


### 2. Missing information is still treated as AI inference

"Age 输入未指定年龄"

is fundamentally missing information, not product inference.

This repeats the issue found in Case 1.

Potential future schema state:

not_provided


### 3. Some inferred behavior is phrased too confidently

Example:

"独居场景下接听时身边通常没有家人帮忙即时判断"

A safer phrasing would be:

"独居用户可能无法在通话过程中即时获得家人协助."


### 4. Validation labels do not justify unsupported claims

Example:

"多数老人愿意在收到风险提示后联系家人"

Even when marked Needs Validation, the model should avoid unsupported population-level claims such as "多数".

Better:

"Whether users are willing to contact family after receiving a risk warning needs validation."


## Cross-case Pattern

Case 1 and Case 2 both indicate a systematic issue:

Missing demographic information is sometimes converted into AI-generated demographic assumptions.

This should be addressed in Prompt v2 and possibly in the data schema.

# Case 3 — AI Inventory Planner

## Score

Relevance: 4.5 / 5

Groundedness: 4 / 5

Structure: 5 / 5

Actionability: 4.5 / 5

Consistency: 4.5 / 5


## What Worked

- Successfully shifted from consumer scenarios to a B2B operational decision-making context.
- Correctly focused on inventory waste, stockouts, historical orders and daily purchasing decisions.
- Did not fabricate store size, revenue, order volume or market statistics.
- Correctly incorporated the stated constraint that V1 only provides recommendations and does not automatically place orders.
- Recognized incomplete historical data as an important product constraint.
- Open Questions were actionable and relevant to real product discovery, including:
  - current replenishment workflow
  - forms of missing historical data
  - acceptable user effort
  - success metrics
  - external operational constraints
  - disagreement between AI recommendations and owner judgment


## Issues Found

### 1. Missing demographic information is again labeled as AI inference

The output showed:

"Age 未说明"

with:

AI Inference / Needs Validation

This repeats the same issue from Case 1 and Case 2.

Missing information should not be treated as an inference.

Preferred representation:

Not Provided


### 2. Section-level provenance remains ambiguous

Some sections contain both:

- user-provided facts
- AI-generated hypotheses

but the whole section displays:

From Input
AI Inference
Needs Validation

This makes it difficult to trace individual statements to their source.


### 3. Some contextual assumptions are plausible but not grounded

Example:

"节假日、周末或天气变化时，需求波动较大"

This is a plausible operational hypothesis, but it was not supplied by the user.

It should remain explicitly identifiable as AI-generated inference rather than appearing mixed with user-provided information.


## Prompt V1 Status

PASS WITH SYSTEMATIC ISSUES

# V1 Cross-case Summary

## Cases Tested

1. AI Study Planner
2. AI Scam Call Assistant
3. AI Inventory Planner


## Overall Result

Prompt v1 successfully produced relevant and structured Product Analysis outputs across:

- Consumer productivity
- AI safety / risk assistance
- B2B operational decision support

The structured output schema remained stable across all three domains.


## What Worked Across Cases

### Relevance

The model consistently adapted to different product contexts.

### Structured Output Reliability

All successful generations matched the expected ProductAnalysis schema and rendered correctly in the UI.

### Assumption Awareness

The model generally distinguished inferred content from user-provided information.

### Research Actionability

Open Questions were consistently useful for identifying next-step user research and product validation needs.

### Constraint Awareness

The model generally respected explicit product constraints.


## Systematic Issues

### Issue 1 — Missing Information Handling

Across all three cases, missing demographic information was represented as AI inference.

Examples:

- Age not provided
- Exact age range not specified

This is not inference.

It should be represented as:

Not Provided


### Issue 2 — Unsupported Specificity

In Case 2 the model generated:

"约65岁以上"

although the user only provided "老年人".

The model should not fill missing demographic attributes with typical or stereotypical values.


### Issue 3 — Provenance Granularity

Current provenance is sometimes attached at section level.

A section may contain both:

- user-provided information
- AI inference

This makes it difficult for users to identify the source of individual statements.

Future versions should prefer item-level provenance.


### Issue 4 — Validation Labels Do Not Justify Unsupported Claims

Marking a statement as Needs Validation should not allow the model to generate unnecessary specific claims.

The model should still prefer cautious and minimally assumptive language.


## Prompt V1 Decision

Status:

NEEDS ITERATION

Next step:

Create Product Analysis Prompt v2 focused on:

1. explicit missing-information handling
2. preventing unsupported demographic completion
3. more precise provenance
4. more cautious inference language