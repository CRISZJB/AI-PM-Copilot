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
    label: "Project Name",
    placeholder: "e.g. AI Study Planner",
  },
  {
    key: "productIdea",
    label: "Product Idea",
    placeholder:
      "e.g. An AI-powered study planning assistant for university students.",
    rows: 3,
  },
  {
    key: "targetUser",
    label: "Target User",
    placeholder: "e.g. University students aged 18–24.",
    rows: 2,
  },
  {
    key: "problem",
    label: "Problem",
    placeholder:
      "e.g. Students struggle to organize study tasks, maintain consistent plans and adjust schedules when priorities change.",
    rows: 3,
  },
  {
    key: "businessGoal",
    label: "Business Goal",
    placeholder:
      "e.g. Help students improve study planning efficiency and completion consistency.",
    rows: 2,
  },
  {
    key: "constraints",
    label: "Constraints",
    placeholder:
      "e.g. MVP should remain simple and focus on planning rather than becoming a full learning platform.",
    rows: 2,
  },
];

const loadingMessages = [
  "Analyzing product context...",
  "Identifying assumptions...",
  "Structuring product insights...",
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
          payload.error || "We couldn't analyze this product idea.",
        );
      }

      createWorkspaceWithAnalysis(form, payload.analysis);
      router.push("/workspace?section=analysis");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't analyze this product idea.";
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
          <p className="text-sm text-ink">
            We couldn&apos;t analyze this product idea.
          </p>
          <p className="mt-1 text-xs text-ink-faint">{error}</p>
          <button
            type="button"
            onClick={() => void analyzeProductIdea()}
            className="mt-3 text-xs font-medium text-ink underline-offset-2 hover:underline"
          >
            Try Again
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
        <p className="max-w-md text-sm text-ink-muted">
          {isSubmitting
            ? loadingMessage
            : "Structured Product Analysis is generated from your inputs. Review before moving to MVP scope."}
        </p>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Analyzing…" : "Analyze Product Idea"}
        </Button>
      </div>
    </form>
  );
}
