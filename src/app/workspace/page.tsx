import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function WorkspacePage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader compact />
      <Suspense
        fallback={
          <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center text-sm text-ink-muted">
            正在加载工作区…
          </div>
        }
      >
        <WorkspaceShell />
      </Suspense>
    </div>
  );
}
