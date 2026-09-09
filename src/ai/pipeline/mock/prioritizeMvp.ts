import type { MvpScope, ProductAnalysis, ProjectInput } from "@/ai/types";

/**
 * Mock adapter — MVP Prioritization stage.
 * Input should be the *confirmed* Product Analysis, not the raw idea alone.
 * Replace with LLM that returns the same MvpScope shape.
 */
export function mockPrioritizeMvp(
  input: ProjectInput,
  confirmedAnalysis: ProductAnalysis,
): MvpScope {
  // Confirmed analysis + constraints are the prioritization context.
  // Mock ignores model calls but keeps the stage signature for LLM swap-in.
  const _context = {
    idea: input.productIdea,
    constraints: input.constraints,
    problem: confirmedAnalysis.coreProblem.value,
  };
  void _context;

  return {
    coreHypothesis:
      "AI 能否将目标、截止日期与可用时间转化为有用的结构化学习计划（待验证假设——非已确认事实）。",
    prioritizationLogic: [
      "对验证核心产品假设的贡献",
      "对可用的「生成 → 审阅 → 决策」闭环是否必要",
      "与既定约束的契合度（聚焦规划，而非学习平台）",
      "在有证据时评估交付风险——否则推迟，待技术验证",
    ],
    tradeOffs: [
      "V1 仅验证 AI 能否将目标、截止日期与可用时间转化为有用的结构化学习计划。",
      "V1 中的计划变更通过编辑输入、重新生成或手动编辑生成计划处理——而非动态重排系统。",
      "在核心生成闭环被证明有用之前，日常任务管理与自适应调整予以推迟。",
      "提醒、分析、社交、游戏化与内容市场功能不纳入第一阶段验证。",
    ],
    features: [
      {
        id: "f1",
        name: "AI 学习计划生成",
        description:
          "基于学习目标、截止日期与可用学习时间，根据当前输入生成结构化学习计划。",
        priority: "P0",
        category: "must_have",
        rationale:
          "建议为 P0：这是验证核心假设所需的最小能力——AI 能否产出有用的结构化学习计划。",
        prioritizationBasis: ["core_user_value", "validation_critical"],
      },
      {
        id: "f2",
        name: "计划审阅与编辑",
        description:
          "让学生审阅生成的计划、编辑学习块，并在使用前接受或拒绝建议。",
        priority: "P0",
        category: "must_have",
        rationale:
          "建议为 P0，以保持 HITL：AI 提议计划，用户审阅、编辑并决定接受什么。若无此项，V1 无法在用户可控下安全验证有用性。",
        prioritizationBasis: [
          "core_user_value",
          "validation_critical",
          "human_in_the_loop",
        ],
      },
      {
        id: "f3",
        name: "每日任务管理",
        description:
          "提供聚焦的每日学习任务视图，使学生无需回看整周计划即可执行。",
        priority: "P1",
        category: "should_have",
        rationale:
          "建议为应该有——有助于日常使用，但并非验证「生成计划本身是否有用」所严格必需。V1 可先从计划审阅开始。",
        prioritizationBasis: ["not_required_for_core_validation"],
      },
      {
        id: "f4",
        name: "自适应计划调整",
        description:
          "当截止日期变化或任务未完成时，自动或半自动重排剩余日程。",
        priority: "P1",
        category: "should_have",
        rationale:
          "建议稍后——自适应重排可能提升留存，但 V1 可通过改输入、重新生成或直接编辑计划完成调整。专用调整系统非核心假设验证所需。",
        prioritizationBasis: [
          "not_required_for_core_validation",
          "complexity_needs_validation",
        ],
      },
      {
        id: "f5",
        name: "智能提醒",
        description: "为即将到来的学习块与临近截止日期的任务发送轻量提醒。",
        priority: "P1",
        category: "should_have",
        rationale:
          "可能支持留存与跟进，但不验证 AI 生成计划是否有用。建议在核心「生成 → 审阅」闭环被证明后再做。",
        prioritizationBasis: ["not_required_for_core_validation"],
      },
      {
        id: "f6",
        name: "进度分析",
        description: "让学生对比计划与完成情况，反思一段时间的规划准确度。",
        priority: "P1",
        category: "should_have",
        rationale:
          "对长期行为反馈有用，但非第一阶段验证计划质量与有用性所必需。",
        prioritizationBasis: [
          "not_required_for_core_validation",
          "complexity_needs_validation",
        ],
      },
      {
        id: "f7",
        name: "社交学习小组",
        description: "支持共享计划、同伴监督与协作排程。",
        priority: "P2",
        category: "not_now",
        rationale:
          "建议推迟——社交功能会把范围扩展到个人规划之外，非验证核心假设所需。",
        prioritizationBasis: [
          "not_required_for_core_validation",
          "complexity_needs_validation",
        ],
      },
      {
        id: "f8",
        name: "游戏化",
        description: "加入连续打卡、徽章或奖励机制，鼓励学习一致性。",
        priority: "P2",
        category: "not_now",
        rationale:
          "后续可能支持参与度，但非单独验证 AI 辅助规划是否有用所必需。",
        prioritizationBasis: ["not_required_for_core_validation"],
      },
      {
        id: "f9",
        name: "课程内容市场",
        description: "在产品内提供精选课程、资料或第三方学习内容。",
        priority: "P2",
        category: "not_now",
        rationale:
          "建议排除出 V1——市场会把产品推向学习平台，与「聚焦规划」的既定约束冲突。",
        prioritizationBasis: [
          "not_required_for_core_validation",
          "complexity_needs_validation",
        ],
      },
    ],
  };
}
