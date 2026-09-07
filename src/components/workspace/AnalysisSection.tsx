"use client";

import { useState } from "react";
import type {
  EvidenceField,
  ProductAnalysis,
  ProjectWorkspace,
} from "@/types/project";
import { AnalysisCard } from "@/components/ui/AnalysisCard";
import { Button } from "@/components/ui/Button";
import { SourceBadgeGroup } from "@/components/ui/SourceBadge";
import { evidenceBadges } from "@/ai/types/evidence-ui";
import {
  applyUserEdit,
  applyUserEditList,
  mergeAnalysisPreservingEdits,
} from "@/lib/analysis-edit";
import {
  confirmAnalysis,
  replaceAnalysisDraft,
  saveAnalysisEdits,
} from "@/lib/project-store";

type CardId =
  | "target-user"
  | "core-problem"
  | "pain-points"
  | "core-scenarios"
  | "positioning"
  | "assumptions"
  | "open-questions";

function EvidenceLine({
  field,
  prefix,
}: {
  field: EvidenceField;
  prefix?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="text-ink">
        {prefix ? `${prefix}${field.value}` : field.value}
      </span>
      <SourceBadgeGroup variants={evidenceBadges(field)} />
    </div>
  );
}

function EvidenceItemList({
  items,
  ordered = false,
}: {
  items: EvidenceField[];
  ordered?: boolean;
}) {
  const ListTag = ordered ? "ol" : "ul";
  const listClass = ordered
    ? "list-decimal space-y-2.5 pl-4"
    : "list-disc space-y-2.5 pl-4";

  return (
    <ListTag className={listClass}>
      {items.map((item) => (
        <li key={`${item.source}-${item.value}`} className="text-ink-muted">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-ink">{item.value}</span>
            <SourceBadgeGroup variants={evidenceBadges(item)} />
          </div>
        </li>
      ))}
    </ListTag>
  );
}

function FieldEditor({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/30"
      />
    </label>
  );
}

function ListEditor({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {label}
      </span>
      <p className="text-[11px] text-ink-faint">One item per line</p>
      <textarea
        value={values.join("\n")}
        onChange={(event) => onChange(event.target.value.split("\n"))}
        rows={Math.max(4, values.length + 1)}
        className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/30"
      />
    </label>
  );
}

const REGENERATE_WARNING =
  "Regeneration would replace unconfirmed AI content. Manually edited items (PM Edited) are kept. Continue?";

export function AnalysisSection({
  workspace,
}: {
  workspace: ProjectWorkspace;
}) {
  const { analysis, analysisStatus, input } = workspace;
  const { targetUser } = analysis;
  const isConfirmed = analysisStatus === "confirmed";

  const [editingCard, setEditingCard] = useState<CardId | null>(null);
  const [draft, setDraft] = useState<ProductAnalysis | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const agePrefix =
    targetUser.ageRange.source === "not_provided" ? "Age: " : "Age ";

  function beginEdit(card: CardId) {
    setActionMessage(null);
    setEditingCard(card);
    setDraft(structuredClone(analysis));
  }

  function cancelEdit() {
    setEditingCard(null);
    setDraft(null);
  }

  function persistDraft(next: ProductAnalysis) {
    saveAnalysisEdits(next);
    setEditingCard(null);
    setDraft(null);
    setActionMessage(
      isConfirmed
        ? "Edits saved. Analysis returned to Draft — confirm again before downstream use."
        : "Edits saved.",
    );
  }

  function saveTargetUser() {
    if (!draft) return;
    persistDraft({
      ...analysis,
      targetUser: {
        segment: applyUserEdit(
          analysis.targetUser.segment,
          draft.targetUser.segment.value,
        ),
        ageRange: applyUserEdit(
          analysis.targetUser.ageRange,
          draft.targetUser.ageRange.value,
        ),
        goals: applyUserEditList(
          analysis.targetUser.goals,
          draft.targetUser.goals.map((item) => item.value),
        ),
        behaviors: applyUserEditList(
          analysis.targetUser.behaviors,
          draft.targetUser.behaviors.map((item) => item.value),
        ),
      },
    });
  }

  function saveScalar(
    key: "coreProblem" | "productPositioning",
    value: string,
  ) {
    persistDraft({
      ...analysis,
      [key]: applyUserEdit(analysis[key], value),
    });
  }

  function saveList(
    key: "painPoints" | "coreScenarios" | "assumptions" | "openQuestions",
    values: string[],
  ) {
    persistDraft({
      ...analysis,
      [key]: applyUserEditList(analysis[key], values),
    });
  }

  async function handleRegenerate(card: CardId) {
    const confirmed = window.confirm(REGENERATE_WARNING);
    if (!confirmed) return;

    setRegenerating(true);
    setActionMessage(null);
    try {
      const response = await fetch("/api/ai/product-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = (await response.json()) as {
        analysis?: ProductAnalysis;
        error?: string;
      };
      if (!response.ok || !payload.analysis) {
        throw new Error(payload.error || "Regeneration failed.");
      }

      const merged = mergeAnalysisPreservingEdits(analysis, payload.analysis);
      replaceAnalysisDraft(merged);
      setEditingCard(null);
      setDraft(null);
      setActionMessage(
        `Regenerated (${card}). PM-edited items were preserved. Review and confirm when ready.`,
      );
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : "Regeneration failed.",
      );
    } finally {
      setRegenerating(false);
    }
  }

  function handleConfirm() {
    if (editingCard) {
      setActionMessage("Save or cancel your edit before confirming.");
      return;
    }
    confirmAnalysis();
    setActionMessage(null);
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">
          Product Analysis
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Understand the problem space
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Live AI analysis from your project inputs. Each statement shows
          whether it came from your input, AI inference, or was not provided.
        </p>
        <p className="mt-1 text-xs text-ink-faint">AI proposes. PM decides.</p>
      </header>

      <div className="rounded-lg border border-border bg-white px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-faint">
          Analysis Status
        </p>
        <p className="mt-1.5 text-base font-semibold text-ink">
          {isConfirmed ? "Confirmed" : "Draft"}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {isConfirmed
            ? "Confirmed analysis will be used as context for MVP prioritization."
            : "Review AI-generated assumptions and insights before continuing."}
        </p>
      </div>

      {actionMessage ? (
        <p className="text-sm text-ink-muted">{actionMessage}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalysisCard
          title="Target User Hypothesis"
          eyebrow="User"
          isEditing={editingCard === "target-user"}
          onEdit={() => beginEdit("target-user")}
          onCancelEdit={cancelEdit}
          onSaveEdit={saveTargetUser}
          onRegenerate={() => handleRegenerate("target-user")}
          regenerateBusy={regenerating}
        >
          {editingCard === "target-user" && draft ? (
            <div className="space-y-4">
              <FieldEditor
                label="Segment"
                value={draft.targetUser.segment.value}
                rows={2}
                onChange={(value) =>
                  setDraft({
                    ...draft,
                    targetUser: {
                      ...draft.targetUser,
                      segment: { ...draft.targetUser.segment, value },
                    },
                  })
                }
              />
              <FieldEditor
                label="Age range"
                value={draft.targetUser.ageRange.value}
                rows={1}
                onChange={(value) =>
                  setDraft({
                    ...draft,
                    targetUser: {
                      ...draft.targetUser,
                      ageRange: { ...draft.targetUser.ageRange, value },
                    },
                  })
                }
              />
              <ListEditor
                label="Goals"
                values={draft.targetUser.goals.map((item) => item.value)}
                onChange={(values) =>
                  setDraft({
                    ...draft,
                    targetUser: {
                      ...draft.targetUser,
                      goals: values.map((value, index) => ({
                        ...(draft.targetUser.goals[index] ?? {
                          source: "ai_inference" as const,
                          needsValidation: true,
                        }),
                        value,
                      })),
                    },
                  })
                }
              />
              <ListEditor
                label="Behaviors"
                values={draft.targetUser.behaviors.map((item) => item.value)}
                onChange={(values) =>
                  setDraft({
                    ...draft,
                    targetUser: {
                      ...draft.targetUser,
                      behaviors: values.map((value, index) => ({
                        ...(draft.targetUser.behaviors[index] ?? {
                          source: "ai_inference" as const,
                          needsValidation: true,
                        }),
                        value,
                      })),
                    },
                  })
                }
              />
            </div>
          ) : (
            <>
              <ul className="space-y-2.5">
                <li>
                  <EvidenceLine field={targetUser.segment} />
                </li>
                <li>
                  <EvidenceLine
                    field={targetUser.ageRange}
                    prefix={agePrefix}
                  />
                </li>
              </ul>
              <div className="mt-5 border-t border-border pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Goals
                </p>
                <div className="mt-2">
                  <EvidenceItemList items={targetUser.goals} />
                </div>
              </div>
              <div className="mt-5 border-t border-border pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Behaviors
                </p>
                <div className="mt-2">
                  <EvidenceItemList items={targetUser.behaviors} />
                </div>
              </div>
            </>
          )}
        </AnalysisCard>

        <AnalysisCard
          title="Core Problem"
          eyebrow="Problem"
          isEditing={editingCard === "core-problem"}
          onEdit={() => beginEdit("core-problem")}
          onCancelEdit={cancelEdit}
          onSaveEdit={() =>
            draft && saveScalar("coreProblem", draft.coreProblem.value)
          }
          onRegenerate={() => handleRegenerate("core-problem")}
          regenerateBusy={regenerating}
        >
          {editingCard === "core-problem" && draft ? (
            <FieldEditor
              label="Core problem"
              value={draft.coreProblem.value}
              onChange={(value) =>
                setDraft({
                  ...draft,
                  coreProblem: { ...draft.coreProblem, value },
                })
              }
            />
          ) : (
            <EvidenceLine field={analysis.coreProblem} />
          )}
        </AnalysisCard>

        <AnalysisCard
          title="Pain Points"
          eyebrow="Friction"
          isEditing={editingCard === "pain-points"}
          onEdit={() => beginEdit("pain-points")}
          onCancelEdit={cancelEdit}
          onSaveEdit={() =>
            draft &&
            saveList(
              "painPoints",
              draft.painPoints.map((item) => item.value),
            )
          }
          onRegenerate={() => handleRegenerate("pain-points")}
          regenerateBusy={regenerating}
        >
          {editingCard === "pain-points" && draft ? (
            <ListEditor
              label="Pain points"
              values={draft.painPoints.map((item) => item.value)}
              onChange={(values) =>
                setDraft({
                  ...draft,
                  painPoints: values.map((value, index) => ({
                    ...(draft.painPoints[index] ?? {
                      source: "ai_inference" as const,
                      needsValidation: true,
                    }),
                    value,
                  })),
                })
              }
            />
          ) : (
            <EvidenceItemList items={analysis.painPoints} />
          )}
        </AnalysisCard>

        <AnalysisCard
          title="Core Scenarios"
          eyebrow="Usage"
          isEditing={editingCard === "core-scenarios"}
          onEdit={() => beginEdit("core-scenarios")}
          onCancelEdit={cancelEdit}
          onSaveEdit={() =>
            draft &&
            saveList(
              "coreScenarios",
              draft.coreScenarios.map((item) => item.value),
            )
          }
          onRegenerate={() => handleRegenerate("core-scenarios")}
          regenerateBusy={regenerating}
        >
          {editingCard === "core-scenarios" && draft ? (
            <ListEditor
              label="Core scenarios"
              values={draft.coreScenarios.map((item) => item.value)}
              onChange={(values) =>
                setDraft({
                  ...draft,
                  coreScenarios: values.map((value, index) => ({
                    ...(draft.coreScenarios[index] ?? {
                      source: "ai_inference" as const,
                      needsValidation: true,
                    }),
                    value,
                  })),
                })
              }
            />
          ) : (
            <EvidenceItemList items={analysis.coreScenarios} ordered />
          )}
        </AnalysisCard>

        <AnalysisCard
          title="Product Positioning"
          eyebrow="Positioning"
          className="lg:col-span-2"
          isEditing={editingCard === "positioning"}
          onEdit={() => beginEdit("positioning")}
          onCancelEdit={cancelEdit}
          onSaveEdit={() =>
            draft &&
            saveScalar("productPositioning", draft.productPositioning.value)
          }
          onRegenerate={() => handleRegenerate("positioning")}
          regenerateBusy={regenerating}
        >
          {editingCard === "positioning" && draft ? (
            <FieldEditor
              label="Product positioning"
              value={draft.productPositioning.value}
              onChange={(value) =>
                setDraft({
                  ...draft,
                  productPositioning: {
                    ...draft.productPositioning,
                    value,
                  },
                })
              }
            />
          ) : (
            <EvidenceLine field={analysis.productPositioning} />
          )}
        </AnalysisCard>

        <AnalysisCard
          title="Assumptions to Validate"
          eyebrow="Assumptions"
          isEditing={editingCard === "assumptions"}
          onEdit={() => beginEdit("assumptions")}
          onCancelEdit={cancelEdit}
          onSaveEdit={() =>
            draft &&
            saveList(
              "assumptions",
              draft.assumptions.map((item) => item.value),
            )
          }
          onRegenerate={() => handleRegenerate("assumptions")}
          regenerateBusy={regenerating}
        >
          {editingCard === "assumptions" && draft ? (
            <ListEditor
              label="Assumptions"
              values={draft.assumptions.map((item) => item.value)}
              onChange={(values) =>
                setDraft({
                  ...draft,
                  assumptions: values.map((value, index) => ({
                    ...(draft.assumptions[index] ?? {
                      source: "ai_inference" as const,
                      needsValidation: true,
                    }),
                    value,
                  })),
                })
              }
            />
          ) : (
            <EvidenceItemList items={analysis.assumptions} />
          )}
        </AnalysisCard>

        <AnalysisCard
          title="Open Questions"
          eyebrow="Research"
          isEditing={editingCard === "open-questions"}
          onEdit={() => beginEdit("open-questions")}
          onCancelEdit={cancelEdit}
          onSaveEdit={() =>
            draft &&
            saveList(
              "openQuestions",
              draft.openQuestions.map((item) => item.value),
            )
          }
          onRegenerate={() => handleRegenerate("open-questions")}
          regenerateBusy={regenerating}
        >
          {editingCard === "open-questions" && draft ? (
            <ListEditor
              label="Open questions"
              values={draft.openQuestions.map((item) => item.value)}
              onChange={(values) =>
                setDraft({
                  ...draft,
                  openQuestions: values.map((value, index) => ({
                    ...(draft.openQuestions[index] ?? {
                      source: "ai_inference" as const,
                      needsValidation: true,
                    }),
                    value,
                  })),
                })
              }
            />
          ) : (
            <EvidenceItemList items={analysis.openQuestions} />
          )}
        </AnalysisCard>
      </div>

      <div className="border-t border-border pt-8">
        {isConfirmed ? (
          <div className="rounded-lg border border-border bg-surface-muted/40 px-5 py-4">
            <p className="text-base font-semibold text-ink">
              Analysis confirmed
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Confirmed analysis will be used as context for MVP prioritization.
            </p>
            <p className="mt-3 text-xs text-ink-faint">
              Editing any field returns status to Draft and requires confirm
              again.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm text-ink-muted">
              Confirm when this analysis is ready to become downstream context.
              MVP Scope remains mock until a later stage.
            </p>
            <Button type="button" onClick={handleConfirm}>
              Confirm Analysis
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
