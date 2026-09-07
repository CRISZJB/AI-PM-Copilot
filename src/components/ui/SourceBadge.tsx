type SourceBadgeVariant =
  | "from-input"
  | "ai-inference"
  | "not-provided"
  | "needs-validation"
  | "pm-edited";

const styles: Record<SourceBadgeVariant, string> = {
  "from-input": "border-border bg-surface-muted text-ink-faint",
  "ai-inference": "border-border bg-white text-ink-muted",
  "not-provided": "border-border bg-transparent text-ink-faint",
  "needs-validation": "border-border bg-surface-muted/60 text-ink-faint",
  "pm-edited": "border-border bg-surface-muted text-ink-muted",
};

const labels: Record<SourceBadgeVariant, string> = {
  "from-input": "From Input",
  "ai-inference": "AI Inference",
  "not-provided": "Not Provided",
  "needs-validation": "Needs Validation",
  "pm-edited": "PM Edited",
};

export function SourceBadge({ variant }: { variant: SourceBadgeVariant }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[10px] font-medium tracking-wide ${styles[variant]}`}
    >
      {labels[variant]}
    </span>
  );
}

export function SourceBadgeGroup({
  variants,
}: {
  variants: SourceBadgeVariant[];
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {variants.map((variant) => (
        <SourceBadge key={variant} variant={variant} />
      ))}
    </span>
  );
}
