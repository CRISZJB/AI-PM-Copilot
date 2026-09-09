import type {
  EvidenceField,
  MvpFeature,
  MvpScope,
  ProjectWorkspace,
  Requirement,
} from "@/ai/types";

/**
 * Assembled PRD document — read-only projection of confirmed decisions.
 * No LLM call. No independent product decisions.
 */

export type PrdTraceSource =
  | "Project Input"
  | "Product Analysis"
  | "MVP Scope"
  | "Requirements";

export interface AssembledPrd {
  productOverview: {
    productName: string;
    productSummary: string;
    productGoal: string;
  };
  /** From Project Input — scope boundary for the PRD. */
  constraints: string;
  targetUser: {
    segment: string;
    ageRange: string;
    fromInput: string;
  };
  userProblem: {
    coreProblem: string;
    painPoints: string[];
    coreScenarios: string[];
  };
  productHypothesis: string;
  /** From MVP Scope — prioritization rationale (verbatim projection). */
  prioritizationLogic: string[];
  /** From MVP Scope — explicit trade-offs (verbatim projection). */
  tradeOffs: string[];
  mvpScope: {
    mustHave: MvpFeature[];
    outOfScope: MvpFeature[];
  };
  functionalRequirements: Requirement[];
  aiBehaviorRules: string[];
  assumptions: EvidenceField[];
  openQuestions: EvidenceField[];
  /** Derived display risks (often from tradeOffs); kept for existing UI. */
  risks: string[];
  sync: ProjectWorkspace["prdSync"];
}

function values(fields: EvidenceField[]): string[] {
  return fields.map((field) => field.value);
}

/** Domain-agnostic HITL rules, plus P0 features that require human control. */
function buildAiBehaviorRules(mustHave: MvpFeature[]): string[] {
  const rules: string[] = [
    "不要静默编造缺失的必填输入；应明确询问或标注假设。",
    "用户继续后使用的假设必须标注为待确认。",
    "推断或系统估算的值必须向用户清晰标注。",
    "约束冲突必须先暴露，再将输出视为最终结果。",
    "用户编辑与已确认决策不得被静默覆盖。",
    "重新生成未确认内容时，必须保留手动编辑区块。",
    "完整重新生成需确认，并列出可能被替换的编辑项。",
    "若重新生成失败，保留用户当前已编辑输出。",
  ];

  for (const feature of mustHave) {
    if (feature.prioritizationBasis.includes("human_in_the_loop")) {
      rules.push(
        `对「${feature.name}」保持人工控制（HITL）：用户必须能在审阅、决策或修订后再将输出视为最终结果。`,
      );
    }
  }

  return rules;
}

/** Prefer MVP trade-offs; fall back to generic (non-industry) risks. */
function buildRisks(mvpScope: MvpScope, mustHave: MvpFeature[]): string[] {
  if (mvpScope.tradeOffs.length > 0) {
    return mvpScope.tradeOffs.map((note) => `范围取舍：${note}`);
  }

  const risks = [
    "上游未充分确认可能导致 PRD 与预期 MVP 不符。",
    "若不确定性与假设未标注清楚，用户可能过度信任 AI 输出。",
  ];

  if (mustHave.length > 0) {
    risks.push(
      `必须有范围（${mustHave.map((f) => f.name).join("、")}）若核心用户行为被推迟或错误替换，仍可能验证失败。`,
    );
  }

  return risks;
}

function buildProductHypothesis(
  workspace: ProjectWorkspace,
  mvpScope: MvpScope,
): string {
  if (mvpScope.coreHypothesis.trim()) {
    return `假设：${mvpScope.coreHypothesis.trim()} 这仍是待验证假设——非已确认用户调研结论。`;
  }

  const { analysis } = workspace;
  return `假设：针对 ${analysis.targetUser.segment.value} 解决「${analysis.coreProblem.value}」仍是待验证假设——非已确认用户调研结论。`;
}

/**
 * Programmatic PRD assembly from confirmed workspace state.
 */
export function assemblePrd(workspace: ProjectWorkspace): AssembledPrd {
  const { input, analysis, mvpScope, requirements, prdSync } = workspace;

  const mustHave = mvpScope.features.filter(
    (feature) => feature.category === "must_have",
  );
  const outOfScope = mvpScope.features.filter(
    (feature) => feature.category !== "must_have",
  );

  const p0Requirements = requirements.filter(
    (requirement) => requirement.priority === "P0",
  );

  return {
    productOverview: {
      productName: input.projectName,
      productSummary:
        analysis.productPositioning.value.replace(/^Proposed positioning:\s*/i, "") ||
        input.productIdea,
      productGoal: input.businessGoal,
    },
    constraints: input.constraints,
    targetUser: {
      segment: analysis.targetUser.segment.value,
      ageRange: analysis.targetUser.ageRange.value,
      fromInput: input.targetUser,
    },
    userProblem: {
      coreProblem: analysis.coreProblem.value,
      painPoints: values(analysis.painPoints),
      coreScenarios: values(analysis.coreScenarios),
    },
    productHypothesis: buildProductHypothesis(workspace, mvpScope),
    prioritizationLogic: [...mvpScope.prioritizationLogic],
    tradeOffs: [...mvpScope.tradeOffs],
    mvpScope: {
      mustHave,
      outOfScope,
    },
    functionalRequirements: p0Requirements,
    // Assembled from MVP Scope / HITL intent — not independently regenerated
    aiBehaviorRules: buildAiBehaviorRules(mustHave),
    assumptions: analysis.assumptions,
    openQuestions: analysis.openQuestions,
    risks: buildRisks(mvpScope, mustHave),
    sync: prdSync,
  };
}
