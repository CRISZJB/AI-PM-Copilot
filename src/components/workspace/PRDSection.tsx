"use client";

import { useMemo, useState } from "react";
import type {
  PrdSyncStatus,
  ProjectWorkspace,
  Requirement,
} from "@/types/project";
import { assemblePrd } from "@/ai/prd";
import { AcceptanceCriteriaList } from "@/components/ui/AcceptanceCriteriaList";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { SourceBadge } from "@/components/ui/SourceBadge";

function TraceSource({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded border border-border bg-surface-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
      Source: {label}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
      {children}
    </p>
  );
}

function PrdSection({
  number,
  title,
  source,
  children,
}: {
  number: string;
  title: string;
  source?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border py-7 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
        <span className="font-mono text-xs text-ink-faint">{number}</span>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {source ? <TraceSource label={source} /> : null}
      </div>
      <div className="mt-4 text-sm leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-1.5 text-sm text-ink">{children}</div>
    </div>
  );
}

function categoryLabel(category: string): string {
  if (category === "should_have") return "Should Have";
  if (category === "not_now") return "Not Now";
  return "Must Have";
}

function RequirementSummary({
  requirement,
  index,
}: {
  requirement: Requirement;
  index: number;
}) {
  const keyInputs =
    requirement.requiredInputs ?? requirement.userActions ?? [];
  const keyBehaviors = requirement.systemBehavior.slice(0, 4);
  const keyCriteria = requirement.acceptanceCriteria.slice(0, 3);

  return (
    <div className="border-b border-border py-5 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-ink-faint">
          REQ-{String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-sm font-semibold text-ink">
          {requirement.featureName}
        </h3>
        <PriorityBadge priority={requirement.priority} />
      </div>

      <div className="mt-4 space-y-4">
        <Field label="User Story">
          <p>
            As {requirement.userStory.asA}, I want {requirement.userStory.iWant},
            so that {requirement.userStory.soThat}.
          </p>
        </Field>

        <Field
          label={
            requirement.requiredInputs ? "Key Inputs" : "Key User Actions"
          }
        >
          <ul className="list-disc space-y-1 pl-4 text-ink-muted">
            {keyInputs.map((item) => (
              <li key={item}>{item}</li>
            ))}
            {requirement.optionalInputs?.map((item) => (
              <li key={item}>
                {item}{" "}
                <span className="text-ink-faint">(optional)</span>
              </li>
            ))}
          </ul>
        </Field>

        <Field label="Key AI / System Behavior">
          <ul className="list-disc space-y-1 pl-4 text-ink-muted">
            {keyBehaviors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Field>

        <div>
          <SectionLabel>Key Acceptance Criteria</SectionLabel>
          <div className="mt-2">
            <AcceptanceCriteriaList items={keyCriteria} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PRDSection({ workspace }: { workspace: ProjectWorkspace }) {
  const prd = useMemo(() => assemblePrd(workspace), [workspace]);
  const [syncStatus, setSyncStatus] = useState<PrdSyncStatus>(
    prd.sync.syncStatus,
  );

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">
              PRD Draft
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              PRD Draft
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Built from the current Product Analysis, MVP Scope and confirmed
              Requirements.
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              This PRD reflects existing product decisions instead of
              regenerating them independently.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              className="text-xs text-ink-faint transition-colors hover:text-ink"
            >
              Edit
            </button>
            <span className="text-ink-faint/40">·</span>
            <button
              type="button"
              className="text-xs text-ink-faint transition-colors hover:text-ink"
            >
              Export
            </button>
            <span className="text-ink-faint/40">·</span>
            <button
              type="button"
              onClick={() => setSyncStatus("up-to-date")}
              className="text-xs text-ink-faint transition-colors hover:text-ink"
            >
              Sync Changes
            </button>
          </div>
        </div>
      </header>

      <div className="rounded-lg border border-border bg-white px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              PRD Status
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded border border-border bg-surface-muted/60 px-2 py-0.5 text-xs font-medium text-ink-muted">
                {prd.sync.status}
              </span>
              {syncStatus === "up-to-date" ? (
                <span className="inline-flex items-center rounded border border-border px-2 py-0.5 text-xs text-ink-faint">
                  Up to date
                </span>
              ) : (
                <span className="inline-flex items-center rounded border border-border px-2 py-0.5 text-xs text-ink-muted">
                  PRD may be outdated
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              {prd.sync.lastSyncedLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setSyncStatus((current) =>
                current === "up-to-date" ? "outdated" : "up-to-date",
              )
            }
            className="text-[11px] text-ink-faint underline-offset-2 hover:text-ink hover:underline"
          >
            {syncStatus === "up-to-date"
              ? "Simulate upstream change"
              : "Reset sync demo"}
          </button>
        </div>

        {syncStatus === "outdated" ? (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-medium text-ink">PRD may be outdated</p>
            <p className="mt-1 text-sm text-ink-muted">
              Product decisions have changed. AI can detect the drift, but the
              PRD should not silently overwrite itself — PM approves
              synchronization.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded border border-border px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-surface-muted"
              >
                Review Changes
              </button>
              <button
                type="button"
                onClick={() => setSyncStatus("up-to-date")}
                className="rounded border border-ink bg-ink px-3 py-1.5 text-xs text-white transition-colors hover:bg-ink-soft"
              >
                Sync Changes
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <article className="rounded-lg border border-border bg-white px-6 sm:px-8">
        <PrdSection number="01" title="Product Overview">
          <div className="space-y-4">
            <Field label="Product Name">
              {prd.productOverview.productName}
            </Field>
            <Field label="Product Summary">
              {prd.productOverview.productSummary}
            </Field>
            <Field label="Product Goal">
              {prd.productOverview.productGoal}
            </Field>
          </div>
        </PrdSection>

        <PrdSection number="02" title="Target User" source="Product Analysis">
          <ul className="space-y-2">
            <li className="text-ink">{prd.targetUser.segment}</li>
            <li className="text-ink">Age {prd.targetUser.ageRange}</li>
            <li className="text-ink-muted">
              From project input: {prd.targetUser.fromInput}
            </li>
          </ul>
        </PrdSection>

        <PrdSection
          number="03"
          title="User Problem & Core Scenarios"
          source="Product Analysis"
        >
          <div className="space-y-5">
            <Field label="Core Problem">{prd.userProblem.coreProblem}</Field>
            <div>
              <SectionLabel>Pain Points</SectionLabel>
              <ul className="mt-2 list-disc space-y-1.5 pl-4">
                {prd.userProblem.painPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <div>
              <SectionLabel>Core Scenarios</SectionLabel>
              <ol className="mt-2 list-decimal space-y-1.5 pl-4">
                {prd.userProblem.coreScenarios.map((scenario) => (
                  <li key={scenario}>{scenario}</li>
                ))}
              </ol>
            </div>
          </div>
        </PrdSection>

        <PrdSection number="04" title="Product Hypothesis">
          <p className="text-ink">{prd.productHypothesis}</p>
          <div className="mt-4 rounded-md border border-border bg-surface-muted/40 px-4 py-3">
            <SectionLabel>V1 validation focus</SectionLabel>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-ink-muted">
              <li>learning goals</li>
              <li>deadlines</li>
              <li>available study time</li>
              <li>→ useful structured study plan</li>
            </ul>
          </div>
        </PrdSection>

        <PrdSection number="05" title="MVP Scope" source="MVP Scope">
          <div className="space-y-5">
            <div>
              <SectionLabel>P0 / Must Have</SectionLabel>
              <ul className="mt-2 space-y-2">
                {prd.mvpScope.mustHave.map((feature) => (
                  <li
                    key={feature.id}
                    className="flex flex-wrap items-center gap-2 text-ink"
                  >
                    <span>{feature.name}</span>
                    <PriorityBadge priority={feature.priority} />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionLabel>Out of Scope for V1</SectionLabel>
              <ul className="mt-2 list-disc space-y-1.5 pl-4">
                {prd.mvpScope.outOfScope.map((feature) => (
                  <li key={feature.id}>
                    {feature.name}{" "}
                    <span className="text-ink-faint">
                      ({feature.priority} · {categoryLabel(feature.category)})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </PrdSection>

        <PrdSection
          number="06"
          title="Functional Requirements"
          source="Requirements"
        >
          <div>
            {prd.functionalRequirements.map((requirement, index) => (
              <RequirementSummary
                key={requirement.id}
                requirement={requirement}
                index={index}
              />
            ))}
          </div>
        </PrdSection>

        <PrdSection
          number="07"
          title="AI Behavior & Failure Handling"
          source="Requirements"
        >
          <ul className="list-disc space-y-2 pl-4">
            {prd.aiBehaviorRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </PrdSection>

        <PrdSection
          number="08"
          title="Assumptions to Validate"
          source="Product Analysis"
        >
          <ul className="space-y-3">
            {prd.assumptions.map((assumption) => (
              <li
                key={assumption.value}
                className="flex flex-wrap items-start gap-2 border-b border-border pb-3 last:border-b-0 last:pb-0"
              >
                <span className="text-ink">{assumption.value}</span>
                {assumption.needsValidation ? (
                  <SourceBadge variant="needs-validation" />
                ) : null}
              </li>
            ))}
          </ul>
        </PrdSection>

        <PrdSection
          number="09"
          title="Open Questions"
          source="Product Analysis"
        >
          <ul className="list-disc space-y-1.5 pl-4">
            {prd.openQuestions.map((question) => (
              <li key={question.value}>{question.value}</li>
            ))}
          </ul>
        </PrdSection>

        <PrdSection number="10" title="Risks">
          <ul className="list-disc space-y-1.5 pl-4">
            {prd.risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </PrdSection>
      </article>
    </div>
  );
}
