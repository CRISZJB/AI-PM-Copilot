import type { AcceptanceCriterion } from "@/types/project";

export function AcceptanceCriteriaList({
  items,
}: {
  items: AcceptanceCriterion[];
}) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={`${item.given}-${index}`}
          className="rounded-md border border-border bg-surface-muted/60 px-4 py-3"
        >
          <p className="text-sm text-ink">
            <span className="font-semibold text-ink">Given</span> {item.given}
          </p>
          <p className="mt-1.5 text-sm text-ink">
            <span className="font-semibold text-ink">When</span> {item.when}
          </p>
          <p className="mt-1.5 text-sm text-ink">
            <span className="font-semibold text-ink">Then</span> {item.then}
          </p>
          {item.and?.map((clause) => (
            <p key={clause} className="mt-1.5 text-sm text-ink">
              <span className="font-semibold text-ink">And</span> {clause}
            </p>
          ))}
        </li>
      ))}
    </ul>
  );
}
