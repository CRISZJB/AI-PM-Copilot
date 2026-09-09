import type { ProjectInput, ProjectWorkspace } from "@/ai/types";
import { runMockPipeline } from "@/ai/pipeline/mock";

export const defaultProjectInput: ProjectInput = {
  projectName: "AI 学习规划助手",
  productIdea: "面向大学生的 AI 学习规划助手。",
  targetUser: "18–24 岁的大学生。",
  problem:
    "学生难以组织学习任务、保持计划一致性，并在优先级变化时调整安排。",
  businessGoal: "帮助学生提升学习规划效率与完成一致性。",
  constraints:
    "MVP 应保持简单，聚焦规划而非完整学习平台。",
};

/**
 * Builds a workspace via the mock AI pipeline.
 * Swap `runMockPipeline` for a real stage runner later — UI stays the same.
 */
export function buildMockWorkspace(input: ProjectInput): ProjectWorkspace {
  return runMockPipeline(input);
}

export const demoWorkspace = buildMockWorkspace(defaultProjectInput);
