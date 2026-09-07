interface ContentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  eyebrow?: string;
}

export function ContentCard({
  title,
  children,
  className = "",
  eyebrow,
}: ContentCardProps) {
  return (
    <section
      className={`rounded-lg border border-border bg-white p-6 ${className}`}
    >
      {eyebrow ? (
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <div className="mt-3 text-sm leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}
