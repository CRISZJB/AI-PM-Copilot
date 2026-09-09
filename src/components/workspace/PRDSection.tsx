"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  EvidenceField,
  ProjectWorkspace,
  Requirement,
} from "@/types/project";
import {
  assemblePrd,
  emptyPrdOverride,
  mergePrd,
  prdToMarkdown,
  type PrdOverride,
} from "@/ai/prd";
import { evidenceBadges } from "@/ai/types/evidence-ui";
import { AcceptanceCriteriaList } from "@/components/ui/AcceptanceCriteriaList";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { SourceBadgeGroup } from "@/components/ui/SourceBadge";
import { PrdOverrideForm } from "@/components/workspace/prd/PrdOverrideForm";
import { PrdToolbar } from "@/components/workspace/prd/PrdToolbar";
import {
  loadPrdOverride,
  savePrdOverride,
} from "@/lib/prd-override-store";
import { markPrdSynced } from "@/lib/project-store";

function TraceSource({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded border border-border bg-surface-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
      来源：{label}
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

function EvidenceLine({ field }: { field: EvidenceField }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="text-ink">{field.value}</span>
      <SourceBadgeGroup variants={evidenceBadges(field)} />
    </div>
  );
}

function categoryLabel(category: string): string {
  if (category === "should_have") return "应该有";
  if (category === "not_now") return "暂不做";
  return "必须有";
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
        <Field label="用户故事">
          <p>
            作为 {requirement.userStory.asA}，我想要 {requirement.userStory.iWant}
            ，以便 {requirement.userStory.soThat}。
          </p>
        </Field>

        <Field
          label={requirement.requiredInputs ? "关键输入" : "关键用户操作"}
        >
          <ul className="list-disc space-y-1 pl-4 text-ink-muted">
            {keyInputs.map((item) => (
              <li key={item}>{item}</li>
            ))}
            {requirement.optionalInputs?.map((item) => (
              <li key={item}>
                {item} <span className="text-ink-faint">（可选）</span>
              </li>
            ))}
          </ul>
        </Field>

        <Field label="关键 AI / 系统行为">
          <ul className="list-disc space-y-1 pl-4 text-ink-muted">
            {keyBehaviors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Field>

        <div>
          <SectionLabel>关键验收标准</SectionLabel>
          <div className="mt-2">
            <AcceptanceCriteriaList items={keyCriteria} />
          </div>
        </div>
      </div>
    </div>
  );
}

function buildExportMarkdown(
  workspace: ProjectWorkspace,
  override: PrdOverride,
): string {
  const assembled = assemblePrd(workspace);
  const document = mergePrd(assembled, override);
  return prdToMarkdown(document);
}

function downloadMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function PRDSection({ workspace }: { workspace: ProjectWorkspace }) {
  const prd = useMemo(() => assemblePrd(workspace), [workspace]);
  const projectName = workspace.input.projectName;
  const [overrideDraft, setOverrideDraft] = useState<PrdOverride>(() =>
    emptyPrdOverride(),
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setOverrideDraft(loadPrdOverride(projectName));
    setStatusMessage(null);
  }, [projectName]);

  const { analysis, analysisStatus, mvpScopeStatus, requirements, prdSync } =
    workspace;
  const analysisConfirmed = analysisStatus === "confirmed";
  const mvpConfirmed = mvpScopeStatus === "confirmed";
  const hasRequirements = requirements.length > 0;
  const isSample = workspace.mvpScopeSource === "mock";
  const prdIncomplete =
    !analysisConfirmed || !mvpConfirmed || !hasRequirements;
  const syncStatus = prdSync.syncStatus;

  function handleSave() {
    savePrdOverride(projectName, overrideDraft);
    const saved = loadPrdOverride(projectName);
    setOverrideDraft(saved);
    setStatusMessage("补充内容已保存。");
  }

  function handleDownload() {
    const markdown = buildExportMarkdown(workspace, overrideDraft);
    const safeName =
      projectName.trim().replace(/[\\/:*?"<>|]+/g, "-") || "prd";
    downloadMarkdown(`${safeName}-PRD-draft.md`, markdown);
    setStatusMessage("已下载完整 PRD（Markdown）。");
  }

  async function handleCopy() {
    const markdown = buildExportMarkdown(workspace, overrideDraft);
    try {
      await navigator.clipboard.writeText(markdown);
      setStatusMessage("已复制完整 PRD 到剪贴板。");
    } catch {
      setStatusMessage("复制失败——请改用下载。");
    }
  }

  function handleMarkSynced() {
    markPrdSynced();
    setStatusMessage("已标记为与当前产品决策同步。");
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">
              最终产出
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              PRD 草稿
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              这是本工作流的最终交付物：由上游决策装配的初稿，加上你的补充，可保存并下载为
              Markdown，供评审与协作参考。
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              初稿反映既有产品决策，不会单独再生成。分析字段带有来源标记——并非全部为已确认事实。
            </p>
          </div>
          <PrdToolbar
            onSave={handleSave}
            onDownload={handleDownload}
            onCopy={handleCopy}
            onMarkSynced={handleMarkSynced}
            showMarkSynced={syncStatus === "outdated"}
            statusMessage={statusMessage}
          />
        </div>
      </header>

      {isSample ? (
        <div className="rounded-lg border border-dashed border-border bg-surface-muted/40 px-5 py-3">
          <p className="text-sm font-medium text-ink">
            示例案例 PRD（AI PM Copilot 演示）
          </p>
          <p className="mt-1 text-xs text-ink-faint">
            内容来自演示案例「{projectName}」，用于展示如何得到可下载
            PRD。主产品是 AI PM Copilot，不是学习规划产品本身。
          </p>
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-white px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
          上游就绪情况
        </p>
        <p className="mt-1.5 text-sm text-ink">
          分析：{" "}
          <span className="font-medium">
            {analysisConfirmed ? "已确认" : "草稿"}
          </span>
          {" · "}
          MVP：{" "}
          <span className="font-medium">
            {mvpConfirmed
              ? "已确认"
              : mvpScopeStatus === "none"
                ? "尚未生成"
                : "草稿"}
          </span>
          {" · "}
          需求：{" "}
          <span className="font-medium">
            {hasRequirements ? "已从 MVP 范围生成" : "尚未生成"}
          </span>
        </p>
        {prdIncomplete ? (
          <p className="mt-2 text-sm text-ink-muted">
            当前 PRD 由工作区状态装配。请确认分析、确认 MVP
            并生成需求以得到完整草稿——本视图不会假装文档已完成。
          </p>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">
            当前 PRD 由工作区状态装配（已确认分析、已确认 MVP，以及已生成需求）。
          </p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-white px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            PRD 状态
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded border border-border bg-surface-muted/60 px-2 py-0.5 text-xs font-medium text-ink-muted">
              {prd.sync.status === "Draft" ? "草稿" : prd.sync.status}
            </span>
            <span className="inline-flex items-center rounded border border-border px-2 py-0.5 text-xs text-ink-faint">
              可补充 · 可下载
            </span>
            {syncStatus === "up-to-date" ? (
              <span className="inline-flex items-center rounded border border-border px-2 py-0.5 text-xs text-ink-faint">
                已是最新
              </span>
            ) : (
              <span className="inline-flex items-center rounded border border-border px-2 py-0.5 text-xs text-ink-muted">
                PRD 可能已过时
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-ink-faint">
            由工作区决策装配——非独立 LLM 生成器。{prdSync.lastSyncedLabel}
          </p>
        </div>

        {syncStatus === "outdated" ? (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-medium text-ink">PRD 可能已过时</p>
            <p className="mt-1 text-sm text-ink-muted">
              上游产品决策已变更。PM 补充批注会保留；请审阅装配内容后标记已同步。
            </p>
          </div>
        ) : null}
      </div>

      <article className="rounded-lg border border-border bg-white px-6 sm:px-8">
        <PrdSection number="01" title="产品概览">
          <div className="space-y-4">
            <Field label="产品名称">{prd.productOverview.productName}</Field>
            <Field label="产品摘要">
              <EvidenceLine field={analysis.productPositioning} />
            </Field>
            <Field label="产品目标">{prd.productOverview.productGoal}</Field>
            <Field label="约束条件">{prd.constraints || "（未提供）"}</Field>
          </div>
        </PrdSection>

        <PrdSection number="02" title="目标用户" source="产品分析">
          <ul className="space-y-3">
            <li>
              <EvidenceLine field={analysis.targetUser.segment} />
            </li>
            <li>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-ink">
                  年龄 {analysis.targetUser.ageRange.value}
                </span>
                <SourceBadgeGroup
                  variants={evidenceBadges(analysis.targetUser.ageRange)}
                />
              </div>
            </li>
            <li className="text-ink-muted">
              来自项目输入：{prd.targetUser.fromInput}
            </li>
          </ul>
        </PrdSection>

        <PrdSection
          number="03"
          title="用户问题与核心场景"
          source="产品分析"
        >
          <div className="space-y-5">
            <Field label="核心问题">
              <EvidenceLine field={analysis.coreProblem} />
            </Field>
            <div>
              <SectionLabel>痛点</SectionLabel>
              <ul className="mt-2 list-disc space-y-2 pl-4">
                {analysis.painPoints.map((point) => (
                  <li key={`${point.source}-${point.value}`}>
                    <EvidenceLine field={point} />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionLabel>核心场景</SectionLabel>
              <ol className="mt-2 list-decimal space-y-2 pl-4">
                {analysis.coreScenarios.map((scenario) => (
                  <li key={`${scenario.source}-${scenario.value}`}>
                    <EvidenceLine field={scenario} />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </PrdSection>

        <PrdSection number="04" title="产品假设">
          <p className="text-ink">{prd.productHypothesis}</p>
          <div className="mt-4 rounded-md border border-border bg-surface-muted/40 px-4 py-3">
            <SectionLabel>V1 验证焦点</SectionLabel>
            {prd.mvpScope.mustHave.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-4 text-ink-muted">
                {prd.mvpScope.mustHave.map((feature) => (
                  <li key={feature.id}>{feature.name}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">
                请生成并确认 MVP 范围以填充必须有焦点。
              </p>
            )}
          </div>
        </PrdSection>

        <PrdSection number="05" title="MVP 范围" source="MVP 范围">
          {!mvpConfirmed && mvpScopeStatus === "none" ? (
            <p className="text-sm text-ink-muted">
              尚未生成 MVP 范围。当前 PRD 按工作区状态装配。
            </p>
          ) : (
            <div className="space-y-5">
              {!mvpConfirmed ? (
                <p className="text-xs text-ink-faint">
                  MVP 仍为草稿——PRD 中请将此范围视为临时。
                </p>
              ) : null}
              <div>
                <SectionLabel>P0 / 必须有</SectionLabel>
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
                <SectionLabel>V1 范围外</SectionLabel>
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
          )}
        </PrdSection>

        <PrdSection
          number="06"
          title="功能需求"
          source="基于 MVP 范围生成的需求"
        >
          {!hasRequirements ? (
            <p className="text-sm text-ink-muted">
              尚未生成需求。当前 PRD
              按工作区状态装配——请在确认 MVP 后生成需求以填充本节。
            </p>
          ) : (
            <div>
              <p className="mb-4 text-xs text-ink-faint">
                此处为便于浏览的摘要；下载的 Markdown 含完整验收标准与系统行为。
              </p>
              {prd.functionalRequirements.map((requirement, index) => (
                <RequirementSummary
                  key={requirement.id}
                  requirement={requirement}
                  index={index}
                />
              ))}
            </div>
          )}
        </PrdSection>

        <PrdSection number="07" title="AI 行为与失败处理" source="装配">
          <ul className="list-disc space-y-2 pl-4">
            {prd.aiBehaviorRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </PrdSection>

        <PrdSection number="08" title="待验证假设" source="产品分析">
          <ul className="space-y-3">
            {prd.assumptions.map((assumption) => (
              <li
                key={assumption.value}
                className="border-b border-border pb-3 last:border-b-0 last:pb-0"
              >
                <EvidenceLine field={assumption} />
              </li>
            ))}
          </ul>
        </PrdSection>

        <PrdSection number="09" title="待解问题" source="产品分析">
          <ul className="space-y-3">
            {prd.openQuestions.map((question) => (
              <li key={question.value}>
                <EvidenceLine field={question} />
              </li>
            ))}
          </ul>
        </PrdSection>

        <PrdSection number="10" title="风险">
          <ul className="list-disc space-y-1.5 pl-4">
            {prd.risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </PrdSection>

        <PrdSection number="11" title="PM 补充" source="PM Override">
          <PrdOverrideForm value={overrideDraft} onChange={setOverrideDraft} />
          <p className="mt-4 text-xs text-ink-faint">
            补充内容只影响本 PRD，不会改写产品分析、MVP 或需求原文。保存后即可一并下载。
          </p>
        </PrdSection>
      </article>
    </div>
  );
}
