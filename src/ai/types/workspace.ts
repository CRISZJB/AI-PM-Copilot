import type { ProjectInput } from "./project-input";
import type { ProductAnalysis } from "./product-analysis";
import type { MvpScope } from "./mvp-scope";
import type { Requirement } from "./requirements";

/**
 * Confirmed product state used by the workspace UI and PRD assembly.
 * Next AI stages must read the confirmed snapshots below — not raw idea alone.
 */

export type WorkspaceSection =
  | "overview"
  | "analysis"
  | "mvp"
  | "requirements"
  | "prd";

export type PrdSyncStatus = "up-to-date" | "outdated";

export interface PrdSyncMeta {
  status: "Draft";
  syncStatus: PrdSyncStatus;
  lastSyncedLabel: string;
}

/** PM review state for Product Analysis — not an LLM field. */
export type AnalysisReviewStatus = "draft" | "confirmed";

/**
 * none — no live MVP generated yet (do not show mock mixed with live)
 * draft — AI / edited MVP awaiting PM confirm
 * confirmed — locked for future Requirements
 */
export type MvpReviewStatus = "none" | "draft" | "confirmed";

/** Where the current mvpScope payload came from. */
export type MvpScopeSource = "none" | "mock" | "live";

export const WORKSPACE_SCHEMA_VERSION = 4 as const;

export interface ProjectWorkspace {
  /** Bump when contract shape changes; store migrates via pipeline rebuild. */
  version: typeof WORKSPACE_SCHEMA_VERSION;
  input: ProjectInput;
  /** Proposed or PM-edited Product Analysis */
  analysis: ProductAnalysis;
  /**
   * draft — AI (or edit) output awaiting PM confirm
   * confirmed — PM locked analysis for downstream context
   */
  analysisStatus: AnalysisReviewStatus;
  /** MVP prioritization payload (empty when mvpScopeStatus is none) */
  mvpScope: MvpScope;
  mvpScopeStatus: MvpReviewStatus;
  mvpScopeSource: MvpScopeSource;
  /** Confirmed requirements for scoped features */
  requirements: Requirement[];
  /** Sync metadata only — PRD body is assembled, not regenerated */
  prdSync: PrdSyncMeta;
}
