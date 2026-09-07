import type { ProjectInput, ProjectWorkspace } from "@/ai/types";
import { runMockPipeline } from "@/ai/pipeline/mock";

export const defaultProjectInput: ProjectInput = {
  projectName: "AI Study Planner",
  productIdea:
    "An AI-powered study planning assistant for university students.",
  targetUser: "University students aged 18–24.",
  problem:
    "Students struggle to organize study tasks, maintain consistent plans and adjust schedules when priorities change.",
  businessGoal:
    "Help students improve study planning efficiency and completion consistency.",
  constraints:
    "MVP should remain simple and focus on planning rather than becoming a full learning platform.",
};

/**
 * Builds a workspace via the mock AI pipeline.
 * Swap `runMockPipeline` for a real stage runner later — UI stays the same.
 */
export function buildMockWorkspace(input: ProjectInput): ProjectWorkspace {
  return runMockPipeline(input);
}

export const demoWorkspace = buildMockWorkspace(defaultProjectInput);
