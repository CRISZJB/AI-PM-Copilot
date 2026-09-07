/**
 * AI Contract — shared evidence metadata for analysis fields.
 * Keep this small: value + provenance + validation flag.
 */

export type EvidenceSource = "user_input" | "ai_inference" | "not_provided";

export interface EvidenceField<T = string> {
  value: T;
  source: EvidenceSource;
  needsValidation: boolean;
  /** PM manually changed this value after AI proposal. Keeps original `source`. */
  editedByUser?: boolean;
}

export function evidence<T>(
  value: T,
  source: EvidenceSource,
  needsValidation = source === "ai_inference",
): EvidenceField<T> {
  return { value, source, needsValidation };
}

export function fromInput<T>(value: T): EvidenceField<T> {
  return evidence(value, "user_input", false);
}

export function fromInference<T>(
  value: T,
  needsValidation = true,
): EvidenceField<T> {
  return evidence(value, "ai_inference", needsValidation);
}

/** Explicit missing information — not an inference. */
export function fromNotProvided(
  value = "Not provided",
): EvidenceField<string> {
  return evidence(value, "not_provided", false);
}
