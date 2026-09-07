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
      "Whether AI can turn goals, deadlines, and available time into a useful structured study plan (hypothesis to validate — not a verified fact).",
    prioritizationLogic: [
      "contribution to validating the core product hypothesis",
      "necessity for a usable generate → review → decide loop",
      "fit with stated constraints (planning-focused, not a learning platform)",
      "estimated delivery risk, where evidence exists — otherwise deferred pending technical validation",
    ],
    tradeOffs: [
      "V1 only validates whether AI can turn goals, deadlines, and available time into a useful structured study plan.",
      "Plan changes in V1 are handled by editing inputs, regenerating, or manually editing the generated plan — not by a dynamic rescheduling system.",
      "Daily task management and adaptive adjustment are deferred until the core generation loop is proven useful.",
      "Reminders, analytics, social, gamification, and marketplace features are excluded from first-stage validation.",
    ],
    features: [
      {
        id: "f1",
        name: "AI Study Plan Generator",
        description:
          "Generate a structured study plan from learning goals, deadlines, and available study time based on current inputs.",
        priority: "P0",
        category: "must_have",
        rationale:
          "Recommended as P0 because this is the minimum capability needed to test the core hypothesis: whether AI can produce a useful, structured study plan.",
        prioritizationBasis: ["core_user_value", "validation_critical"],
      },
      {
        id: "f2",
        name: "Plan Review & Edit",
        description:
          "Let students review the generated plan, edit blocks, and accept or reject suggestions before using it.",
        priority: "P0",
        category: "must_have",
        rationale:
          "Recommended as P0 to keep a human-in-the-loop: AI proposes a plan, but the user reviews, edits, and decides what to accept. Without this, V1 cannot safely validate usefulness under user control.",
        prioritizationBasis: [
          "core_user_value",
          "validation_critical",
          "human_in_the_loop",
        ],
      },
      {
        id: "f3",
        name: "Daily Task Management",
        description:
          "Show a focused daily view of study tasks so students can act on their plan without reviewing the full week.",
        priority: "P1",
        category: "should_have",
        rationale:
          "Suggested as Should Have — helpful for day-to-day use, but not strictly required to validate whether the generated plan itself is useful. V1 can start with plan review alone.",
        prioritizationBasis: ["not_required_for_core_validation"],
      },
      {
        id: "f4",
        name: "Adaptive Plan Adjustment",
        description:
          "Automatically or semi-automatically reschedule remaining days when deadlines shift or tasks are missed.",
        priority: "P1",
        category: "should_have",
        rationale:
          "Suggested for later — adaptive rescheduling may improve retention, but V1 adjustments can be handled by changing inputs, regenerating, or editing the plan directly. A dedicated adjustment system is not required for core-hypothesis validation.",
        prioritizationBasis: [
          "not_required_for_core_validation",
          "complexity_needs_validation",
        ],
      },
      {
        id: "f5",
        name: "Smart Reminders",
        description:
          "Send lightweight reminders for upcoming study blocks and deadline-sensitive tasks.",
        priority: "P1",
        category: "should_have",
        rationale:
          "May support retention and follow-through, but does not validate whether AI-generated plans are useful. Recommended after the core generate → review loop is proven.",
        prioritizationBasis: ["not_required_for_core_validation"],
      },
      {
        id: "f6",
        name: "Progress Analytics",
        description:
          "Let students compare planned versus completed work to reflect on planning accuracy over time.",
        priority: "P1",
        category: "should_have",
        rationale:
          "Useful for long-term behavior feedback, but not required for first-stage validation of plan quality and usefulness.",
        prioritizationBasis: [
          "not_required_for_core_validation",
          "complexity_needs_validation",
        ],
      },
      {
        id: "f7",
        name: "Social Study Groups",
        description:
          "Enable shared plans, group accountability, and collaborative scheduling among peers.",
        priority: "P2",
        category: "not_now",
        rationale:
          "Suggested for deferral — social features expand scope beyond individual planning and are not needed to validate the core hypothesis.",
        prioritizationBasis: [
          "not_required_for_core_validation",
          "complexity_needs_validation",
        ],
      },
      {
        id: "f8",
        name: "Gamification",
        description:
          "Add streaks, badges, or reward mechanics to encourage study consistency.",
        priority: "P2",
        category: "not_now",
        rationale:
          "May support engagement later, but is not necessary for validating whether AI-assisted planning is useful on its own.",
        prioritizationBasis: ["not_required_for_core_validation"],
      },
      {
        id: "f9",
        name: "Course Marketplace",
        description:
          "Offer curated courses, materials, or third-party learning content within the product.",
        priority: "P2",
        category: "not_now",
        rationale:
          "Recommended to exclude from V1 — a marketplace would shift the product toward a learning platform, conflicting with the stated planning-focused constraint.",
        prioritizationBasis: [
          "not_required_for_core_validation",
          "complexity_needs_validation",
        ],
      },
    ],
  };
}
