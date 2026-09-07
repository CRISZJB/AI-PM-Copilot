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
              "As stated in input",
          )
        : fromNotProvided("Not provided"),
      goals: [
        fromInference(
          "May want to turn stated commitments into a clear, structured plan",
        ),
        fromInference(
          "May want to stay consistent without rebuilding plans from scratch",
        ),
        fromInference(
          "May want to adjust when priorities change — a hypothesis to validate",
        ),
      ],
      behaviors: [
        fromInference(
          "May collect tasks across multiple tools based on current input",
        ),
        fromInference(
          "May overcommit early and under-deliver mid-cycle — needs validation",
        ),
        fromInference(
          "May prefer short planning sessions over complex systems",
        ),
      ],
    },
    coreProblem: fromInference(
      `Based on current input, users may struggle with: ${input.problem}`,
      false,
    ),
    painPoints: [
      fromInference(
        "Relevant friction may include scattered inputs and changing priorities",
      ),
      fromInference(
        "Plans may become outdated after unexpected changes — hypothesis to validate",
      ),
      fromInference(
        "Users may struggle to prioritize when multiple tasks feel urgent",
      ),
      fromInference(
        "Planning itself may feel time-consuming based on current input",
      ),
    ],
    coreScenarios: [
      fromInference(
        "A user may create an initial plan from goals, deadlines, and available time",
      ),
      fromInference(
        "A user may need to revisit the plan when priorities change",
      ),
      fromInference(
        "A user may review a short focus list before starting work",
      ),
      fromInference(
        "A user may compare planned versus completed work at period end",
      ),
    ],
    productPositioning: fromInference(
      `Proposed positioning: ${input.projectName} helps the stated users address the stated problem within the given constraints — not a broader platform beyond those constraints.`,
      false,
    ),
    assumptions: [
      fromInference(
        "Users may be willing to provide the minimum inputs required for planning value.",
      ),
      fromInference(
        "A structured plan may be more valuable than ad-hoc task lists for this audience.",
      ),
      fromInference(
        "Users may accept AI suggestions if they remain editable and non-authoritative.",
      ),
    ],
    openQuestions: [
      fromInference("What causes users to abandon plans today?", false),
      fromInference("How frequently do priorities change in practice?", false),
      fromInference(
        "What types of AI suggestions would users trust enough to try?",
        false,
      ),
      fromInference(
        "Should AI only suggest changes, or ever apply them automatically?",
        false,
      ),
    ],
  };
}
