import type { PrioritizationBasis } from "@/types/project";

export const basisLabels: Record<PrioritizationBasis, string> = {
  core_user_value: "Core user value",
  validation_critical: "Validation critical",
  human_in_the_loop: "Human-in-the-loop",
  not_required_for_core_validation: "Not required for core validation",
  complexity_needs_validation: "Complexity needs technical validation",
};

export function BasisTag({ basis }: { basis: PrioritizationBasis }) {
  return (
    <span className="inline-flex items-center rounded border border-border bg-surface-muted/60 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
      {basisLabels[basis]}
    </span>
  );
}
