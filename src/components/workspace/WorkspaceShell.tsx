"use client";

import { useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { defaultProjectInput, buildMockWorkspace } from "@/data/mock-project";
import { loadWorkspace, subscribeWorkspace } from "@/lib/project-store";
import type { WorkspaceSection } from "@/types/project";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { OverviewSection } from "@/components/workspace/OverviewSection";
import { AnalysisSection } from "@/components/workspace/AnalysisSection";
import { MVPSection } from "@/components/workspace/MVPSection";
import { RequirementsSection } from "@/components/workspace/RequirementsSection";
import { PRDSection } from "@/components/workspace/PRDSection";

const serverWorkspace = buildMockWorkspace(defaultProjectInput);

const validSections = new Set<WorkspaceSection>([
  "overview",
  "analysis",
  "mvp",
  "requirements",
  "prd",
]);

function subscribe(onStoreChange: () => void) {
  return subscribeWorkspace(onStoreChange);
}

function getServerWorkspace() {
  return serverWorkspace;
}

function sectionFromSearch(
  value: string | null,
): WorkspaceSection | null {
  if (value && validSections.has(value as WorkspaceSection)) {
    return value as WorkspaceSection;
  }
  return null;
}

export function WorkspaceShell() {
  const searchParams = useSearchParams();
  const workspace = useSyncExternalStore(
    subscribe,
    loadWorkspace,
    getServerWorkspace,
  );
  const urlSection = sectionFromSearch(searchParams.get("section"));
  const [userSection, setUserSection] = useState<WorkspaceSection | null>(null);
  const active = userSection ?? urlSection ?? "overview";
  const isSample = workspace.mvpScopeSource === "mock";

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-surface">
      <WorkspaceSidebar
        active={active}
        onSelect={setUserSection}
        projectName={workspace.input.projectName}
        isSample={isSample}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1120px] px-8 py-10">
          {active === "overview" ? (
            <OverviewSection workspace={workspace} />
          ) : null}
          {active === "analysis" ? (
            <AnalysisSection workspace={workspace} />
          ) : null}
          {active === "mvp" ? <MVPSection workspace={workspace} /> : null}
          {active === "requirements" ? (
            <RequirementsSection workspace={workspace} />
          ) : null}
          {active === "prd" ? <PRDSection workspace={workspace} /> : null}
        </div>
      </main>
    </div>
  );
}
