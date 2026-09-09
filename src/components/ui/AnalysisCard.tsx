interface AnalysisCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  eyebrow?: string;
  showActions?: boolean;
  isEditing?: boolean;
  onEdit?: () => void;
  onRegenerate?: () => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  regenerateBusy?: boolean;
}

export function AnalysisCard({
  title,
  children,
  className = "",
  eyebrow,
  showActions = true,
  isEditing = false,
  onEdit,
  onRegenerate,
  onSaveEdit,
  onCancelEdit,
  regenerateBusy = false,
}: AnalysisCardProps) {
  return (
    <section
      className={`rounded-lg border border-border bg-white p-6 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-accent">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="text-base font-semibold text-ink">{title}</h3>
        </div>
        {showActions ? (
          <div className="flex shrink-0 items-center gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={onSaveEdit}
                  className="text-xs font-medium text-ink transition-colors hover:text-ink-soft"
                >
                  保存
                </button>
                <span className="text-ink-faint/40">·</span>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="text-xs text-ink-faint transition-colors hover:text-ink"
                >
                  取消
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onEdit}
                  className="text-xs text-ink-faint transition-colors hover:text-ink"
                >
                  编辑
                </button>
                <span className="text-ink-faint/40">·</span>
                <button
                  type="button"
                  onClick={onRegenerate}
                  disabled={regenerateBusy}
                  className="text-xs text-ink-faint transition-colors hover:text-ink disabled:opacity-50"
                >
                  {regenerateBusy ? "…" : "重新生成"}
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>
      <div className="mt-3 text-sm leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}
