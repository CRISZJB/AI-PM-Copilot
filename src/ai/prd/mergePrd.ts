import type { AssembledPrd } from "./assemblePrd";
import type { PrdDocument, PrdOverride } from "./override-types";

/**
 * Merge read-only assembly with PM override into a PrdDocument.
 * - Does not mutate `assembled` or `override`
 * - Does not copy any Analysis/MVP/Requirements fields from override
 *   (override type cannot express them)
 */
export function mergePrd(
  assembled: AssembledPrd,
  override: PrdOverride,
): PrdDocument {
  return {
    productOverview: { ...assembled.productOverview },
    constraints: assembled.constraints,
    targetUser: { ...assembled.targetUser },
    userProblem: {
      coreProblem: assembled.userProblem.coreProblem,
      painPoints: [...assembled.userProblem.painPoints],
      coreScenarios: [...assembled.userProblem.coreScenarios],
    },
    productHypothesis: assembled.productHypothesis,
    prioritizationLogic: [...assembled.prioritizationLogic],
    tradeOffs: [...assembled.tradeOffs],
    mvpScope: {
      mustHave: [...assembled.mvpScope.mustHave],
      outOfScope: [...assembled.mvpScope.outOfScope],
    },
    functionalRequirements: [...assembled.functionalRequirements],
    aiBehaviorRules: [...assembled.aiBehaviorRules],
    assumptions: [...assembled.assumptions],
    openQuestions: [...assembled.openQuestions],
    risks: [...assembled.risks],
    sync: { ...assembled.sync },
    successMetrics: override.successMetrics,
    validationPlan: override.validationPlan,
    openDecisions: override.openDecisions,
    pmNotes: override.pmNotes,
    overrideUpdatedAt: override.updatedAt,
  };
}
