"use client";

import type { WorkspaceSection } from "@/types/project";

const navItems: { id: WorkspaceSection; label: string; step: string }[] = [
  { id: "overview", label: "Overview", step: "01" },
  { id: "analysis", label: "Product Analysis", step: "02" },
  { id: "mvp", label: "MVP Scope", step: "03" },
  { id: "requirements", label: "Requirements", step: "04" },
  { id: "prd", label: "PRD", step: "05" },
];

interface WorkspaceSidebarProps {
  active: WorkspaceSection;
  onSelect: (section: WorkspaceSection) => void;
  projectName: string;
}

export function WorkspaceSidebar({
  active,
  onSelect,
  projectName,
}: WorkspaceSidebarProps) {
  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-border bg-white">
      <div className="border-b border-border px-5 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-faint">
          Project
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-ink">
          {projectName}
        </p>
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
          Structured workflow: Idea → Analysis → MVP → Requirements → PRD
        </p>
      </div>
    </aside>
  );
}
