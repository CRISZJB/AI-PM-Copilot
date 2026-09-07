/**
 * Stage 2 — MVP Scope / Prioritization (AI proposes, PM reprioritizes).
 */

export type Priority = "P0" | "P1" | "P2";

export type FeatureCategory = "must_have" | "should_have" | "not_now";

export type PrioritizationBasis =
  | "core_user_value"
  | "validation_critical"
  | "human_in_the_loop"
  | "not_required_for_core_validation"
  | "complexity_needs_validation";

export interface MvpFeature {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  category: FeatureCategory;
  rationale: string;
  prioritizationBasis: PrioritizationBasis[];
  /** PM changed name / description / rationale after AI proposal. */
  editedByUser?: boolean;
  /** PM changed priority / category after AI proposal. */
  reprioritizedByUser?: boolean;
}

export interface MvpScope {
  /**
   * Current V1 validation focus derived from confirmed analysis.
   * Hypothesis language only — not a verified fact.
   */
  coreHypothesis: string;
  prioritizationLogic: string[];
  tradeOffs: string[];
  features: MvpFeature[];
}

export function categoryFromPriority(priority: Priority): FeatureCategory {
  if (priority === "P0") return "must_have";
  if (priority === "P1") return "should_have";
  return "not_now";
}

export function emptyMvpScope(): MvpScope {
  return {
    coreHypothesis: "",
    prioritizationLogic: [],
    tradeOffs: [],
    features: [],
  };
}
