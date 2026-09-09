import type { ProjectInput, ProductAnalysis } from "@/ai/types";
import { fromInference, fromInput, fromNotProvided } from "@/ai/types";

/**
 * Mock adapter — Product Analysis stage.
 * Sample / offline fallback — mirrors Prompt v2 provenance rules where practical.
 */
export function mockAnalyzeProduct(input: ProjectInput): ProductAnalysis {
  const ageMentioned = /\d+\s*[–\-]\s*\d+|aged|岁|年龄/i.test(
    input.targetUser,
  );

  return {
    targetUser: {
      segment: fromInput(
        input.targetUser.split(/[.,，。]/)[0]?.trim() || input.targetUser,
      ),
      ageRange: ageMentioned
        ? fromInput(
            input.targetUser.match(/\d+\s*[–\-]\s*\d+/)?.[0]?.replace(/\s/g, "") ||
              "按输入所述",
          )
        : fromNotProvided("未提供"),
      goals: [
        fromInference("可能希望把既定承诺转化为清晰、结构化的计划"),
        fromInference("可能希望保持执行一致性，而不必每次从头重建计划"),
        fromInference("优先级变化时可能希望能调整计划——有待验证的假设"),
      ],
      behaviors: [
        fromInference("可能基于当前输入，在多个工具间收集任务"),
        fromInference("可能前期承诺过多、中期交付不足——需验证"),
        fromInference("可能更偏好短时规划，而非复杂系统"),
      ],
    },
    coreProblem: fromInference(
      `基于当前输入，用户可能面临的问题：${input.problem}`,
      false,
    ),
    painPoints: [
      fromInference("相关摩擦可能包括输入分散与优先级频繁变化"),
      fromInference("计划可能在意外变化后迅速过时——有待验证的假设"),
      fromInference("多项任务都显得紧急时，用户可能难以排优先级"),
      fromInference("基于当前输入，规划本身可能让人感到耗时"),
    ],
    coreScenarios: [
      fromInference("用户可能根据目标、截止日期与可用时间创建初始计划"),
      fromInference("优先级变化时，用户可能需要回看并调整计划"),
      fromInference("开始工作前，用户可能先查看一份简短的焦点清单"),
      fromInference("阶段结束时，用户可能对比计划与实际完成情况"),
    ],
    productPositioning: fromInference(
      `${input.projectName} 帮助所述用户在既定约束内解决所述问题——而非超出这些约束的更广平台。`,
      false,
    ),
    assumptions: [
      fromInference("用户可能愿意提供实现规划价值所需的最小输入。"),
      fromInference("对目标受众而言，结构化计划可能比临时任务列表更有价值。"),
      fromInference("若 AI 建议可编辑且非权威最终决定，用户可能愿意采纳。"),
    ],
    openQuestions: [
      fromInference("用户今天放弃计划的原因是什么？", false),
      fromInference("实际中优先级变化有多频繁？", false),
      fromInference("用户愿意尝试哪些类型的 AI 建议？", false),
      fromInference("AI 是否只应建议变更，还是可以在某些情况下自动应用？", false),
    ],
  };
}
