/**
 * Public AI layer entrypoints.
 * UI and store should depend on these contracts — not on page-local mock shapes.
 */

export * from "./types";
export * from "./schemas";
export {
  runMockPipeline,
  mockAnalyzeProduct,
  mockPrioritizeMvp,
  mockGenerateRequirements,
  regenerateRequirementsFromConfirmed,
} from "./pipeline/mock";
export type {
  AnalysisStage,
  MvpStage,
  RequirementsStage,
} from "./pipeline/mock";
export { assemblePrd } from "./prd";
export type { AssembledPrd, PrdTraceSource } from "./prd";
