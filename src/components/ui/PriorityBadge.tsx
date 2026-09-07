import type { Priority } from "@/types/project";

const styles: Record<Priority, string> = {
  P0: "bg-priority-p0/10 text-priority-p0 border-priority-p0/20",
  P1: "bg-priority-p1/10 text-priority-p1 border-priority-p1/20",
  P2: "bg-priority-p2/10 text-priority-p2 border-priority-p2/20",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold tracking-wide ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}
