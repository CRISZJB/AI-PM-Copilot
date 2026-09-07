import type { MvpFeature, MvpScope } from "@/ai/types";

/**
 * Merge regenerated MVP with PM-protected decisions.
 * Features marked editedByUser or reprioritizedByUser are kept.
 */
export function mergeMvpPreservingEdits(
  previous: MvpScope,
  next: MvpScope,
): MvpScope {
  const protectedFeatures = previous.features.filter(
    (feature) => feature.editedByUser || feature.reprioritizedByUser,
  );

  if (protectedFeatures.length === 0) {
    return next;
  }

  const protectedIds = new Set(protectedFeatures.map((feature) => feature.id));
  const protectedNames = new Set(
    protectedFeatures.map((feature) => feature.name.toLowerCase()),
  );

  const incoming = next.features.filter(
    (feature) =>
      !protectedIds.has(feature.id) &&
      !protectedNames.has(feature.name.toLowerCase()),
  );

  return {
    ...next,
    // Keep PM text edits on hypothesis/trade-offs only if we later add flags;
    // for now always take regenerated hypothesis/logic/tradeoffs.
    features: [...protectedFeatures, ...incoming],
  };
}

export function applyFeatureTextEdit(
  feature: MvpFeature,
  patch: Partial<Pick<MvpFeature, "name" | "description" | "rationale">>,
): MvpFeature {
  const next = { ...feature, ...patch };
  const changed =
    next.name !== feature.name ||
    next.description !== feature.description ||
    next.rationale !== feature.rationale;
  if (!changed) return feature;
  return { ...next, editedByUser: true };
}
