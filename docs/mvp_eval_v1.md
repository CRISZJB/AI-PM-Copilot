# MVP Prioritization Eval V1

## Prompt Version

MVP Prioritization Prompt v1

Provider:
DeepSeek

Status after three Cases:
**NEEDS ITERATION → MVP Prioritization Prompt v2 created** (see Final Decision below).
v1 eval history retained in this file.


## Evaluation Goal

评估 MVP Prioritization 是否能够：

1. 基于 Confirmed Product Analysis 收敛到最小验证范围
2. 严格控制 P0
3. 遵守明确的 V1 Constraints
4. 不把业务目标直接翻译成产品功能
5. 给出清晰、可审查的 prioritization rationale


## Evaluation Dimensions

Each dimension is scored from 1–5.

- Relevance
- Scope Discipline
- Constraint Alignment
- Rationale Quality
- Consistency


---

# Case 1 — AI Study Planner

## Context

- Product Analysis: live DeepSeek + Confirm Gate ✅
- MVP Scope: live DeepSeek + Human-in-the-loop ✅
- Input basis: Confirmed Product Analysis (not raw idea re-analysis)


## Observed AI P0 (Must Have)

本次真实 DeepSeek 输出的主要 P0：

- Quick commitment input
- Editable AI initial plan
- Reprioritize and reschedule after changes
- Lightweight completion tracking


## Observed P1 / P2 (reasonably deferred)

包括：

- Today or next-up focus list
- Planned-versus-completed review
- Calendar and LMS import
- Smart reminders and notifications
- Conversational AI planning assistant
- Study insights and recommendations


## Score

Relevance: 4.5 / 5

Scope Discipline: 3.2 / 5

Constraint Alignment: 3.8 / 5

Rationale Quality: 4.5 / 5

Consistency: 4.5 / 5


## What Worked

- 能基于 Confirmed Product Analysis 生成结构化 MVP Scope
- 能把 Calendar / LMS integration 放到 Not Now
- 能把 Reminders、Conversational AI、Longitudinal insights 延后
- rationale 基本清晰
- 实现复杂度未知时会使用 complexity needs technical validation
- 没有重新做一遍 Product Analysis
- PM 可以 Reprioritize 并覆盖 AI 建议


## Issues Found

### Issue 1 — Business Goal over-translated into a P0 feature

Business Goal 中包含：

completion consistency

模型因此将：

Lightweight completion tracking

放入 P0。

但“需要验证 completion consistency”并不意味着 V1 产品一定需要内置 completion tracking。

结果指标也可以通过：

- 用户测试
- 研究记录
- 外部观察
- 手工验证

进行验证。

AI 不应该默认把“验证指标”转换成“必须开发的产品功能”。


### Issue 2 — Core hypothesis scope expansion

原核心价值更接近：

AI 是否能把课程任务、deadline 和可用时间转成一个有用、可编辑的结构化学习计划。

模型进一步把：

Reprioritize and reschedule after changes

升为 P0。

但变化场景在早期 V1 中也可以通过：

- 修改输入
- 手动编辑计划
- 重新生成

解决。

独立的 adaptive rescheduling 能力不一定是验证 initial planning value 所必需。


### Issue 3 — Persuasive rationale ≠ required P0

部分 rationale 很有说服力，但“理由听起来合理”不等于功能必须进入 P0。

MVP Prioritization 应进一步区分：

- Product Feature
- Validation Method / Success Signal


## PM Override

PM 将：

Lightweight completion tracking

从：

P0

调整为：

P1

并验证：

- Reprioritize 成功
- PM decision 被保存
- Confirm 后不恢复 AI 原始建议
- Regenerate 不静默覆盖 PM decision

这体现核心原则：

**AI proposes. PM decides.**


## Case Result

**PASS WITH SCOPE EXPANSION RISK**


---

# Cross-case plan (not run yet)

下一步使用另外两个跨领域 Case：

## Case 2 — AI Scam Call Assistant

## Case 3 — AI Inventory Planner

验证以下问题是否重复出现：

- AI 是否把 Business Goal 自动变成 P0 功能
- AI 是否扩大 Core Hypothesis
- AI 是否能严格控制 Must Have 数量
- AI 是否遵守明确约束
- AI 是否能区分 Product Feature 和 Validation Method

只有多个 Case 重复出现后，才决定是否创建：

**MVP Prioritization Prompt v2**

（历史备注：Case 1 当时的临时决策。三 Case 完成后已创建 v2 — 见文末 Final Decision。）

在此之前：

- 不要修改业务代码
- 不要修改 MVP Prioritization Prompt v1
- 不要接入 Requirements LLM


## Prompt V1 Decision (interim — Case 1 only)

Status after Case 1:

**KEEP PROMPT V1 — CONTINUE CROSS-DOMAIN EVAL**

Do not create Prompt v2 yet.


# Case 2 — AI Scam Call Assistant

## Initial Score

Relevance: 4.7 / 5

Scope Discipline: 3.4 / 5

Constraint Alignment: 4.8 / 5

Rationale Quality: 4.6 / 5

Consistency: 4.4 / 5


## P0 Recommendations

- 通话中的非确定性风险提示
- 简单明确的行动建议
- 一键开启通话守护
- 通话后一次结果确认


## What Worked

- 风险判断保持非确定性表达
- 没有把 AI 判断描述为诈骗事实
- 保留用户最终决定权
- 没有自动挂断
- 没有自动替用户完成金融行为
- 一键联系信任的人被放入 P1，而不是强制 P0
- 家属远程查看、防骗知识库被延后
- rationale 清晰且大部分与核心问题相关


## Issue 1 — Validation Method Became Product Feature

模型将：

通话后一次结果确认

放入 P0。

其理由是，没有这一功能就无法判断用户是否因 AI 更快采取安全行动。

但“如何测量用户行为变化”不等于“V1 产品必须包含一个结果确认功能”。

早期验证可以使用：

- 用户访谈
- 测试后问卷
- 研究员观察
- 手工记录
- controlled usability test

完成。

这与 Case 1 中：

completion consistency
→ completion tracking P0

属于同一种 failure pattern。


## Issue 2 — Implementation Mechanism Became P0

模型将：

一键开启通话守护

放入 P0。

但核心产品假设是：

非确定性的风险提示和安全行动建议是否帮助用户做出更安全的决定。

真实电话链路中的“一键开启”是实现方式之一，而不是验证核心价值唯一必要的能力。

早期 MVP 可以通过：

- 模拟通话
- 手工输入通话内容
- Wizard-of-Oz
- 半人工实时辅助

验证核心价值。


## Strong Constraint Alignment

Prompt v1 correctly respected:

- AI cannot guarantee fraud
- AI does not make financial decisions
- AI does not present risk judgments as confirmed facts
- user remains in control


## Repeated Failure Pattern

Case 1:

Business / validation goal
→ Lightweight completion tracking P0

Case 2:

Behavior validation goal
→ Post-call outcome confirmation P0

Emerging systemic issue:

MVP Prioritization Prompt v1 does not reliably distinguish:

Product Feature

from:

Validation Method / Measurement Mechanism


## Case Result

PASS WITH SCOPE / VALIDATION-METHOD LEAKAGE RISK

# Case 3 — AI Inventory Planner

## Initial Score

Relevance: 4.7 / 5

Scope Discipline: 4.6 / 5

Constraint Alignment: 4.3 / 5

Rationale Quality: 4.6 / 5

Consistency: 4.6 / 5


## P0 Recommendations

- 历史订单数据导入与校验
- 次日备货量建议生成


## What Worked

- P0 数量保持收敛
- 核心能力集中在最小数据输入和次日备货建议生成
- 没有把预测效果验证转化成 prediction dashboard / outcome tracking P0
- 没有要求实时 POS / 外卖平台集成作为 P0
- 自动下单明确放入 P2
- 严格遵守“只提供建议，不自动下单”的 V1 constraint
- 节假日、天气、平台活动等高级预测因素被延后
- 食材级采购清单被延后，没有扩大为采购管理平台
- 对历史数据不完整的问题有明确意识


## Potential Issue — Constraint Guardrail May Be Under-prioritized

数据完整度与置信度提示被放入 P1。

但 Confirmed Constraint 明确指出：

历史订单数据可能不完整。

如果数据质量较低，而系统仍然展示看起来同样确定的备货建议，用户可能过度信任结果。

因此，一个轻量级的：

- 数据不足提示
- 建议仅供参考
- 覆盖天数 / 样本量提示
- uncertainty warning

可能属于 P0 guardrail，而不一定应该完全延期到 P1。

这不意味着 V1 需要复杂 confidence model。

最小版本可以只是根据数据覆盖情况显示简单的不确定性提示。


## Validation Method Leakage Check

PASS

本 Case 没有出现：

“为了验证预测是否准确”
→ 必须开发实际销量追踪 / Accuracy Dashboard / Waste Tracking

这样的 P0 扩张。

说明 Prompt v1 的 failure pattern 并非每次都会发生，但在前两个跨领域 Case 中已经重复出现。


## Constraint Alignment

PASS WITH MINOR GUARDRAIL CONCERN

自动下单被明确延期至 P2，与 V1 constraint 一致。

历史数据不完整也被识别，但其用户侧 uncertainty guardrail 可能应该进一步前置。


## Case Result

PASS


---

# Cross-case synthesis (after Cases 1–3)

## Repeated Failure Patterns

### Pattern A — Validation / Measurement → false P0

- Case 1: completion consistency → Lightweight completion tracking as P0
- Case 2: safer actions goal → post-call outcome confirmation as P0

### Pattern B — Implementation Mechanism → false P0

- Case 2: core value is risk tip + safe action advice; one-click real-call guarding elevated to P0

### Pattern C — Constraint Guardrail under-prioritized

- Case 3: incomplete historical data → data sufficiency / confidence tip as P1 (may need minimum P0 guardrail)

## Overall Prompt v1 verdict

**PASS WITH SYSTEMATIC P0 BOUNDARY RISK / NEEDS ITERATION**


## Final Decision

Create **MVP Prioritization Prompt v2**.

Do **not** delete this v1 eval file.

Do **not** wire Requirements LLM yet.

Do **not** change Schema / API / Human-in-the-loop for this iteration.

Next: regression-style re-run of the same three Cases against Prompt v2 (not started in the Prompt-only change session).


## Prompt V1 → V2 Decision

Status:

**NEEDS ITERATION → PROMPT V2 CREATED**

Live prompt file: `src/lib/ai/prompts/mvp-prioritization.ts` (v2)

Documented in: `docs/prompt_design.md`