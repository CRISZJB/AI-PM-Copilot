"use client";

import { useRouter } from "next/navigation";
import { defaultProjectInput } from "@/data/mock-project";
import { createWorkspaceFromInput } from "@/lib/project-store";
import { Button } from "@/components/ui/Button";

/**
 * Demo UX only: loads the existing Sample mock workspace and opens PRD.
 * Does not change AI pipeline, schemas, or HITL.
 */
export function LoadSampleButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  function handleClick() {
    createWorkspaceFromInput(defaultProjectInput);
    router.push("/workspace?section=prd");
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className={className}
      onClick={handleClick}
    >
      查看示例工作流
    </Button>
  );
}
