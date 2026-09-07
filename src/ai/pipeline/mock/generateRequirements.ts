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
      featureName: "AI Study Plan Generator",
      priority: "P0",
      userStory: {
        asA: "a university student",
        iWant:
          "to generate a study plan based on my learning goals, deadlines and available study time",
        soThat: "I can understand what to study and when",
      },
      requiredInputs: [
        "Learning Goal / Study Tasks",
        "Deadline",
        "Available Study Time",
      ],
      optionalInputs: ["Constraints", "Study Preferences"],
      systemBehavior: [
        "Organize study tasks into a structured study plan based on user-provided inputs",
        "Schedule each task on or before its related deadline when total estimated workload ≤ available study time before that deadline",
        "Keep the sum of Estimated Durations in the generated plan ≤ the user’s declared Available Study Time for the covered period",
        "If total estimated workload > available study time before the deadline, do not present a silent “complete” plan; surface a Constraint conflict / Plan may be infeasible state",
        "Do not invent missing Required Inputs as user-provided facts",
        "If the user explicitly continues with incomplete Required Inputs, label each used assumption as Assumption / Needs Confirmation",
        "Every study block includes Task, Date, and Estimated Duration fields with a stable schema",
      ],
      acceptanceCriteria: [
        {
          given:
            "Required Inputs are present: Learning Goal / Study Tasks, Deadline, and Available Study Time",
          when: "the user clicks Generate Plan",
          then: "the system generates a structured study plan",
          and: [
            "each study block includes Task, Date, and Estimated Duration",
            "the sum of Estimated Durations in the plan is ≤ the user’s declared Available Study Time for the covered period",
          ],
        },
        {
          given:
            "total estimated workload for tasks tied to a deadline is ≤ the user’s available study time before that deadline",
          when: "the system generates a plan",
          then: "no study block for those tasks is scheduled after that deadline",
        },
        {
          given:
            "total estimated workload for tasks tied to a deadline is > the user’s available study time before that deadline",
          when: "the user clicks Generate Plan",
          then: "the system shows Constraint conflict / Plan may be infeasible and does not present the result as a fully feasible plan",
          and: [
            "the user can choose Adjust deadline, Reduce workload, or Increase available study time",
          ],
        },
        {
          given: "at least one Required Input is missing",
          when: "the user clicks Generate Plan",
          then: "the system does not generate a complete plan by default",
          and: [
            "the system names each missing Required Input and asks the user to supply it",
            "generation with assumptions starts only after the user explicitly chooses to continue",
            "any assumption used is labeled Assumption / Needs Confirmation and is not shown as a user-provided fact",
          ],
        },
        {
          given:
            "task duration is not provided by the user and must be calculated by the system",
          when: "the generated plan includes duration values",
          then: "each such duration is labeled Estimated",
        },
        {
          given: "plan generation fails after the user clicks Generate Plan",
          when: "the failure is returned to the UI",
          then: "the system shows Try Again and Review Inputs as recovery actions",
        },
      ],
      missingInformation: {
        principle:
          "Missing Required Inputs block complete plan generation by default. Assumptions are allowed only after explicit user confirmation, and must be labeled Assumption / Needs Confirmation.",
        systemShould: [
          "List each missing Required Input by name",
          "Request the user to supply the missing input before generating a complete plan",
          "Allow continue-with-assumptions only after an explicit user choice",
          "Label every assumption as Assumption / Needs Confirmation",
        ],
      },
      edgeCases: [
        {
          title: "Constraint conflict / Plan may be infeasible",
          description:
            "Triggered when total estimated workload > available study time before the relevant deadline. The system must not silently present a fully feasible plan.",
          actions: [
            "Adjust deadline",
            "Reduce workload",
            "Increase available study time",
          ],
        },
        {
          title: "Estimated duration",
          description:
            "If duration is system-calculated rather than user-provided, display it with an Estimated label.",
        },
        {
          title: "Generation fails",
          description:
            "If generation fails, show explicit recovery actions. Do not use a vague error such as “Something went wrong” as the only message.",
          actions: ["Try Again", "Review Inputs"],
        },
      ],
    },
    {
      id: "r2",
      featureName: "Plan Review & Edit",
      priority: "P0",
      userStory: {
        asA: "a university student",
        iWant: "to review and edit the AI-generated study plan",
        soThat: "I remain in control of the final schedule",
      },
      userActions: [
        "Edit study block",
        "Delete study block",
        "Change date",
        "Change duration",
        "Accept suggestion",
        "Regenerate Unconfirmed Content",
        "Regenerate Full Plan",
      ],
      systemBehavior: [
        "AI proposes the plan; the user makes the final decision",
        "Manual edits and explicitly accepted blocks are treated as confirmed content",
        "Regenerate Unconfirmed Content updates only unconfirmed blocks and does not overwrite confirmed or manually edited blocks",
        "Regenerate Full Plan may replace the entire plan, including confirmed or manually edited content, only after the user confirms a warning that lists which edits may be replaced",
        "Without an explicit regenerate or overwrite action, the system does not change user edits",
      ],
      acceptanceCriteria: [
        {
          given: "an AI-generated study plan is available",
          when: "the user opens Plan Review",
          then: "the user can edit Task, Date, and Duration on any study block, and can delete a study block",
        },
        {
          given:
            "the user has manually edited or explicitly accepted one or more study blocks",
          when: "no Regenerate action has been confirmed",
          then: "those blocks remain unchanged in the current plan",
        },
        {
          given: "the plan contains both confirmed and unconfirmed study blocks",
          when: "the user selects Regenerate Unconfirmed Content",
          then: "only unconfirmed blocks are regenerated",
          and: ["confirmed and manually edited blocks remain unchanged"],
        },
        {
          given: "the user selects Regenerate Full Plan",
          when: "the confirmation dialog is shown",
          then: "the dialog lists which manually edited or confirmed blocks may be replaced",
          and: [
            "regeneration starts only after the user confirms",
            "if the user cancels, the current edited plan remains unchanged",
          ],
        },
        {
          given: "the user explicitly accepts the plan",
          when: "acceptance is confirmed",
          then: "that version is stored as the current user-approved schedule",
        },
        {
          given:
            "regeneration fails after the user confirms a Regenerate action",
          when: "the failure is returned to the UI",
          then: "the user’s current edited plan is retained",
          and: ["the system offers Try Again and Keep Current Plan"],
        },
      ],
      edgeCases: [
        {
          title: "Regeneration fails",
          description:
            "On regenerate failure, keep the user’s current edited plan. Do not discard manual edits. Offer Try Again and Keep Current Plan.",
          actions: ["Try Again", "Keep Current Plan"],
        },
      ],
    },
  ];

  return catalog.filter((requirement) =>
    mustHaveNames.has(requirement.featureName),
  );
}
