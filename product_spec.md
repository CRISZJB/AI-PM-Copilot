# AI PM Copilot

> This specification was reconstructed from the current implementation and project decision history after the original product_spec.md was found missing.
>
> Sources used: current UI, `docs/project_handoff.md`, `docs/ai_architecture.md`, `docs/prompt_design.md`, eval docs, and current code contracts. Updated 2026-09-07 for PRD v2.

---

## Product Goal

帮助产品经理将模糊的产品想法转化为结构化、可审查、可追溯的：

**Product Analysis → MVP Scope → Requirements → PRD（可编辑补充 + Markdown 下载）**

本产品不是通用 ChatGPT 对话框，而是结构化的 AI 产品工作流工具。

最终产物：一份供 PM 参考的 **PRD 草稿**——上游决策装配初稿 + PM 补充，可下载 Markdown。

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
- **PRD is assembled from upstream decisions; PM adds validation/success notes — no PRD LLM.**
- **PRD Override must not rewrite Analysis / MVP / Requirements.**

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
    → Explicit Generate MVP Scope
    → Review / Reprioritize / Confirm
    → Explicit Generate Requirements
    → PRD Workspace
         assemblePrd → mergePrd(PrdOverride) → 查看 / 补充 / Markdown 下载
```

设计意图：每一阶段 AI 提出建议，PM 审查确认后，确认结果成为下一阶段输入。PRD 不做独立 AI 再生成。

---

## Current Implementation Status

| Stage | Status |
|-------|--------|
| Product Analysis | **Live DeepSeek**（Prompt **v2 FROZEN** + Zod） |
| Analysis Review Gate | **Draft → Edit → Confirm**（`analysisStatus`） |
| MVP Scope | **Live DeepSeek**（Prompt **v3 FROZEN** + Zod；需 Confirmed Analysis + 显式 Generate） |
| MVP Review Gate | **none → Draft → Edit / Reprioritize → Confirm** |
| Requirements | **Live DeepSeek**（Prompt **v2 FROZEN** + Zod；需 Confirmed Analysis + Confirmed MVP + 显式 Generate） |
| PRD | **v2：assemblePrd → mergePrd → Workspace → Markdown Export**（无 LLM） |

Provider / env（名称 only）：`DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL`、`DEEPSEEK_BASE_URL`。

---

## PRD v2 行为（产品层）

| 能力 | 说明 |
|------|------|
| 初稿来源 | `assemblePrd(workspace)` 只读投影 |
| PM 补充 | `successMetrics` / `validationPlan` / `openDecisions` / `pmNotes` |
| 存储 | 独立 sessionStorage（`prd-override-store`），**不写入** `ProjectWorkspace` |
| 导出 | `mergePrd` → `prdToMarkdown`（完整 Requirements，非 UI 截断） |
| 禁止 | PRD LLM；从 PRD 回写上游 |

---

## Current MVP Scope（Sample Case）

演示案例（AI 学习规划助手）在 Copilot 中作为 Sample Product Case，不是第二产品：

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

P0 收紧原因：V1 只需验证最小闭环 **generate → review → decide**。

---

## AI Evaluation Strategy

已对 Analysis / MVP / Requirements 完成跨领域 Case Eval，当前 Prompt 均 **FROZEN**：

| Layer | Eval | Status |
|-------|------|--------|
| Product Analysis Prompt v2 | `docs/regression_eval_v2.md` | FROZEN |
| MVP Prioritization Prompt v3 | `docs/mvp_eval_v3.md` | FROZEN（3/3） |
| Requirements Prompt v2 | `docs/requirements_eval_v2.md` | FROZEN（3/3） |

Case 集：AI Study Planner / AI Scam Call Assistant / AI Inventory Planner。

PRD 无 Prompt Eval（无 LLM）；装配与导出用 `scripts/test-prd-v2.ts` 校验。

---

## Explicit non-claims

本 Spec **不包含**虚构的用户数量、效率提升、市场规模或未发生的验证结果。
