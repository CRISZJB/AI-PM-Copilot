import { SiteHeader } from "@/components/layout/SiteHeader";
import { ProjectForm } from "@/components/create/ProjectForm";

export default function CreateProjectPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <main className="mx-auto max-w-[1440px] px-8 py-12">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">
            Create Project
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            Capture the product idea
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Structured inputs become Product Analysis via live AI. Review and
            confirm before MVP, requirements, and PRD.
          </p>

          <div className="mt-10 rounded-lg border border-border bg-white p-6 sm:p-8">
            <ProjectForm />
          </div>
        </div>
      </main>
    </div>
  );
}
