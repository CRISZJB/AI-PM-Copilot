import type { EvidenceField, MvpFeature, Requirement } from "@/ai/types";
import type { PrdDocument } from "./override-types";

function escapeMd(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

function bulletList(items: string[], emptyLabel = "（无）"): string {
  if (items.length === 0) return emptyLabel;
  return items.map((item) => `- ${escapeMd(item)}`).join("\n");
}

function evidenceList(fields: EvidenceField[]): string {
  if (fields.length === 0) return "（无）";
  return fields
    .map((field) => {
      const flags: string[] = [];
      if (field.source) flags.push(field.source);
      if (field.needsValidation) flags.push("needsValidation");
      if (field.editedByUser) flags.push("editedByUser");
      const suffix = flags.length > 0 ? ` _(${flags.join(", ")})_` : "";
      return `- ${escapeMd(field.value)}${suffix}`;
    })
    .join("\n");
}

function formatFeature(feature: MvpFeature): string {
  const lines = [
    `### ${escapeMd(feature.name)}`,
    "",
    `- 优先级：${feature.priority}（${feature.category}）`,
    `- 说明：${escapeMd(feature.description)}`,
  ];
  if (feature.rationale.trim()) {
    lines.push(`- 理由：${escapeMd(feature.rationale)}`);
  }
  if (feature.prioritizationBasis.length > 0) {
    lines.push(`- 依据标签：${feature.prioritizationBasis.join(", ")}`);
  }
  return lines.join("\n");
}

function formatAcceptance(requirement: Requirement): string {
  if (requirement.acceptanceCriteria.length === 0) return "（无）";
  return requirement.acceptanceCriteria
    .map((criterion, index) => {
      const parts = [
        `${index + 1}. **Given** ${escapeMd(criterion.given)}`,
        `   **When** ${escapeMd(criterion.when)}`,
        `   **Then** ${escapeMd(criterion.then)}`,
      ];
      if (criterion.and && criterion.and.length > 0) {
        for (const item of criterion.and) {
          parts.push(`   **And** ${escapeMd(item)}`);
        }
      }
      return parts.join("\n");
    })
    .join("\n\n");
}

function formatRequirement(requirement: Requirement, index: number): string {
  const story = requirement.userStory;
  const sections: string[] = [
    `### REQ-${String(index + 1).padStart(2, "0")} ${escapeMd(requirement.featureName)}`,
    "",
    `- 优先级：${requirement.priority}`,
    "",
    "**用户故事**",
    "",
    `作为 ${escapeMd(story.asA)}，我想要 ${escapeMd(story.iWant)}，以便 ${escapeMd(story.soThat)}。`,
    "",
  ];

  if (requirement.requiredInputs && requirement.requiredInputs.length > 0) {
    sections.push("**必填输入**", "", bulletList(requirement.requiredInputs), "");
  }
  if (requirement.optionalInputs && requirement.optionalInputs.length > 0) {
    sections.push("**可选输入**", "", bulletList(requirement.optionalInputs), "");
  }
  if (requirement.userActions && requirement.userActions.length > 0) {
    sections.push("**用户操作**", "", bulletList(requirement.userActions), "");
  }

  sections.push(
    "**系统行为**",
    "",
    bulletList(requirement.systemBehavior),
    "",
    "**验收标准**",
    "",
    formatAcceptance(requirement),
    "",
  );

  if (requirement.missingInformation) {
    sections.push(
      "**缺失信息处理**",
      "",
      escapeMd(requirement.missingInformation.principle),
      "",
      bulletList(requirement.missingInformation.systemShould),
      "",
    );
  }

  if (requirement.edgeCases.length > 0) {
    sections.push("**边界情况**", "");
    for (const edge of requirement.edgeCases) {
      sections.push(`- **${escapeMd(edge.title)}**：${escapeMd(edge.description)}`);
      if (edge.actions && edge.actions.length > 0) {
        sections.push(`  - 可采取：${edge.actions.map(escapeMd).join("；")}`);
      }
    }
    sections.push("");
  }

  return sections.join("\n").trimEnd();
}

function pmBlock(label: string, value: string): string {
  const body = value.trim() ? escapeMd(value) : "（未填写）";
  return `### ${label}\n\n${body}`;
}

/**
 * Pure projection: PrdDocument → Markdown PRD.
 * Uses the full document (complete Requirements + PM supplement).
 * No LLM. No UI truncation.
 */
export function prdToMarkdown(document: PrdDocument): string {
  const title = document.productOverview.productName || "未命名产品";

  const parts: string[] = [
    `# ${escapeMd(title)} — PRD 草稿`,
    "",
    `> 由 AI PM Copilot 装配上游产品决策，并合并 PM 补充。非独立 LLM 生成。`,
    "",
    "## 产品概述",
    "",
    `- **产品名称：** ${escapeMd(document.productOverview.productName)}`,
    `- **产品摘要：** ${escapeMd(document.productOverview.productSummary)}`,
    `- **约束条件：** ${escapeMd(document.constraints) || "（未提供）"}`,
    "",
    "### 目标用户",
    "",
    `- 细分：${escapeMd(document.targetUser.segment)}`,
    `- 年龄：${escapeMd(document.targetUser.ageRange)}`,
    `- 项目输入：${escapeMd(document.targetUser.fromInput)}`,
    "",
    "## 用户问题",
    "",
    "### 核心问题",
    "",
    escapeMd(document.userProblem.coreProblem) || "（未提供）",
    "",
    "### 痛点",
    "",
    bulletList(document.userProblem.painPoints),
    "",
    "### 核心场景",
    "",
    bulletList(document.userProblem.coreScenarios),
    "",
    "## 产品目标",
    "",
    escapeMd(document.productOverview.productGoal) || "（未提供）",
    "",
    "### 产品假设",
    "",
    escapeMd(document.productHypothesis) || "（未提供）",
    "",
    "## MVP 范围",
    "",
    "### P0 / 必须有",
    "",
  ];

  if (document.mvpScope.mustHave.length === 0) {
    parts.push("（尚未定义必须有功能）", "");
  } else {
    for (const feature of document.mvpScope.mustHave) {
      parts.push(formatFeature(feature), "");
    }
  }

  parts.push("### V1 范围外", "");
  if (document.mvpScope.outOfScope.length === 0) {
    parts.push("（无）", "");
  } else {
    for (const feature of document.mvpScope.outOfScope) {
      parts.push(
        `- **${escapeMd(feature.name)}**（${feature.priority} · ${feature.category}）：${escapeMd(feature.description)}`,
      );
    }
    parts.push("");
  }

  parts.push("## 功能需求", "");
  if (document.functionalRequirements.length === 0) {
    parts.push("（尚未生成需求）", "");
  } else {
    document.functionalRequirements.forEach((requirement, index) => {
      parts.push(formatRequirement(requirement, index), "", "---", "");
    });
  }

  parts.push(
    "## 决策依据",
    "",
    "### 优先级逻辑",
    "",
    bulletList(document.prioritizationLogic),
    "",
    "### 范围取舍",
    "",
    bulletList(document.tradeOffs),
    "",
    "### AI 行为与失败处理",
    "",
    bulletList(document.aiBehaviorRules),
    "",
    "### 待验证假设",
    "",
    evidenceList(document.assumptions),
    "",
    "### 待解问题",
    "",
    evidenceList(document.openQuestions),
    "",
    "## 风险与限制",
    "",
    bulletList(document.risks),
    "",
    `约束回顾：${escapeMd(document.constraints) || "（未提供）"}`,
    "",
    "## PM 补充",
    "",
    pmBlock("成功标准", document.successMetrics),
    "",
    pmBlock("验证计划", document.validationPlan),
    "",
    pmBlock("开放决策", document.openDecisions),
    "",
    pmBlock("备注", document.pmNotes),
    "",
  );

  if (document.overrideUpdatedAt.trim()) {
    parts.push(`_PM 补充更新于：${escapeMd(document.overrideUpdatedAt)}_`, "");
  }

  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
