import type { Priority } from "./mvp-scope";

/**
 * Stage 3 — Requirements (AI proposes for confirmed P0 features, PM edits).
 */

export interface UserStory {
  asA: string;
  iWant: string;
  soThat: string;
}

export interface AcceptanceCriterion {
  given: string;
  when: string;
  then: string;
  and?: string[];
}

export interface RequirementEdgeCase {
  title: string;
  description: string;
  actions?: string[];
}

export interface MissingInformationHandling {
  principle: string;
  systemShould: string[];
}

export interface Requirement {
  id: string;
  featureName: string;
  priority: Priority;
  userStory: UserStory;
  requiredInputs?: string[];
  optionalInputs?: string[];
  userActions?: string[];
  systemBehavior: string[];
  acceptanceCriteria: AcceptanceCriterion[];
  missingInformation?: MissingInformationHandling;
  edgeCases: RequirementEdgeCase[];
}
