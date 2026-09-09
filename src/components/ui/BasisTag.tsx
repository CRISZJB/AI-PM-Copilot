import type { PrioritizationBasis } from "@/types/project";

export const basisLabels: Record<PrioritizationBasis, string> = {
  core_user_value: "核心用户价值",
  validation_critical: "验证关键",
  human_in_the_loop: "人工介入（HITL）",
  not_required_for_core_validation: "非核心验证所需",
  complexity_needs_validation: "复杂度需技术验证",
};

export function BasisTag({ basis }: { basis: PrioritizationBasis }) {
  return (
    <span className="inline-flex items-center rounded border border-border bg-surface-muted/60 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
      {basisLabels[basis]}
    </span>
  );
}
