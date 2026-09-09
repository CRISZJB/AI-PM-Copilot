"use client";

import { useEffect, useState } from "react";
import type { ProjectWorkspace, Requirement } from "@/types/project";
import { AcceptanceCriteriaList } from "@/components/ui/AcceptanceCriteriaList";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { Button } from "@/components/ui/Button";
import { saveLiveRequirements } from "@/lib/project-store";

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
          <SectionLabel>用户故事</SectionLabel>
          <div className="mt-2 space-y-1 text-sm leading-relaxed text-ink">
            <p>
              <span className="text-ink-faint">作为</span>{" "}
              {requirement.userStory.asA}，
            </p>
            <p>
              <span className="text-ink-faint">我想要</span>{" "}
              {requirement.userStory.iWant}，
            </p>
            <p>
              <span className="text-ink-faint">以便</span>{" "}
              {requirement.userStory.soThat}。
            </p>
          </div>
        </section>

        {requirement.requiredInputs ? (
          <section>
            <SectionLabel>必填输入</SectionLabel>
            <ChipList items={requirement.requiredInputs} />
          </section>
        ) : null}

        {requirement.optionalInputs ? (
          <section>
            <SectionLabel>可选输入</SectionLabel>
            <ChipList items={requirement.optionalInputs} />
          </section>
        ) : null}

        {requirement.userActions ? (
          <section>
            <SectionLabel>用户操作</SectionLabel>
            <ChipList items={requirement.userActions} />
          </section>
        ) : null}

        <section>
          <SectionLabel>AI / 系统行为</SectionLabel>
          <BulletList items={requirement.systemBehavior} />
        </section>

        <section>
          <SectionLabel>验收标准</SectionLabel>
          <div className="mt-3">
            <AcceptanceCriteriaList items={requirement.acceptanceCriteria} />
          </div>
        </section>

        {requirement.missingInformation ? (
          <section className="rounded-md border border-border bg-surface-muted/40 px-4 py-4">
            <SectionLabel>缺失信息</SectionLabel>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              {requirement.missingInformation.principle}
            </p>
            <p className="mt-3 text-xs font-medium text-ink-faint">系统应当：</p>
            <BulletList items={requirement.missingInformation.systemShould} />
          </section>
        ) : null}

        <section>
          <SectionLabel>边界情况 / 失败处理</SectionLabel>
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

const loadingMessages = [
  "正在为必须有功能撰写需求…",
  "正在起草验收标准…",
  "正在检查边界情况与控制边界…",
];

export function RequirementsSection({
  workspace,
}: {
  workspace: ProjectWorkspace;
}) {
  const {
    input,
    analysis,
    analysisStatus,
    mvpScope,
    mvpScopeStatus,
    mvpScopeSource,
    requirements,
  } = workspace;

  const analysisConfirmed = analysisStatus === "confirmed";
  const mvpConfirmed =
    mvpScopeStatus === "confirmed" && mvpScopeSource !== "none";
  const canGenerate = analysisConfirmed && mvpConfirmed;
  const hasRequirements = requirements.length > 0;
  const isSampleMock =
    mvpScopeSource === "mock" && hasRequirements && !canGenerate;

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

  async function generateRequirements(options?: { regenerate?: boolean }) {
    if (!canGenerate) {
      setError("生成需求前需已确认产品分析与 MVP 范围。");
      return;
    }

    if (options?.regenerate) {
      const ok = window.confirm(
        "重新生成会用基于已确认 MVP 的新 AI 草稿替换当前需求列表。是否继续？",
      );
      if (!ok) return;
    }

    setError(null);
    setMessage(null);
    setLoadingTick(0);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          analysis,
          analysisStatus: "confirmed",
          mvpScope,
          mvpScopeStatus: "confirmed",
        }),
      });

      const payload = (await response.json()) as {
        requirements?: Requirement[];
        error?: string;
      };

      if (!response.ok || !payload.requirements) {
        throw new Error(payload.error || "无法生成需求。");
      }

      saveLiveRequirements(payload.requirements);
      setMessage(
        options?.regenerate
          ? "需求已从已确认 MVP 范围重新生成。"
          : "需求已从已确认 MVP 范围生成。",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "无法生成需求。");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">
          需求
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          核心 MVP 需求
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          基于已确认的必须有 / P0 功能生成用户故事、验收标准与边界情况——而非仅凭原始想法。
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          AI 提议。请先确认 MVP，再显式生成。
        </p>
      </header>

      <div className="rounded-lg border border-border bg-white px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-faint">
          上游门槛
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
                : mvpScopeStatus === "draft"
                  ? "草稿"
                  : "未确认"}
          </span>
        </p>
        {!canGenerate ? (
          <p className="mt-2 text-xs text-ink-faint">
            生成实时需求前请确认产品分析与 MVP 范围。确认 MVP 不会自动运行本阶段。
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border border-border bg-white px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-faint">
          需求状态
        </p>
        <p className="mt-1.5 text-base font-semibold text-ink">
          {!hasRequirements
            ? "尚未生成"
            : isSampleMock
              ? "示例 / mock"
              : "实时草稿"}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {!hasRequirements
            ? "尚无需求。请在 MVP 确认后生成。"
            : isSampleMock
              ? "离线示例内容。请确认 MVP 并重新生成，以得到基于你范围的实时草稿。"
              : "由 DeepSeek 基于已确认 MVP 必须有功能生成。v1 无单独需求确认步骤。"}
        </p>
      </div>

      {message ? <p className="text-sm text-ink-muted">{message}</p> : null}
      {error ? (
        <div className="rounded-lg border border-border bg-white px-5 py-4">
          <p className="text-sm text-ink">{error}</p>
          {canGenerate ? (
            <Button
              type="button"
              className="mt-3"
              onClick={() => generateRequirements()}
              disabled={isGenerating}
            >
              重试
            </Button>
          ) : null}
        </div>
      ) : null}

      {!hasRequirements ? (
        <div className="rounded-lg border border-border bg-white px-6 py-8">
          <h2 className="text-base font-semibold text-ink">生成需求</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            对已确认 MVP 必须有功能运行 DeepSeek。确认 MVP 时不会自动生成。
          </p>
          {isGenerating ? (
            <p className="mt-6 text-sm text-ink-muted">
              {loadingMessages[loadingTick % loadingMessages.length]}
            </p>
          ) : (
            <Button
              type="button"
              className="mt-6"
              onClick={() => generateRequirements()}
              disabled={!canGenerate}
            >
              生成需求
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              {requirements.length} 条需求
            </p>
            {canGenerate ? (
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => generateRequirements({ regenerate: true })}
                className="text-xs text-ink-faint transition-colors hover:text-ink disabled:opacity-50"
              >
                {isGenerating ? "重新生成中…" : "重新生成"}
              </button>
            ) : null}
          </div>

          {isGenerating ? (
            <p className="text-sm text-ink-muted">
              {loadingMessages[loadingTick % loadingMessages.length]}
            </p>
          ) : null}

          <div className="space-y-5">
            {requirements.map((requirement, index) => (
              <RequirementCard
                key={requirement.id}
                requirement={requirement}
                index={index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
