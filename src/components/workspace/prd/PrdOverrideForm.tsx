"use client";

import type { PrdOverride } from "@/ai/prd";

const fields: {
  key: keyof Pick<
    PrdOverride,
    "successMetrics" | "validationPlan" | "openDecisions" | "pmNotes"
  >;
  label: string;
  hint: string;
  rows: number;
}[] = [
  {
    key: "successMetrics",
    label: "成功标准",
    hint: "本版如何判断「验证成功」？",
    rows: 3,
  },
  {
    key: "validationPlan",
    label: "验证计划",
    hint: "用什么方法、在多长时间内观察？",
    rows: 3,
  },
  {
    key: "openDecisions",
    label: "开放决策",
    hint: "仍未拍板、需要跟进的问题。",
    rows: 3,
  },
  {
    key: "pmNotes",
    label: "备注",
    hint: "给自己或评审者的补充说明。",
    rows: 3,
  },
];

export function PrdOverrideForm({
  value,
  onChange,
}: {
  value: PrdOverride;
  onChange: (next: PrdOverride) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium text-ink-faint">
          仅补充 PRD 决策层内容——不会回写产品分析、MVP 或需求。
        </p>
      </div>
      {fields.map((field) => (
        <label key={field.key} className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {field.label}
          </span>
          <span className="mt-1 block text-xs text-ink-faint">{field.hint}</span>
          <textarea
            value={value[field.key]}
            onChange={(event) =>
              onChange({ ...value, [field.key]: event.target.value })
            }
            rows={field.rows}
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink"
          />
        </label>
      ))}
    </div>
  );
}
