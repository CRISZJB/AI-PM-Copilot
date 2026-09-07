import type { ProjectWorkspace } from "@/types/project";
import { ContentCard } from "@/components/ui/ContentCard";

export function OverviewSection({ workspace }: { workspace: ProjectWorkspace }) {
  const { input } = workspace;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">
          Overview
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          {input.projectName}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Project inputs captured. Product Analysis starts as Draft after AI
          generation — confirm it before it becomes downstream context. MVP Scope
          and Requirements remain mock for now; PRD is assembled from workspace
          decisions.
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Analysis status:{" "}
          <span className="font-medium text-ink">
            {workspace.analysisStatus === "confirmed" ? "Confirmed" : "Draft"}
          </span>
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <ContentCard title="Product Idea">{input.productIdea}</ContentCard>
        <ContentCard title="Target User">{input.targetUser}</ContentCard>
        <ContentCard title="Problem">{input.problem}</ContentCard>
        <ContentCard title="Business Goal">{input.businessGoal}</ContentCard>
        <ContentCard title="Constraints" className="lg:col-span-2">
          {input.constraints}
        </ContentCard>
      </div>

      <section className="rounded-lg border border-dashed border-border bg-surface-muted/40 px-6 py-5">
        <h2 className="text-sm font-semibold text-ink">Workflow progress</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            "Product Analysis",
            "MVP Scope",
            "Requirements",
            "PRD Draft",
          ].map((step, index) => (
            <li
              key={step}
              className="rounded-md border border-border bg-white px-4 py-3"
            >
              <p className="font-mono text-[11px] text-ink-faint">
                Step {index + 1}
              </p>
              <p className="mt-1 text-sm font-medium text-ink">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
