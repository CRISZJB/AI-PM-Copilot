import type { ProductAnalysis, ProjectWorkspace } from "@/ai/types";
import type { MvpScope } from "@/ai/types";

/**
 * Downstream AI stages must only receive confirmed snapshots.
 */

export function isAnalysisConfirmed(workspace: ProjectWorkspace): boolean {
  return workspace.analysisStatus === "confirmed";
}

export function getConfirmedAnalysis(
  workspace: ProjectWorkspace,
): ProductAnalysis {
  if (!isAnalysisConfirmed(workspace)) {
    throw new Error(
      "Product Analysis must be confirmed before downstream AI workflow.",
    );
  }
  return workspace.analysis;
}

export function isMvpConfirmed(workspace: ProjectWorkspace): boolean {
  return workspace.mvpScopeStatus === "confirmed";
}

export function getConfirmedMvpScope(workspace: ProjectWorkspace): MvpScope {
  if (!isMvpConfirmed(workspace)) {
    throw new Error(
      "MVP Scope must be confirmed before Requirements generation.",
    );
  }
  if (workspace.mvpScopeSource === "none") {
    throw new Error(
      "MVP Scope must be confirmed before Requirements generation.",
    );
  }
  return workspace.mvpScope;
}
