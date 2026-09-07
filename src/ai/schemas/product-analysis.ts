import { z } from "zod";

/**
 * Zod schemas are the runtime Single Source of Truth for AI I/O.
 * Shapes mirror `src/ai/types` — do not invent a parallel API schema.
 */

export const EvidenceSourceSchema = z.enum([
  "user_input",
  "ai_inference",
  "not_provided",
]);

export const EvidenceFieldSchema = z.object({
  value: z.string().min(1),
  source: EvidenceSourceSchema,
  needsValidation: z.boolean(),
  /** Optional — set by the app after PM edits; not required from the LLM. */
  editedByUser: z.boolean().optional(),
});

export const ProjectInputSchema = z.object({
  projectName: z.string().min(1),
  productIdea: z.string().min(1),
  targetUser: z.string().min(1),
  problem: z.string().min(1),
  businessGoal: z.string().min(1),
  constraints: z.string().min(1),
});

export const TargetUserAnalysisSchema = z.object({
  segment: EvidenceFieldSchema,
  ageRange: EvidenceFieldSchema,
  goals: z.array(EvidenceFieldSchema).min(2).max(5),
  behaviors: z.array(EvidenceFieldSchema).min(2).max(5),
});

export const ProductAnalysisSchema = z.object({
  targetUser: TargetUserAnalysisSchema,
  coreProblem: EvidenceFieldSchema,
  painPoints: z.array(EvidenceFieldSchema).min(2).max(6),
  coreScenarios: z.array(EvidenceFieldSchema).min(2).max(6),
  productPositioning: EvidenceFieldSchema,
  assumptions: z.array(EvidenceFieldSchema).min(2).max(5),
  openQuestions: z.array(EvidenceFieldSchema).min(2).max(6),
});

export type ProjectInputParsed = z.infer<typeof ProjectInputSchema>;
export type ProductAnalysisParsed = z.infer<typeof ProductAnalysisSchema>;
