import type {
  EvidenceField,
  MvpFeature,
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
  mvpScope: {
    mustHave: MvpFeature[];
    outOfScope: MvpFeature[];
  };
  functionalRequirements: Requirement[];
  aiBehaviorRules: string[];
  assumptions: EvidenceField[];
  openQuestions: EvidenceField[];
  risks: string[];
  sync: ProjectWorkspace["prdSync"];
}

function values(fields: EvidenceField[]): string[] {
  return fields.map((field) => field.value);
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

  const curatedRules = [
    "AI should not silently invent missing Required Inputs",
    "Assumptions used after explicit user continuation must be labeled Assumption / Needs Confirmation",
    "System-calculated durations must be marked Estimated",
    "Constraint conflicts must be surfaced as Constraint conflict / Plan may be infeasible",
    "User edits must not be silently overwritten",
    "Regenerate Unconfirmed Content must preserve confirmed or manually edited blocks",
    "Regenerate Full Plan requires confirmation that lists which edits may be replaced",
    "Regeneration failure must preserve the user’s current edited plan",
  ];

  return {
    productOverview: {
      productName: input.projectName,
      productSummary:
        analysis.productPositioning.value.replace(/^Proposed positioning:\s*/i, "") ||
        input.productIdea,
      productGoal: input.businessGoal,
    },
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
    productHypothesis:
      "Hypothesis: AI can help university students turn learning goals, deadlines, and available study time into a useful structured study plan. This remains a hypothesis to validate in V1 — not a confirmed user research finding.",
    mvpScope: {
      mustHave,
      outOfScope,
    },
    functionalRequirements: p0Requirements,
    // Assembled from Requirements intent — not independently regenerated
    aiBehaviorRules: curatedRules,
    assumptions: analysis.assumptions,
    openQuestions: analysis.openQuestions,
    risks: [
      "AI-generated plans may appear plausible but still be impractical for the user’s real schedule",
      "Incomplete Required Inputs may reduce plan quality or trigger assumption-heavy drafts",
      "Users may over-trust AI-generated schedules if estimates and conflicts are not labeled clearly",
      "Full regeneration may conflict with manually edited or confirmed content if confirmation is skipped",
    ],
    sync: prdSync,
  };
}
