import type {
  MvpScope,
  ProductAnalysis,
  ProjectInput,
  ProjectWorkspace,
  Requirement,
} from "@/ai/types";
import { WORKSPACE_SCHEMA_VERSION, emptyMvpScope } from "@/ai/types";
import { mockAnalyzeProduct } from "./analyzeProduct";
import { mockPrioritizeMvp } from "./prioritizeMvp";
import { mockGenerateRequirements } from "./generateRequirements";

/**
 * Stage contracts for the AI pipeline.
 * Real LLM adapters must implement the same signatures and return shapes.
 */
export interface AnalysisStage {
  run(input: ProjectInput): Promise<ProductAnalysis> | ProductAnalysis;
}

export interface MvpStage {
  /**
   * Must receive PM-confirmed Product Analysis (analysisStatus === "confirmed"),
   * never raw unconfirmed LLM output. Enforce via getConfirmedAnalysis().
   */
  run(
    input: ProjectInput,
    confirmedAnalysis: ProductAnalysis,
  ): Promise<MvpScope> | MvpScope;
}

export interface RequirementsStage {
  run(
    input: ProjectInput,
    confirmedAnalysis: ProductAnalysis,
    confirmedMvp: MvpScope,
  ): Promise<Requirement[]> | Requirement[];
}

export const mockAnalysisStage: AnalysisStage = {
  run: mockAnalyzeProduct,
};

export const mockMvpStage: MvpStage = {
  run: mockPrioritizeMvp,
};

export const mockRequirementsStage: RequirementsStage = {
  run: mockGenerateRequirements,
};

/**
 * Runs the full mock pipeline into a workspace (sample / offline fallback).
 * Live Create Project path does not use this for MVP — it waits for explicit Generate.
 */
export function runMockPipeline(input: ProjectInput): ProjectWorkspace {
  const analysis = mockAnalyzeProduct(input);
  const mvpScope = mockPrioritizeMvp(input, analysis);
  const requirements = mockGenerateRequirements(input, analysis, mvpScope);

  return {
    version: WORKSPACE_SCHEMA_VERSION,
    input,
    analysis,
    analysisStatus: "draft",
    mvpScope,
    mvpScopeStatus: "draft",
    mvpScopeSource: "mock",
    requirements,
    prdSync: {
      status: "Draft",
      syncStatus: "up-to-date",
      lastSyncedLabel: "Last synced with current product decisions",
    },
  };
}

/**
 * Example of how a later stage should be re-run after PM edits:
 * pass the *confirmed* snapshots, never ignore user changes.
 */
export function regenerateRequirementsFromConfirmed(
  workspace: ProjectWorkspace,
): Requirement[] {
  return mockGenerateRequirements(
    workspace.input,
    workspace.analysis,
    workspace.mvpScopeStatus === "none" ? emptyMvpScope() : workspace.mvpScope,
  );
}
