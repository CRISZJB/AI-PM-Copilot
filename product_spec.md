# AI PM Copilot

> This specification was reconstructed from the current implementation and project decision history after the original product_spec.md was found missing.
>
> Sources used: current UI, `docs/project_handoff.md`, `docs/ai_architecture.md`, `docs/prompt_design.md`, `docs/eval_v1.md`, and current code contracts. This is not a new brainstorm.

---

## Product Goal

帮助产品经理将模糊的产品想法转化为结构化、可审查、可追溯的：

**Product Analysis → MVP Scope → Requirements → PRD**

本产品不是通用 ChatGPT 对话框，而是结构化的 AI 产品工作流工具。

---

## Target User

产品经理、产品实习生，以及需要快速验证产品想法的小型团队成员。

（Portfolio 语境下，也可作为向招聘方展示 AI PM 工作方式的作品。）

---

## Core User Problem

产品早期通常只有模糊 Idea。

用户需要进一步完成：

- 用户问题分析
- 假设形成
- MVP 范围判断
- 功能优先级
- Requirements
- PRD

传统流程需要大量从空白开始的结构化整理。本产品用分阶段、可审查的 AI 协作降低这一负担。

---

## Product Principle

- **AI proposes. PM decides.**
- **AI inference ≠ verified fact.**
- **Missing information should not be silently invented.**
- **Human-in-the-loop.**
- **MVP validates the smallest core hypothesis.**
- **PRD is assembled from confirmed upstream decisions.**

Provenance（Product Analysis）当前支持：

| Source | Meaning |
|--------|---------|
| `user_input` | 用户明确提供的信息 |
| `ai_inference` | AI 基于已有上下文形成的假设或推断 |
| `not_provided` | 用户未提供；AI 不应主动补全 |

`needsValidation` 仅表示某个 **AI inference** 是否需要后续产品验证；`not_provided` 本身不等于 `needsValidation`。

---

## Core Workflow

```
Create Project
    → Product Analysis
    → Review / Edit / Confirm
    → MVP Scope
    → Review / Reprioritize
    → Requirements
    → Review / Edit
    → PRD Assembly
```

设计意图：每一阶段 AI 提出建议，PM 审查确认后，确认结果成为下一阶段输入。

实现说明：Analysis 的 Edit / Regenerate / Confirm 门闩尚未完全落地；live Analysis 成功后会先用 Mock 填充 MVP 与 Requirements 占位。

---

## Current Implementation Status

| Stage | Status |
|-------|--------|
| Product Analysis | **Real DeepSeek**（Prompt v2 **FROZEN FOR CURRENT MVP** + Zod） |
| Analysis Review Gate | **Draft → Edit → Confirm**（`analysisStatus`） |
| MVP Scope | **Real DeepSeek**（Prompt v1 + Zod；需 Confirmed Analysis + 显式 Generate） |
| MVP Review Gate | **none → Draft → Edit / Reprioritize → Confirm** |
| Requirements | **Mock** |
| PRD | **Assembly**（`assemblePrd`，不调用 LLM） |

Provider / env（名称 only）：`DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL`、`DEEPSEEK_BASE_URL`。

---

## Current MVP Scope

演示案例（AI Study Planner mock prioritization）已确认范围：

### P0 / Must Have

- AI Study Plan Generator
- Plan Review & Edit

### P1 / Should Have

- Daily Task Management
- Adaptive Plan Adjustment
- Smart Reminders
- Progress Analytics

### Not Now / P2

- Social Study Groups
- Gamification
- Course Marketplace

P0 收紧原因：V1 只需验证最小闭环 **generate → review → decide**（AI 能否根据目标、截止日期与可用时间生成有用的结构化学习计划）。

---

## AI Evaluation Strategy

对 Product Analysis Prompt 进行人工 Eval。

评分维度（1–5）：

- Relevance
- Groundedness
- Structure
- Actionability
- Consistency

已完成：Prompt **v1** 三组跨领域 Case（见 `docs/eval_v1.md`）：

1. AI Study Planner
2. AI Scam Call Assistant
3. AI Inventory Planner

下一步（尚未开始）：对 Prompt **v2** 用完全相同的三个 Case 做 Regression Eval。在此完成前，不接入 MVP Scope LLM。

---

## Explicit non-claims

本 Spec **不包含**虚构的用户数量、效率提升、市场规模或未发生的验证结果。
