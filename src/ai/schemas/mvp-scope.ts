import { z } from "zod";

/**
 * Runtime schema for MVP Prioritization structured output.
 * Mirrors `src/ai/types/mvp-scope.ts`.
 */

export const PrioritySchema = z.enum(["P0", "P1", "P2"]);

export const FeatureCategorySchema = z.enum([
  "must_have",
  "should_have",
  "not_now",
]);

export const PrioritizationBasisSchema = z.enum([
  "core_user_value",
  "validation_critical",
  "human_in_the_loop",
  "not_required_for_core_validation",
  "complexity_needs_validation",
]);

export const MvpFeatureSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    priority: PrioritySchema,
    category: FeatureCategorySchema,
    rationale: z.string().min(1),
    prioritizationBasis: z.array(PrioritizationBasisSchema).min(1).max(5),
    editedByUser: z.boolean().optional(),
    reprioritizedByUser: z.boolean().optional(),
  })
  .superRefine((feature, ctx) => {
    const expected =
      feature.priority === "P0"
        ? "must_have"
        : feature.priority === "P1"
          ? "should_have"
          : "not_now";
    if (feature.category !== expected) {
      ctx.addIssue({
        code: "custom",
        message: `category must be ${expected} when priority is ${feature.priority}`,
        path: ["category"],
      });
    }
  });

export const MvpScopeSchema = z.object({
  coreHypothesis: z.string().min(1),
  prioritizationLogic: z.array(z.string().min(1)).min(2).max(6),
  tradeOffs: z.array(z.string().min(1)).min(2).max(6),
  features: z.array(MvpFeatureSchema).min(4).max(12),
});

export type MvpScopeParsed = z.infer<typeof MvpScopeSchema>;
