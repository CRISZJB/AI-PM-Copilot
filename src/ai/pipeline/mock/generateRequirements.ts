import type {
  MvpScope,
  ProductAnalysis,
  ProjectInput,
  Requirement,
} from "@/ai/types";

/**
 * Mock adapter — Requirements Generation stage.
 * Input should be confirmed Project Input + Analysis + MVP Scope.
 * Typically scoped to Must Have / P0 features only.
 */
export function mockGenerateRequirements(
  _input: ProjectInput,
  _confirmedAnalysis: ProductAnalysis,
  confirmedMvp: MvpScope,
): Requirement[] {
  const mustHaveNames = new Set(
    confirmedMvp.features
      .filter((feature) => feature.category === "must_have")
      .map((feature) => feature.name),
  );

  const catalog: Requirement[] = [
    {
      id: "r1",
      featureName: "AI 学习计划生成",
      priority: "P0",
      userStory: {
        asA: "一名大学生",
        iWant: "根据学习目标、截止日期与可用学习时间生成学习计划",
        soThat: "我能清楚知道该学什么、何时学",
      },
      requiredInputs: ["学习目标 / 学习任务", "截止日期", "可用学习时间"],
      optionalInputs: ["约束条件", "学习偏好"],
      systemBehavior: [
        "基于用户提供的输入，将学习任务组织为结构化学习计划",
        "当总预估工作量 ≤ 该截止日期前的可用学习时间时，将各任务安排在相关截止日期当天或之前",
        "生成计划中各预估时长之和 ≤ 用户声明的覆盖周期内可用学习时间",
        "若总预估工作量 > 截止日期前可用学习时间，不得静默呈现「完整可行」计划；应暴露约束冲突 / 计划可能不可行状态",
        "不得将缺失的必填输入编造为用户已提供的事实",
        "若用户在必填输入不完整时仍明确选择继续，则将所用假设标注为「假设 / 待确认」",
        "每个学习块包含任务、日期与预估时长字段，并保持稳定结构",
      ],
      acceptanceCriteria: [
        {
          given:
            "必填输入齐全：学习目标 / 学习任务、截止日期与可用学习时间",
          when: "用户点击生成计划",
          then: "系统生成结构化学习计划",
          and: [
            "每个学习块包含任务、日期与预估时长",
            "计划中预估时长之和 ≤ 用户声明的覆盖周期内可用学习时间",
          ],
        },
        {
          given:
            "与某截止日期关联的任务总预估工作量 ≤ 该截止日期前的可用学习时间",
          when: "系统生成计划",
          then: "这些任务的任何学习块都不会被安排在该截止日期之后",
        },
        {
          given:
            "与某截止日期关联的任务总预估工作量 > 该截止日期前的可用学习时间",
          when: "用户点击生成计划",
          then: "系统显示「约束冲突 / 计划可能不可行」，且不以完全可行计划呈现结果",
          and: ["用户可选择调整截止日期、减少工作量或增加可用学习时间"],
        },
        {
          given: "至少缺少一项必填输入",
          when: "用户点击生成计划",
          then: "系统默认不生成完整计划",
          and: [
            "系统点名每项缺失的必填输入并请用户补充",
            "仅在用户明确选择继续后，才可带着假设开始生成",
            "所用假设标注为「假设 / 待确认」，不以用户已提供事实展示",
          ],
        },
        {
          given: "任务时长未由用户提供，需由系统计算",
          when: "生成计划包含时长值",
          then: "此类时长均标注为「预估」",
        },
        {
          given: "用户点击生成计划后生成失败",
          when: "失败返回到界面",
          then: "系统展示「重试」与「检查输入」作为恢复操作",
        },
      ],
      missingInformation: {
        principle:
          "缺少必填输入时，默认阻止完整计划生成。仅在用户明确确认后才允许带假设继续，且必须标注为「假设 / 待确认」。",
        systemShould: [
          "按名称列出每项缺失的必填输入",
          "在生成完整计划前请求用户补充缺失输入",
          "仅在用户明确选择后才允许「带着假设继续」",
          "将每条假设标注为「假设 / 待确认」",
        ],
      },
      edgeCases: [
        {
          title: "约束冲突 / 计划可能不可行",
          description:
            "当总预估工作量 > 相关截止日期前可用学习时间时触发。系统不得静默呈现完全可行的计划。",
          actions: ["调整截止日期", "减少工作量", "增加可用学习时间"],
        },
        {
          title: "预估时长",
          description:
            "若时长由系统计算而非用户提供，展示时需带「预估」标签。",
        },
        {
          title: "生成失败",
          description:
            "若生成失败，展示明确恢复操作。不得仅用含糊错误（如「出错了」）作为唯一提示。",
          actions: ["重试", "检查输入"],
        },
      ],
    },
    {
      id: "r2",
      featureName: "计划审阅与编辑",
      priority: "P0",
      userStory: {
        asA: "一名大学生",
        iWant: "审阅并编辑 AI 生成的学习计划",
        soThat: "我对最终日程保持控制",
      },
      userActions: [
        "编辑学习块",
        "删除学习块",
        "更改日期",
        "更改时长",
        "接受建议",
        "重新生成未确认内容",
        "重新生成完整计划",
      ],
      systemBehavior: [
        "AI 提议计划；用户做最终决策",
        "手动编辑与明确接受的学习块视为已确认内容",
        "「重新生成未确认内容」仅更新未确认块，不覆盖已确认或手动编辑块",
        "「重新生成完整计划」仅在用户确认警告（列出可能被替换的编辑）后，才可替换整份计划（含已确认或手动编辑内容）",
        "在无明确重新生成或覆盖操作时，系统不更改用户编辑",
      ],
      acceptanceCriteria: [
        {
          given: "已有 AI 生成的学习计划",
          when: "用户打开计划审阅",
          then: "用户可编辑任意学习块的任务、日期与时长，并可删除学习块",
        },
        {
          given: "用户已手动编辑或明确接受一个或多个学习块",
          when: "尚未确认任何重新生成操作",
          then: "这些学习块在当前计划中保持不变",
        },
        {
          given: "计划同时包含已确认与未确认学习块",
          when: "用户选择重新生成未确认内容",
          then: "仅重新生成未确认块",
          and: ["已确认与手动编辑块保持不变"],
        },
        {
          given: "用户选择重新生成完整计划",
          when: "显示确认对话框",
          then: "对话框列出可能被替换的手动编辑或已确认块",
          and: [
            "仅在用户确认后开始重新生成",
            "若用户取消，当前已编辑计划保持不变",
          ],
        },
        {
          given: "用户明确接受计划",
          when: "接受被确认",
          then: "该版本存为当前用户批准的日程",
        },
        {
          given: "用户确认重新生成操作后重新生成失败",
          when: "失败返回到界面",
          then: "保留用户当前已编辑计划",
          and: ["系统提供「重试」与「保留当前计划」"],
        },
      ],
      edgeCases: [
        {
          title: "重新生成失败",
          description:
            "重新生成失败时，保留用户当前已编辑计划，不丢弃手动编辑。提供「重试」与「保留当前计划」。",
          actions: ["重试", "保留当前计划"],
        },
      ],
    },
  ];

  return catalog.filter((requirement) =>
    mustHaveNames.has(requirement.featureName),
  );
}
