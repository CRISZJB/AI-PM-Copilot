import { z } from "zod";
import { PrioritySchema } from "./mvp-scope";

/**
 * Runtime schema for Requirements Generation structured output.
 * Mirrors `src/ai/types/requirements.ts`.
 * Root is an object (DeepSeek json_object mode) — not a bare array.
 */

export const UserStorySchema = z.object({
  asA: z.string().min(1),
  iWant: z.string().min(1),
  soThat: z.string().min(1),
});

export const AcceptanceCriterionSchema = z.object({
  given: z.string().min(1),
  when: z.string().min(1),
  then: z.string().min(1),
  and: z.array(z.string().min(1)).max(6).optional(),
});

export const RequirementEdgeCaseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  actions: z.array(z.string().min(1)).max(6).optional(),
});

export const MissingInformationHandlingSchema = z.object({
  principle: z.string().min(1),
  systemShould: z.array(z.string().min(1)).min(1).max(6),
});

export const RequirementSchema = z.object({
  id: z.string().min(1),
  featureName: z.string().min(1),
  priority: PrioritySchema,
  userStory: UserStorySchema,
  requiredInputs: z.array(z.string().min(1)).max(10).optional(),
  optionalInputs: z.array(z.string().min(1)).max(10).optional(),
  userActions: z.array(z.string().min(1)).max(12).optional(),
  systemBehavior: z.array(z.string().min(1)).min(2).max(10),
  acceptanceCriteria: z.array(AcceptanceCriterionSchema).min(2).max(8),
  missingInformation: MissingInformationHandlingSchema.optional(),
  edgeCases: z.array(RequirementEdgeCaseSchema).min(1).max(6),
});

export const RequirementsOutputSchema = z.object({
  requirements: z.array(RequirementSchema).min(1).max(8),
});

export type RequirementParsed = z.infer<typeof RequirementSchema>;
export type RequirementsOutputParsed = z.infer<typeof RequirementsOutputSchema>;
