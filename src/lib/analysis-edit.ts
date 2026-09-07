import type { EvidenceField, ProductAnalysis } from "@/ai/types";

/** Apply a PM text edit; mark editedByUser when the value changes. */
export function applyUserEdit(
  field: EvidenceField,
  nextValue: string,
): EvidenceField {
  const value = nextValue.trim();
  if (!value || value === field.value) {
    return field;
  }
  return {
    ...field,
    value,
    editedByUser: true,
  };
}

export function applyUserEditList(
  fields: EvidenceField[],
  nextValues: string[],
): EvidenceField[] {
  return nextValues
    .map((raw, index) => {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      const previous = fields[index];
      if (!previous) {
        return {
          value: trimmed,
          source: "ai_inference" as const,
          needsValidation: true,
          editedByUser: true,
        };
      }
      return applyUserEdit(previous, trimmed);
    })
    .filter((item): item is EvidenceField => item !== null);
}

/**
 * Merge a regenerated analysis while preserving PM-edited fields.
 * Used when the user explicitly confirms Regenerate.
 */
export function mergeAnalysisPreservingEdits(
  previous: ProductAnalysis,
  next: ProductAnalysis,
): ProductAnalysis {
  return {
    targetUser: {
      segment: keepIfEdited(previous.targetUser.segment, next.targetUser.segment),
      ageRange: keepIfEdited(
        previous.targetUser.ageRange,
        next.targetUser.ageRange,
      ),
      goals: mergeListPreservingEdits(
        previous.targetUser.goals,
        next.targetUser.goals,
      ),
      behaviors: mergeListPreservingEdits(
        previous.targetUser.behaviors,
        next.targetUser.behaviors,
      ),
    },
    coreProblem: keepIfEdited(previous.coreProblem, next.coreProblem),
    painPoints: mergeListPreservingEdits(previous.painPoints, next.painPoints),
    coreScenarios: mergeListPreservingEdits(
      previous.coreScenarios,
      next.coreScenarios,
    ),
    productPositioning: keepIfEdited(
      previous.productPositioning,
      next.productPositioning,
    ),
    assumptions: mergeListPreservingEdits(
      previous.assumptions,
      next.assumptions,
    ),
    openQuestions: mergeListPreservingEdits(
      previous.openQuestions,
      next.openQuestions,
    ),
  };
}

function keepIfEdited(
  previous: EvidenceField,
  next: EvidenceField,
): EvidenceField {
  return previous.editedByUser ? previous : next;
}

function mergeListPreservingEdits(
  previous: EvidenceField[],
  next: EvidenceField[],
): EvidenceField[] {
  const preserved = previous.filter((item) => item.editedByUser);
  if (preserved.length === 0) return next;

  const nextWithoutDupes = next.filter(
    (item) =>
      !preserved.some(
        (kept) => kept.value.toLowerCase() === item.value.toLowerCase(),
      ),
  );
  return [...preserved, ...nextWithoutDupes].slice(0, Math.max(next.length, preserved.length));
}
