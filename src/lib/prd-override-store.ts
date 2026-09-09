import {
  emptyPrdOverride,
  PRD_OVERRIDE_VERSION,
  type PrdOverride,
} from "@/ai/prd";

/**
 * PM PRD overlay persistence — independent from ProjectWorkspace.
 * Key: ai-pm-copilot-prd-override-v1 → { [normalizedProjectName]: PrdOverride }
 */

export const PRD_OVERRIDE_STORAGE_KEY = "ai-pm-copilot-prd-override-v1";

export function normalizeProjectKey(projectName: string): string {
  const normalized = projectName.trim().toLowerCase().replace(/\s+/g, "-");
  return normalized || "unnamed";
}

function isPrdOverride(value: unknown): value is PrdOverride {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PrdOverride>;
  return (
    candidate.version === PRD_OVERRIDE_VERSION &&
    typeof candidate.successMetrics === "string" &&
    typeof candidate.validationPlan === "string" &&
    typeof candidate.openDecisions === "string" &&
    typeof candidate.pmNotes === "string" &&
    typeof candidate.updatedAt === "string"
  );
}

type OverrideMap = Record<string, PrdOverride>;

function readMap(): OverrideMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(PRD_OVERRIDE_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const map: OverrideMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (isPrdOverride(value)) {
        map[key] = value;
      }
    }
    return map;
  } catch {
    return {};
  }
}

function writeMap(map: OverrideMap): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PRD_OVERRIDE_STORAGE_KEY, JSON.stringify(map));
}

/** Load PM override for a project; empty default if missing. */
export function loadPrdOverride(projectName: string): PrdOverride {
  const key = normalizeProjectKey(projectName);
  const map = readMap();
  return map[key] ?? emptyPrdOverride();
}

/** Persist PM override for a project (does not touch ProjectWorkspace). */
export function savePrdOverride(
  projectName: string,
  override: PrdOverride,
): void {
  const key = normalizeProjectKey(projectName);
  const map = readMap();
  map[key] = {
    ...override,
    version: PRD_OVERRIDE_VERSION,
    updatedAt: new Date().toISOString(),
  };
  writeMap(map);
}

/** Remove override for one project. */
export function clearPrdOverride(projectName: string): void {
  const key = normalizeProjectKey(projectName);
  const map = readMap();
  if (!(key in map)) return;
  delete map[key];
  writeMap(map);
}
