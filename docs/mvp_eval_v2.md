# MVP Prioritization Eval V2

## Prompt Version

MVP Prioritization Prompt v2

Provider:
DeepSeek

Regression against: Prompt v1 three-case findings in `docs/mvp_eval_v1.md`


---

# Case 1 — AI Study Planner

## Regression Result

PASS WITH MINOR REGRESSION RISK

## P0 — Prompt v2

- 学生任务与可用时间录入
- AI 生成结构化学习计划

## Improvements vs v1

### 1. Completion tracking removed from P0

v1:
completion consistency
→ Lightweight completion tracking = P0

v2:
计划打卡与执行追踪 = P2

The rationale explicitly states that execution consistency can be measured through external interviews / questionnaires instead of requiring an in-product tracking feature.

Result:
Validation Method / Measurement Mechanism leakage is substantially improved.

### 2. Adaptive replanning removed from P0

v1:
Reprioritize and reschedule after changes = P0

v2:
计划调整与重新生成 = P1

The rationale explicitly recognizes that early validation can simulate plan changes through manual re-entry, researcher assistance, or rebuilding the plan.

Result:
P0 Necessity Test is working.

### 3. Calendar / LMS integration deferred

课程系统 / 日历自动导入 = P2.

The model correctly distinguishes production integration from the core capability.

## New Potential Regression

Plan Review / Edit is no longer explicitly represented as P0.

The current P0 loop appears to be:

Input
→ AI generates plan

A stronger minimum human-in-the-loop loop may be:

Input
→ AI proposes plan
→ User reviews / edits
→ User decides

Need to check whether this under-specification repeats in other v2 Cases before changing the Prompt.

## Scores

Relevance: 4.7 / 5
Scope Discipline: 4.8 / 5
Constraint Alignment: 4.8 / 5
Rationale Quality: 4.8 / 5
Consistency: 4.7 / 5

## Case Result

PASS WITH MINOR REGRESSION RISK


---

# Case 2 — AI Scam Call Assistant

## Regression Result

PASS

## P0 — Prompt v2

- 风险提示（审慎、非确定）
- 安全行动建议
- 不确定性边界提示

## Improvements vs v1

### 1. Validation Method Leakage fixed

v1:

通话后一次结果确认 = P0

模型认为需要产品内的结果确认，才能验证用户是否采取了更安全的行动。

v2:

通话后小结与求助建议 = P2

模型明确认为 V1 可以通过测试通话中的用户反馈、研究观察等方式验证效果，无需先把结果采集机制产品化。

Result:

Validation Method / Measurement Mechanism 与 Product Feature 的区分明显改善。


### 2. Implementation Mechanism Leakage fixed

v1:

一键开启真实通话守护 = P0

v2:

实时通话 AI 分析与介入 = P2

模型明确指出：

核心价值可以通过预设通话情境、研究者人工触发、Wizard-of-Oz 等方式验证。

真实电话接入属于生产实现机制，不应占用第一阶段 P0。


### 3. Constraint-derived Guardrail improved

Confirmed Constraints:

- AI 不能保证某个电话一定是诈骗
- 不能把风险判断展示为确定事实

v2 将：

不确定性边界提示

设为 P0。

这是直接由明确 Constraint 推导出的 minimum guardrail。

同时没有要求复杂 confidence model，只需要固定、清晰的不确定性表达。

Result:

Constraint-derived minimum guardrail 机制工作正常。


### 4. P0 remains minimal but complete

v2 P0 形成：

风险提示
→ 不确定性边界
→ 安全行动建议
→ 用户最终决定

共 3 个 P0。

相比 v1 删除了验证机制和生产实现机制，但没有删除必要的安全控制。


## No Major Regression Found

Case 1 中曾出现：

Plan Review / Edit 可能被压缩过度。

Case 2 暂未发现类似的 over-pruning。

核心 Safety / Human control 仍完整保留。


## Scores

Relevance: 4.9 / 5
Scope Discipline: 4.9 / 5
Constraint Alignment: 5.0 / 5
Rationale Quality: 4.9 / 5
Consistency: 4.9 / 5

## Case Result

PASS


---

# Case 3 — AI Inventory Planner

## Regression Result

PASS WITH UNDER-SCOPING RISK

## P0 — Prompt v2

- 次日备货建议生成与展示
- 建议仅供参考与不自动下单提示

## Improvements vs v1

### 1. Constraint-derived Guardrail improved

Confirmed constraints:

- 第一版只提供备货建议，不自动下单
- 历史订单数据可能不完整

v2 将：

建议仅供参考与不自动下单提示

设为 P0。

该能力只使用轻量文案表达：

- 数据可能不完整
- 建议仅供参考
- 不自动下单
- 店主做最终采购决定

没有扩张成复杂 confidence system。

Result:

Constraint-derived minimum guardrail works as intended.


### 2. Validation Method Leakage remains fixed

以下功能被放入 P2：

- 店主采纳反馈入口
- 建议与实际结果复盘

模型明确指出：

用户采纳、浪费率、缺货率等验证结果可以通过：

- interview
- usability testing
- researcher observation
- offline/manual logging

进行测量。

无需把 measurement mechanism 做成 P0 产品功能。


### 3. Advanced implementation remains deferred

- 节假日 / 天气等特殊因素修正 = P2

没有出现自动下单、复杂采购系统、预测 dashboard 等 P0 scope expansion。


## New Regression — Prototype Validation vs User-facing MVP

历史订单数据录入 / 导入被放入 P1。

模型理由是：

早期验证可以由评估人员离线准备数据、手工录入或使用测试数据集替代。

这说明 P0 Necessity Test 可能被过度应用。

核心价值链实际上是：

店主自己的历史订单
→ AI
→ 针对该店的次日备货建议

研究员可以替代：

- POS integration
- API integration
- automated data pipelines

但不应默认替代：

用户向产品提供完成核心价值所需信息的最小行为。

一个真实 User-facing MVP 至少可能需要：

- CSV upload

或：

- simple manual entry

作为最小输入机制。


## Repeated v2 Under-scoping Pattern

Case 1:

Plan Review / Edit 不再明确作为 P0，
导致 Human-in-the-loop 最小闭环可能被削弱。

Case 3:

最小历史订单输入被降到 P1，
因为研究员可以离线准备数据。

Emerging failure pattern:

Prompt v2 may confuse:

Prototype / Concept Validation

with:

User-facing Product MVP


Wizard-of-Oz / researcher assistance 应用于替代：

复杂技术实现

而不是无限替代：

用户完成核心价值闭环所必须执行的最小产品交互。


## Scores

Relevance: 4.8 / 5
Scope Discipline: 4.9 / 5
Constraint Alignment: 4.9 / 5
Rationale Quality: 4.8 / 5
Consistency: 4.5 / 5

## Case Result

PASS WITH UNDER-SCOPING RISK
