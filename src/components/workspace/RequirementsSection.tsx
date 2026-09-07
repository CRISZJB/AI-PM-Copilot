import type { ProjectWorkspace, Requirement } from "@/types/project";
import { AcceptanceCriteriaList } from "@/components/ui/AcceptanceCriteriaList";
import { PriorityBadge } from "@/components/ui/PriorityBadge";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-ink-muted">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded border border-border bg-surface-muted/60 px-2 py-0.5 text-[11px] font-medium text-ink-muted"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function RequirementCard({
  requirement,
  index,
}: {
  requirement: Requirement;
  index: number;
}) {
  return (
    <article className="rounded-lg border border-border bg-white p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-ink">
              {requirement.featureName}
            </h2>
            <PriorityBadge priority={requirement.priority} />
          </div>
          <p className="mt-1 font-mono text-[11px] text-ink-faint">
            REQ-{String(index + 1).padStart(2, "0")}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <section>
          <SectionLabel>User Story</SectionLabel>
          <div className="mt-2 space-y-1 text-sm leading-relaxed text-ink">
            <p>
              <span className="text-ink-faint">As</span>{" "}
              {requirement.userStory.asA},
            </p>
            <p>
              <span className="text-ink-faint">I want</span>{" "}
              {requirement.userStory.iWant},
            </p>
            <p>
              <span className="text-ink-faint">so that</span>{" "}
              {requirement.userStory.soThat}.
            </p>
          </div>
        </section>

        {requirement.requiredInputs ? (
          <section>
            <SectionLabel>Required Inputs</SectionLabel>
            <ChipList items={requirement.requiredInputs} />
          </section>
        ) : null}

        {requirement.optionalInputs ? (
          <section>
            <SectionLabel>Optional Inputs</SectionLabel>
            <ChipList items={requirement.optionalInputs} />
          </section>
        ) : null}

        {requirement.userActions ? (
          <section>
            <SectionLabel>User Actions</SectionLabel>
            <ChipList items={requirement.userActions} />
          </section>
        ) : null}

        <section>
          <SectionLabel>AI / System Behavior</SectionLabel>
          <BulletList items={requirement.systemBehavior} />
        </section>

        <section>
          <SectionLabel>Acceptance Criteria</SectionLabel>
          <div className="mt-3">
            <AcceptanceCriteriaList items={requirement.acceptanceCriteria} />
          </div>
        </section>

        {requirement.missingInformation ? (
          <section className="rounded-md border border-border bg-surface-muted/40 px-4 py-4">
            <SectionLabel>Missing Information</SectionLabel>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              {requirement.missingInformation.principle}
            </p>
            <p className="mt-3 text-xs font-medium text-ink-faint">
              System should:
            </p>
            <BulletList items={requirement.missingInformation.systemShould} />
          </section>
        ) : null}

        <section>
          <SectionLabel>Edge Cases / Failure Handling</SectionLabel>
          <div className="mt-3 space-y-3">
            {requirement.edgeCases.map((edgeCase) => (
              <div
                key={edgeCase.title}
                className="rounded-md border border-border px-4 py-3"
              >
                <p className="text-sm font-medium text-ink">{edgeCase.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {edgeCase.description}
                </p>
                {edgeCase.actions ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {edgeCase.actions.map((action) => (
                      <span
                        key={action}
                        className="inline-flex items-center rounded border border-border px-2 py-0.5 text-[11px] text-ink-faint"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}

export function RequirementsSection({
  workspace,
}: {
  workspace: ProjectWorkspace;
}) {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">
          Requirements
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Core MVP requirements
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Focused on the two P0 capabilities needed to validate the core
          hypothesis: generate a plan from required inputs, then let the user
          review and decide.
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          AI proposes. User decides. Critical gaps and failure states are
          explicit.
        </p>
      </header>

      <div className="space-y-5">
        {workspace.requirements.map((requirement, index) => (
          <RequirementCard
            key={requirement.id}
            requirement={requirement}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
