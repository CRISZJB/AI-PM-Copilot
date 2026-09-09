"use client";

import type { WorkspaceSection } from "@/types/project";

const navItems: { id: WorkspaceSection; label: string; step: string }[] = [
  { id: "overview", label: "概览", step: "01" },
  { id: "analysis", label: "产品分析", step: "02" },
  { id: "mvp", label: "MVP 范围", step: "03" },
  { id: "requirements", label: "需求", step: "04" },
  { id: "prd", label: "PRD", step: "05" },
];

interface WorkspaceSidebarProps {
  active: WorkspaceSection;
  onSelect: (section: WorkspaceSection) => void;
  projectName: string;
  isSample?: boolean;
}

export function WorkspaceSidebar({
  active,
  onSelect,
  projectName,
  isSample = false,
}: WorkspaceSidebarProps) {
  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-border bg-white">
      <div className="border-b border-border px-5 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-faint">
          项目
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-ink">
          {projectName}
        </p>
        {isSample ? (
          <p className="mt-2 inline-flex rounded border border-dashed border-border px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
            示例案例 · Copilot 演示
          </p>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                isActive
                  ? "bg-ink text-white"
                  : "text-ink-muted hover:bg-surface-muted hover:text-ink"
              }`}
            >
              <span
                className={`font-mono text-[11px] ${
                  isActive ? "text-white/70" : "text-ink-faint"
                }`}
              >
                {item.step}
              </span>
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border px-5 py-4">
        <p className="text-xs leading-relaxed text-ink-faint">
          AI PM Copilot：想法 → 分析 → MVP → 需求 → PRD
        </p>
      </div>
    </aside>
  );
}
