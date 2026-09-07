/**
 * App-facing type barrel.
 * Canonical AI Contract lives in `@/ai/types`.
 * UI should import from here or `@/ai` — not redefine local shapes.
 */

export type {
  EvidenceSource,
  EvidenceField,
  ProjectInput,
  TargetUserAnalysis,
  ProductAnalysis,
  Priority,
  FeatureCategory,
  PrioritizationBasis,
  MvpFeature,
  MvpScope,
  UserStory,
  AcceptanceCriterion,
  RequirementEdgeCase,
  MissingInformationHandling,
  Requirement,
  WorkspaceSection,
  PrdSyncStatus,
  PrdSyncMeta,
  AnalysisReviewStatus,
  MvpReviewStatus,
  MvpScopeSource,
  ProjectWorkspace,
} from "@/ai/types";

export {
  WORKSPACE_SCHEMA_VERSION,
  evidence,
  fromInput,
  fromInference,
  fromNotProvided,
  categoryFromPriority,
  emptyMvpScope,
} from "@/ai/types";

/** @deprecated Prefer Requirement — alias for gradual migration */
export type { Requirement as RequirementItem } from "@/ai/types";

/** @deprecated Prefer MvpFeature */
export type { MvpFeature as FeatureItem } from "@/ai/types";
