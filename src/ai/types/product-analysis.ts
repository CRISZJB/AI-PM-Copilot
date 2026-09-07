import type { EvidenceField } from "./evidence";

/**
 * Stage 1 — Product Analysis (AI proposes, PM confirms).
 */

export interface TargetUserAnalysis {
  segment: EvidenceField;
  ageRange: EvidenceField;
  goals: EvidenceField[];
  behaviors: EvidenceField[];
}

export interface ProductAnalysis {
  targetUser: TargetUserAnalysis;
  coreProblem: EvidenceField;
  painPoints: EvidenceField[];
  coreScenarios: EvidenceField[];
  productPositioning: EvidenceField;
  assumptions: EvidenceField[];
  openQuestions: EvidenceField[];
}
