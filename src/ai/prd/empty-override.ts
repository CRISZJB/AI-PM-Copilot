import {
  PRD_OVERRIDE_VERSION,
  type PrdOverride,
} from "./override-types";

/** Empty PM overlay — safe default before the PM writes anything. */
export function emptyPrdOverride(): PrdOverride {
  return {
    version: PRD_OVERRIDE_VERSION,
    successMetrics: "",
    validationPlan: "",
    openDecisions: "",
    pmNotes: "",
    updatedAt: new Date().toISOString(),
  };
}
