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
    title: "必须有",
    subtitle: "验证核心假设的最低推荐范围",
  },
  {
    id: "should_have",
    title: "应该有",
    subtitle: "建议在「生成→审阅」闭环验证后再做",
  },
  {
    id: "not_now",
    title: "暂不做",
    subtitle: "基于当前范围有意推迟",
  },
];

const loadingMessages = [
  "正在对功能排优先级…",
  "正在检验最小验证范围…",
  "正在审阅取舍…",
];

const REGENERATE_WARNING =
  "重新生成可能替换未确认的 AI 建议。PM 重排 / 手改决策会保留。是否继续？";

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
              PM 已重排
            </span>
          ) : null}
          {feature.editedByUser ? (
            <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
              PM 已编辑
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
              编辑
            </button>
            <span className="text-ink-faint/40">·</span>
            <button
              type="button"
              onClick={() => setMode("reprioritize")}
              className="text-xs text-ink-faint transition-colors hover:text-ink"
            >
              重排优先级
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={mode === "edit" ? saveEdit : saveReprioritize}
              className="text-xs font-medium text-ink transition-colors hover:text-ink-soft"
            >
              保存
            </button>
            <span className="text-ink-faint/40">·</span>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="text-xs text-ink-faint transition-colors hover:text-ink"
            >
              取消
            </button>
          </div>
        )}
      </div>

      {mode === "edit" ? (
        <div className="mt-3 space-y-3">
          <label className="block space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              名称
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink/30"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              描述
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
              理由
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
            优先级
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
            分类自动更新：P0 → 必须有，P1 → 应该有，P2 → 暂不做。
          </p>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {feature.description}
          </p>

          <div className="mt-4 rounded-md border border-border bg-surface-muted/40 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              为何此优先级
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink">
              {feature.rationale}
            </p>
          </div>

          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              优先级依据
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
        "进行 MVP 优先级排序前需已确认产品分析。",
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
          payload.error || "无法完成该 MVP 范围的优先级排序。",
        );
      }

      const nextScope =
        options?.regenerate && hasLiveOrMockScope
          ? mergeMvpPreservingEdits(mvpScope, payload.mvpScope)
          : payload.mvpScope;

      saveLiveMvpScope(nextScope);
      setMessage(
        options?.regenerate
          ? "MVP 范围已重新生成。请审阅优先级，就绪后确认。"
          : "MVP 范围已生成为草稿。确认前请先审阅。",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "无法完成该 MVP 范围的优先级排序。",
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
        ? "已保存。MVP 范围已回到草稿——生成需求前请再次确认。"
        : "已保存。",
    );
  }

  function handleConfirm() {
    try {
      confirmMvpScope();
      setMessage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "无法确认 MVP。");
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">
          MVP 范围
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          功能优先级
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          基于已确认产品分析，推荐验证核心产品假设所需的最小范围——而非重写想法。
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          AI 协助排序，最终由 PM 决策。
        </p>
      </header>

      <div className="rounded-lg border border-border bg-white px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-faint">
          分析门槛
        </p>
        <p className="mt-1.5 text-sm text-ink">
          {analysisConfirmed
            ? "产品分析已确认。MVP 优先级排序使用该已确认快照（含 PM 编辑）。"
            : "产品分析仍为草稿。请先确认分析，再生成实时 MVP 范围。"}
        </p>
      </div>

      {hasLiveOrMockScope ? (
        <div className="rounded-lg border border-border bg-white px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-faint">
            MVP 范围状态
          </p>
          <p className="mt-1.5 text-base font-semibold text-ink">
            {isConfirmed ? "已确认" : "草稿"}
            {mvpScopeSource === "mock" ? (
              <span className="ml-2 text-xs font-normal text-ink-faint">
                （示例 / mock）
              </span>
            ) : null}
            {mvpScopeSource === "live" ? (
              <span className="ml-2 text-xs font-normal text-ink-faint">
                （实时 DeepSeek）
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {isConfirmed
              ? "已确认范围将用于生成功能需求。"
              : "继续前请审阅 AI 建议的优先级。"}
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
              重试
            </Button>
          ) : null}
        </div>
      ) : null}

      {!hasLiveOrMockScope ? (
        <div className="rounded-lg border border-border bg-white px-6 py-8">
          <h2 className="text-base font-semibold text-ink">生成 MVP 范围</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            对已确认产品分析运行 DeepSeek 优先级排序。确认分析时不会自动生成。
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
              生成 MVP 范围
            </Button>
          )}
          {!analysisConfirmed ? (
            <p className="mt-3 text-xs text-ink-faint">
              请先确认产品分析以解锁生成。
            </p>
          ) : null}
        </div>
      ) : (
        <>
          {mvpScope.coreHypothesis ? (
            <section className="rounded-lg border border-border bg-white p-6">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">
                验证焦点
              </p>
              <h2 className="mt-2 text-sm font-semibold text-ink">核心假设</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {mvpScope.coreHypothesis}
              </p>
            </section>
          ) : null}

          <section className="rounded-lg border border-border bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-ink">优先级逻辑</h2>
                <p className="mt-2 text-sm text-ink-muted">功能优先级依据：</p>
              </div>
              {mvpScopeSource === "live" || analysisConfirmed ? (
                <button
                  type="button"
                  disabled={isGenerating || !analysisConfirmed}
                  onClick={() => generateMvpScope({ regenerate: true })}
                  className="text-xs text-ink-faint transition-colors hover:text-ink disabled:opacity-50"
                >
                  {isGenerating ? "重新生成中…" : "重新生成"}
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
                      <p className="py-5 text-sm text-ink-faint">无</p>
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
              范围控制
            </p>
            <h2 className="mt-2 text-sm font-semibold text-ink">
              取舍 / 范围说明
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
                  MVP 范围已确认
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  已确认范围将用于生成功能需求。
                </p>
                <p className="mt-3 text-xs text-ink-faint">
                  编辑或重新生成会将状态打回草稿。
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xl text-sm text-ink-muted">
                  当此优先级可用于需求时请确认。确认不会自动生成需求——请打开「需求」并显式生成。
                </p>
                <Button type="button" onClick={handleConfirm}>
                  确认 MVP 范围
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
