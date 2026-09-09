import type { AssembledPrd } from "./assemblePrd";

/**
 * PRD v2 PM overlay types.
 * Independent from ProjectWorkspace / AI Zod schemas.
 * Override may only add PM supplement — never replace assembled upstream content.
 */

export const PRD_OVERRIDE_VERSION = 1 as const;

/** Stable section ids for future sectionNotes (not used in v2.0 minimal override). */
export type PrdSectionId =
  | "overview"
  | "constraints"
  | "targetUser"
  | "userProblem"
  | "hypothesis"
  | "mvpScope"
  | "requirements"
  | "aiBehavior"
  | "assumptions"
  | "openQuestions"
  | "risks"
  | "pmSupplement";

/**
 * PM-authored PRD fields only.
 * Must not contain Analysis / MVP / Requirements payload fields.
 */
export interface PrdOverride {
  version: typeof PRD_OVERRIDE_VERSION;
  successMetrics: string;
  validationPlan: string;
  openDecisions: string;
  pmNotes: string;
  updatedAt: string;
}

/**
 * View/export document: assembled snapshot + PM supplement.
 * Assembled fields are a structural copy from AssembledPrd (read-only source).
 */
export type PrdDocument = AssembledPrd & {
  successMetrics: string;
  validationPlan: string;
  openDecisions: string;
  pmNotes: string;
  overrideUpdatedAt: string;
};
