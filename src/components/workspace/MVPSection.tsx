"use client";

import { useEffect, useState } from "react";
import type {
  FeatureCategory,
  MvpFeature,
  MvpScope,
  Priority,
  ProjectWorkspace,
} from "@/types/project";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { BasisTag } from "@/components/ui/BasisTag";
import { Button } from "@/components/ui/Button";
import { applyFeatureTextEdit, mergeMvpPreservingEdits } from "@/lib/mvp-edit";
import {
  applyFeaturePriority,
  confirmMvpScope,
  saveLiveMvpScope,
  saveMvpScopeEdits,
} from "@/lib/project-store";

const buckets: {
  id: FeatureCategory;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "must_have",
    title: "Must Have",
    subtitle: "Minimum recommended to validate the core hypothesis",
  },
  {
    id: "should_have",
    title: "Should Have",
    subtitle: "Suggested after the generate → review loop is proven",
  },
  {
    id: "not_now",
    title: "Not Now",
    subtitle: "Intentionally deferred based on current scope",
  },
];

const loadingMessages = [
  "Prioritizing features...",
  "Testing the minimum validation scope...",
  "Reviewing trade-offs...",
];

const REGENERATE_WARNING =
  "Regeneration may replace unconfirmed AI recommendations. PM-reprioritized / manually edited decisions will be preserved. Continue?";

function FeatureCard({
  feature,
  onSave,
}: {
  feature: MvpFeature;
  onSave: (next: MvpFeature) => void;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "reprioritize">("view");
  const [name, setName] = useState(feature.name);
  const [description, setDescription] = useState(feature.description);
  const [rationale, setRationale] = useState(feature.rationale);
  const [priority, setPriority] = useState<Priority>(feature.priority);

  useEffect(() => {
    setName(feature.name);
    setDescription(feature.description);
    setRationale(feature.rationale);
    setPriority(feature.priority);
    setMode("view");
  }, [feature]);

  function saveEdit() {
    onSave(
      applyFeatureTextEdit(feature, {
        name: name.trim() || feature.name,
        description: description.trim() || feature.description,
        rationale: rationale.trim() || feature.rationale,
      }),
    );
    setMode("view");
  }

  function saveReprioritize() {
    onSave(applyFeaturePriority(feature, priority));
    setMode("view");
  }

  return (
    <article className="border-b border-border py-5 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-ink">{feature.name}</h3>
          <PriorityBadge priority={feature.priority} />
          {feature.reprioritizedByUser ? (
            <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
              PM Reprioritized
            </span>
          ) : null}
          {feature.editedByUser ? (
            <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
              PM Edited
            </span>
          ) : null}
        </div>
        {mode === "view" ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("edit")}
              className="text-xs text-ink-faint transition-colors hover:text-ink"
            >
              Edit
            </button>
            <span className="text-ink-faint/40">·</span>
            <button
              type="button"
              onClick={() => setMode("reprioritize")}
              className="text-xs text-ink-faint transition-colors hover:text-ink"
            >
              Reprioritize
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={mode === "edit" ? saveEdit : saveReprioritize}
              className="text-xs font-medium text-ink transition-colors hover:text-ink-soft"
            >
              Save
            </button>
            <span className="text-ink-faint/40">·</span>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="text-xs text-ink-faint transition-colors hover:text-ink"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {mode === "edit" ? (
        <div className="mt-3 space-y-3">
          <label className="block space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              Name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink/30"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              Description
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full resize-y rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink/30"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              Rationale
            </span>
            <textarea
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
              rows={3}
              className="w-full resize-y rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink/30"
            />
          </label>
        </div>
      ) : mode === "reprioritize" ? (
        <div className="mt-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Priority
          </p>
          <div className="flex flex-wrap gap-2">
            {(["P0", "P1", "P2"] as Priority[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPriority(value)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  priority === value
                    ? "border-ink bg-ink text-white"
                    : "border-border bg-white text-ink-muted hover:text-ink"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-faint">
            Category updates automatically: P0 → Must Have, P1 → Should Have,
            P2 → Not Now.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {feature.description}
          </p>

          <div className="mt-4 rounded-md border border-border bg-surface-muted/40 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              Why this priority
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink">
              {feature.rationale}
            </p>
          </div>

          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              Prioritization Basis
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {feature.prioritizationBasis.map((tag) => (
                <BasisTag key={tag} basis={tag} />
              ))}
            </div>
          </div>
        </>
      )}
    </article>
  );
}

export function MVPSection({ workspace }: { workspace: ProjectWorkspace }) {
  const {
    input,
    analysis,
    analysisStatus,
    mvpScope,
    mvpScopeStatus,
    mvpScopeSource,
  } = workspace;

  const analysisConfirmed = analysisStatus === "confirmed";
  const hasLiveOrMockScope =
    mvpScopeStatus !== "none" && mvpScopeSource !== "none";
  const isConfirmed = mvpScopeStatus === "confirmed";

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingTick, setLoadingTick] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isGenerating) return;
    const timer = window.setInterval(() => {
      setLoadingTick((current) => current + 1);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  async function generateMvpScope(options?: { regenerate?: boolean }) {
    if (!analysisConfirmed) {
      setError(
        "Confirmed Product Analysis is required before MVP prioritization.",
      );
      return;
    }

    if (options?.regenerate) {
      const ok = window.confirm(REGENERATE_WARNING);
      if (!ok) return;
    }

    setError(null);
    setMessage(null);
    setLoadingTick(0);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/mvp-scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          analysis,
          analysisStatus: "confirmed",
        }),
      });

      const payload = (await response.json()) as {
        mvpScope?: MvpScope;
        error?: string;
      };

      if (!response.ok || !payload.mvpScope) {
        throw new Error(
          payload.error || "We couldn't prioritize this MVP scope.",
        );
      }

      const nextScope =
        options?.regenerate && hasLiveOrMockScope
          ? mergeMvpPreservingEdits(mvpScope, payload.mvpScope)
          : payload.mvpScope;

      saveLiveMvpScope(nextScope);
      setMessage(
        options?.regenerate
          ? "MVP scope regenerated. Review priorities and confirm when ready."
          : "MVP scope generated as Draft. Review before confirming.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't prioritize this MVP scope.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function updateFeature(nextFeature: MvpFeature) {
    const features = mvpScope.features.map((feature) =>
      feature.id === nextFeature.id ? nextFeature : feature,
    );
    saveMvpScopeEdits({ ...mvpScope, features });
    setMessage(
      isConfirmed
        ? "Changes saved. MVP Scope returned to Draft — confirm again before requirements."
        : "Changes saved.",
    );
  }

  function handleConfirm() {
    try {
      confirmMvpScope();
      setMessage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm MVP.");
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">
          MVP Scope
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Feature prioritization
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Recommend the minimum scope needed to validate the core product
          hypothesis — using confirmed Product Analysis, not a fresh rewrite of
          the idea.
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          AI helps prioritize, but PM makes the final decision.
        </p>
      </header>

      <div className="rounded-lg border border-border bg-white px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-faint">
          Analysis gate
        </p>
        <p className="mt-1.5 text-sm text-ink">
          {analysisConfirmed
            ? "Product Analysis is Confirmed. MVP Prioritization uses this confirmed snapshot (including PM edits)."
            : "Product Analysis is still Draft. Confirm analysis before generating a live MVP Scope."}
        </p>
      </div>

      {hasLiveOrMockScope ? (
        <div className="rounded-lg border border-border bg-white px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-faint">
            MVP Scope Status
          </p>
          <p className="mt-1.5 text-base font-semibold text-ink">
            {isConfirmed ? "Confirmed" : "Draft"}
            {mvpScopeSource === "mock" ? (
              <span className="ml-2 text-xs font-normal text-ink-faint">
                (sample / mock)
              </span>
            ) : null}
            {mvpScopeSource === "live" ? (
              <span className="ml-2 text-xs font-normal text-ink-faint">
                (live DeepSeek)
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {isConfirmed
              ? "Confirmed scope will be used to generate functional requirements."
              : "Review AI-recommended priorities before continuing."}
          </p>
        </div>
      ) : null}

      {message ? <p className="text-sm text-ink-muted">{message}</p> : null}
      {error ? (
        <div className="rounded-lg border border-border bg-white px-5 py-4">
          <p className="text-sm text-ink">{error}</p>
          {analysisConfirmed ? (
            <Button
              type="button"
              className="mt-3"
              onClick={() => generateMvpScope()}
              disabled={isGenerating}
            >
              Try Again
            </Button>
          ) : null}
        </div>
      ) : null}

      {!hasLiveOrMockScope ? (
        <div className="rounded-lg border border-border bg-white px-6 py-8">
          <h2 className="text-base font-semibold text-ink">
            Generate MVP Scope
          </h2>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Run DeepSeek prioritization on your confirmed Product Analysis.
            Nothing is generated automatically when you confirm analysis.
          </p>
          {isGenerating ? (
            <p className="mt-6 text-sm text-ink-muted">
              {loadingMessages[loadingTick % loadingMessages.length]}
            </p>
          ) : (
            <Button
              type="button"
              className="mt-6"
              onClick={() => generateMvpScope()}
              disabled={!analysisConfirmed}
            >
              Generate MVP Scope
            </Button>
          )}
          {!analysisConfirmed ? (
            <p className="mt-3 text-xs text-ink-faint">
              Confirm Product Analysis first to unlock generation.
            </p>
          ) : null}
        </div>
      ) : (
        <>
          {mvpScope.coreHypothesis ? (
            <section className="rounded-lg border border-border bg-white p-6">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">
                Validation focus
              </p>
              <h2 className="mt-2 text-sm font-semibold text-ink">
                Core hypothesis
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {mvpScope.coreHypothesis}
              </p>
            </section>
          ) : null}

          <section className="rounded-lg border border-border bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Prioritization Logic
                </h2>
                <p className="mt-2 text-sm text-ink-muted">
                  Features are prioritized based on:
                </p>
              </div>
              {mvpScopeSource === "live" || analysisConfirmed ? (
                <button
                  type="button"
                  disabled={isGenerating || !analysisConfirmed}
                  onClick={() => generateMvpScope({ regenerate: true })}
                  className="text-xs text-ink-faint transition-colors hover:text-ink disabled:opacity-50"
                >
                  {isGenerating ? "Regenerating…" : "Regenerate"}
                </button>
              ) : null}
            </div>
            <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-ink-muted">
              {mvpScope.prioritizationLogic.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          {isGenerating ? (
            <p className="text-sm text-ink-muted">
              {loadingMessages[loadingTick % loadingMessages.length]}
            </p>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-3">
            {buckets.map((bucket) => {
              const features = mvpScope.features.filter(
                (feature) => feature.category === bucket.id,
              );

              return (
                <section
                  key={bucket.id}
                  className="rounded-lg border border-border bg-white"
                >
                  <div className="border-b border-border px-5 py-4">
                    <h2 className="text-sm font-semibold text-ink">
                      {bucket.title}
                    </h2>
                    <p className="mt-1 text-xs text-ink-faint">
                      {bucket.subtitle}
                    </p>
                  </div>
                  <div className="px-5">
                    {features.length === 0 ? (
                      <p className="py-5 text-sm text-ink-faint">None</p>
                    ) : (
                      features.map((feature) => (
                        <FeatureCard
                          key={feature.id}
                          feature={feature}
                          onSave={updateFeature}
                        />
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          <section className="rounded-lg border border-border bg-white p-6">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">
              Scope Control
            </p>
            <h2 className="mt-2 text-sm font-semibold text-ink">
              Trade-offs / Scope Notes
            </h2>
            <ul className="mt-4 space-y-3">
              {mvpScope.tradeOffs.map((note) => (
                <li
                  key={note}
                  className="flex gap-3 border-b border-border pb-3 text-sm leading-relaxed text-ink-muted last:border-b-0 last:pb-0"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="border-t border-border pt-8">
            {isConfirmed ? (
              <div className="rounded-lg border border-border bg-surface-muted/40 px-5 py-4">
                <p className="text-base font-semibold text-ink">
                  MVP scope confirmed
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  Confirmed scope will be used to generate functional
                  requirements.
                </p>
                <p className="mt-3 text-xs text-ink-faint">
                  Editing or regenerating returns status to Draft.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xl text-sm text-ink-muted">
                  Confirm when this prioritization is ready for requirements.
                  Requirements LLM is not wired yet.
                </p>
                <Button type="button" onClick={handleConfirm}>
                  Confirm MVP Scope
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
