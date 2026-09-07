import type {
  MvpFeature,
  MvpScope,
  Priority,
  ProductAnalysis,
  ProjectInput,
  ProjectWorkspace,
} from "@/ai/types";
import {
  WORKSPACE_SCHEMA_VERSION,
  categoryFromPriority,
  emptyMvpScope,
} from "@/ai/types";
import { runMockPipeline } from "@/ai/pipeline/mock";
import { buildMockWorkspace, defaultProjectInput } from "@/data/mock-project";

export const WORKSPACE_STORAGE_KEY = "ai-pm-copilot-workspace";

let cachedRaw: string | null | undefined;
let cachedWorkspace: ProjectWorkspace | null = null;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeWorkspace(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function isCurrentWorkspace(value: unknown): value is ProjectWorkspace {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ProjectWorkspace>;
  return (
    candidate.version === WORKSPACE_SCHEMA_VERSION &&
    !!candidate.input &&
    !!candidate.analysis &&
    (candidate.analysisStatus === "draft" ||
      candidate.analysisStatus === "confirmed") &&
    !!candidate.mvpScope &&
    (candidate.mvpScopeStatus === "none" ||
      candidate.mvpScopeStatus === "draft" ||
      candidate.mvpScopeStatus === "confirmed") &&
    (candidate.mvpScopeSource === "none" ||
      candidate.mvpScopeSource === "mock" ||
      candidate.mvpScopeSource === "live") &&
    Array.isArray(candidate.requirements) &&
    !!candidate.prdSync
  );
}

export function saveWorkspace(workspace: ProjectWorkspace): void {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(workspace);
  sessionStorage.setItem(WORKSPACE_STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedWorkspace = workspace;
  emitChange();
}

export function loadWorkspace(): ProjectWorkspace {
  if (typeof window === "undefined") {
    return buildMockWorkspace(defaultProjectInput);
  }

  try {
    const raw = sessionStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (raw === cachedRaw && cachedWorkspace) {
      return cachedWorkspace;
    }

    cachedRaw = raw;
    if (!raw) {
      cachedWorkspace = buildMockWorkspace(defaultProjectInput);
      return cachedWorkspace;
    }

    const parsed: unknown = JSON.parse(raw);
    if (isCurrentWorkspace(parsed)) {
      cachedWorkspace = parsed;
      return cachedWorkspace;
    }

    const input =
      parsed &&
      typeof parsed === "object" &&
      "input" in parsed &&
      (parsed as { input?: ProjectInput }).input
        ? (parsed as { input: ProjectInput }).input
        : defaultProjectInput;

    cachedWorkspace = buildMockWorkspace(input);
    saveWorkspace(cachedWorkspace);
    return cachedWorkspace;
  } catch {
    cachedWorkspace = buildMockWorkspace(defaultProjectInput);
    return cachedWorkspace;
  }
}

/** Sample / offline path — full mock pipeline (not used for live Analyze). */
export function createWorkspaceFromInput(input: ProjectInput): ProjectWorkspace {
  const workspace = buildMockWorkspace(input);
  saveWorkspace(workspace);
  return workspace;
}

/**
 * Live Product Analysis path.
 * Draft analysis; MVP starts empty (none) — PM must Confirm Analysis then Generate MVP.
 * Keeps mock Requirements as placeholders until Requirements LLM is wired.
 */
export function createWorkspaceWithAnalysis(
  input: ProjectInput,
  analysis: ProductAnalysis,
): ProjectWorkspace {
  const placeholder = runMockPipeline(input);
  const workspace: ProjectWorkspace = {
    ...placeholder,
    input,
    analysis,
    analysisStatus: "draft",
    mvpScope: emptyMvpScope(),
    mvpScopeStatus: "none",
    mvpScopeSource: "none",
    // Keep mock requirements only as non-MVP placeholder; UI still mock for that stage.
    prdSync: {
      status: "Draft",
      syncStatus: "up-to-date",
      lastSyncedLabel: "Last synced with current product decisions",
    },
  };
  saveWorkspace(workspace);
  return workspace;
}

/** Persist PM edits. Any edit after confirm returns status to draft. */
export function saveAnalysisEdits(analysis: ProductAnalysis): ProjectWorkspace {
  const current = loadWorkspace();
  const workspace: ProjectWorkspace = {
    ...current,
    analysis,
    analysisStatus: "draft",
    prdSync: {
      ...current.prdSync,
      syncStatus: "outdated",
      lastSyncedLabel: "Analysis edited — confirm again before downstream use",
    },
  };
  saveWorkspace(workspace);
  return workspace;
}

/** PM confirms analysis for downstream context. Does not call MVP LLM. */
export function confirmAnalysis(): ProjectWorkspace {
  const current = loadWorkspace();
  const workspace: ProjectWorkspace = {
    ...current,
    analysisStatus: "confirmed",
    prdSync: {
      ...current.prdSync,
      syncStatus: "up-to-date",
      lastSyncedLabel: "Analysis confirmed",
    },
  };
  saveWorkspace(workspace);
  return workspace;
}

/**
 * Replace analysis after an explicit Regenerate (preserves editedByUser via caller merge).
 * Always returns to draft — PM must confirm again.
 */
export function replaceAnalysisDraft(
  analysis: ProductAnalysis,
): ProjectWorkspace {
  const current = loadWorkspace();
  const workspace: ProjectWorkspace = {
    ...current,
    analysis,
    analysisStatus: "draft",
    prdSync: {
      ...current.prdSync,
      syncStatus: "outdated",
      lastSyncedLabel: "Analysis regenerated — review and confirm",
    },
  };
  saveWorkspace(workspace);
  return workspace;
}

/** Save live MVP generation/regeneration result as draft. */
export function saveLiveMvpScope(mvpScope: MvpScope): ProjectWorkspace {
  const current = loadWorkspace();
  if (current.analysisStatus !== "confirmed") {
    throw new Error(
      "Confirmed Product Analysis is required before MVP prioritization.",
    );
  }
  const workspace: ProjectWorkspace = {
    ...current,
    mvpScope,
    mvpScopeStatus: "draft",
    mvpScopeSource: "live",
    prdSync: {
      ...current.prdSync,
      syncStatus: "outdated",
      lastSyncedLabel: "MVP scope generated — review and confirm",
    },
  };
  saveWorkspace(workspace);
  return workspace;
}

/** Persist PM MVP edits / reprioritization — returns to draft. */
export function saveMvpScopeEdits(mvpScope: MvpScope): ProjectWorkspace {
  const current = loadWorkspace();
  const workspace: ProjectWorkspace = {
    ...current,
    mvpScope,
    mvpScopeStatus: "draft",
    // Preserve live vs mock source; edits do not turn mock into live.
    mvpScopeSource:
      current.mvpScopeSource === "none" ? "live" : current.mvpScopeSource,
    prdSync: {
      ...current.prdSync,
      syncStatus: "outdated",
      lastSyncedLabel: "MVP scope edited — confirm again before requirements",
    },
  };
  saveWorkspace(workspace);
  return workspace;
}

/** Confirm MVP scope for future Requirements. Does not call Requirements LLM. */
export function confirmMvpScope(): ProjectWorkspace {
  const current = loadWorkspace();
  if (current.mvpScopeStatus === "none" || current.mvpScopeSource === "none") {
    throw new Error("Generate MVP Scope before confirming.");
  }
  const workspace: ProjectWorkspace = {
    ...current,
    mvpScopeStatus: "confirmed",
    prdSync: {
      ...current.prdSync,
      syncStatus: "up-to-date",
      lastSyncedLabel: "MVP scope confirmed",
    },
  };
  saveWorkspace(workspace);
  return workspace;
}

export function applyFeaturePriority(
  feature: MvpFeature,
  priority: Priority,
): MvpFeature {
  const category = categoryFromPriority(priority);
  const changed =
    feature.priority !== priority || feature.category !== category;
  if (!changed) return feature;
  return {
    ...feature,
    priority,
    category,
    reprioritizedByUser: true,
  };
}
