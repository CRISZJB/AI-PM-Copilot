"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { defaultProjectInput } from "@/data/mock-project";
import { createWorkspaceWithAnalysis } from "@/lib/project-store";
import type { ProductAnalysis, ProjectInput } from "@/types/project";
import { Button } from "@/components/ui/Button";

const fields: {
  key: keyof ProjectInput;
  label: string;
  placeholder: string;
  rows?: number;
}[] = [
  {
    key: "projectName",
    label: "项目名称",
    placeholder: "例如：AI 学习规划助手",
  },
  {
    key: "productIdea",
    label: "产品想法",
    placeholder: "例如：面向大学生的 AI 学习规划助手。",
    rows: 3,
  },
  {
    key: "targetUser",
    label: "目标用户",
    placeholder: "例如：18–24 岁的大学生。",
    rows: 2,
  },
  {
    key: "problem",
    label: "问题",
    placeholder:
      "例如：学生难以组织学习任务、保持计划一致性，并在优先级变化时调整安排。",
    rows: 3,
  },
  {
    key: "businessGoal",
    label: "业务目标",
    placeholder: "例如：帮助学生提升学习规划效率与完成一致性。",
    rows: 2,
  },
  {
    key: "constraints",
    label: "约束条件",
    placeholder:
      "例如：MVP 应保持简单，聚焦规划而非完整学习平台。",
    rows: 2,
  },
];

const loadingMessages = [
  "正在分析产品上下文…",
  "正在识别假设…",
  "正在整理产品洞察…",
];

export function ProjectForm() {
  const router = useRouter();
  const [form, setForm] = useState<ProjectInput>(defaultProjectInput);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingTick, setLoadingTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSubmitting) return;
    const timer = window.setInterval(() => {
      setLoadingTick((current) => current + 1);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [isSubmitting]);

  const loadingMessage =
    loadingMessages[loadingTick % loadingMessages.length];

  function updateField(key: keyof ProjectInput, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function analyzeProductIdea() {
    setError(null);
    setLoadingTick(0);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ai/product-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as {
        analysis?: ProductAnalysis;
        error?: string;
      };

      if (!response.ok || !payload.analysis) {
        throw new Error(
          payload.error || "无法分析该产品想法。",
        );
      }

      createWorkspaceWithAnalysis(form, payload.analysis);
      router.push("/workspace?section=analysis");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "无法分析该产品想法。";
      setError(message);
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void analyzeProductIdea();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.key} className="space-y-2">
          <label
            htmlFor={field.key}
            className="block text-sm font-medium text-ink"
          >
            {field.label}
          </label>
          {field.rows ? (
            <textarea
              id={field.key}
              rows={field.rows}
              value={form[field.key]}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder={field.placeholder}
              required
              disabled={isSubmitting}
              className="w-full resize-y rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-60"
            />
          ) : (
            <input
              id={field.key}
              type="text"
              value={form[field.key]}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder={field.placeholder}
              required
              disabled={isSubmitting}
              className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-60"
            />
          )}
        </div>
      ))}

      {error ? (
        <div className="rounded-md border border-border bg-surface-muted/50 px-4 py-3">
          <p className="text-sm text-ink">无法分析该产品想法。</p>
          <p className="mt-1 text-xs text-ink-faint">{error}</p>
          <button
            type="button"
            onClick={() => void analyzeProductIdea()}
            className="mt-3 text-xs font-medium text-ink underline-offset-2 hover:underline"
          >
            重试
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
        <p className="max-w-md text-sm text-ink-muted">
          {isSubmitting
            ? loadingMessage
            : "将根据你的输入生成结构化产品分析。进入 MVP 范围前请先审阅。"}
        </p>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "分析中…" : "分析产品想法"}
        </Button>
      </div>
    </form>
  );
}
