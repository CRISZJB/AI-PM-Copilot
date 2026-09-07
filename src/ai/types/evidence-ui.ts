import type { EvidenceField, EvidenceSource } from "@/ai/types";

export type SourceBadgeVariant =
  | "from-input"
  | "ai-inference"
  | "not-provided"
  | "needs-validation"
  | "pm-edited";

export function sourceToBadge(source: EvidenceSource): SourceBadgeVariant {
  if (source === "user_input") return "from-input";
  if (source === "not_provided") return "not-provided";
  return "ai-inference";
}

export function evidenceBadges(field: EvidenceField): SourceBadgeVariant[] {
  const badges: SourceBadgeVariant[] = [sourceToBadge(field.source)];
  if (field.editedByUser) {
    badges.push("pm-edited");
  }
  if (field.needsValidation) {
    badges.push("needs-validation");
  }
  return badges;
}
