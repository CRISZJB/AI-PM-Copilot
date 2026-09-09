/**
 * PRD v2 smoke tests (Phase 1–2).
 * No LLM. No API. Uses Sample mock workspace only.
 *
 * Run: npx tsx scripts/test-prd-v2.ts
 */

import { assemblePrd } from "../src/ai/prd/assemblePrd";
import { emptyPrdOverride } from "../src/ai/prd/empty-override";
import { mergePrd } from "../src/ai/prd/mergePrd";
import { PRD_OVERRIDE_VERSION } from "../src/ai/prd/override-types";
import type { PrdOverride } from "../src/ai/prd/override-types";
import { prdToMarkdown } from "../src/ai/prd/toMarkdown";
import {
  buildMockWorkspace,
  defaultProjectInput,
} from "../src/data/mock-project";
import {
  normalizeProjectKey,
  PRD_OVERRIDE_STORAGE_KEY,
} from "../src/lib/prd-override-store";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function testPhase1Assembly(): void {
  const workspace = buildMockWorkspace(defaultProjectInput);
  const prd = assemblePrd(workspace);

  assert(
    prd.constraints === defaultProjectInput.constraints,
    `constraints should project input.constraints; got: ${JSON.stringify(prd.constraints)}`,
  );
  assert(
    prd.constraints.trim().length > 0,
    "constraints should be non-empty for Sample input",
  );

  assert(
    Array.isArray(prd.prioritizationLogic),
    "prioritizationLogic must be an array",
  );
  assert(
    prd.prioritizationLogic.length > 0,
    "Sample MVP should provide prioritizationLogic",
  );
  assert(
    prd.prioritizationLogic.every((item) => typeof item === "string"),
    "prioritizationLogic items must be strings",
  );

  assert(Array.isArray(prd.tradeOffs), "tradeOffs must be an array");
  assert(prd.tradeOffs.length > 0, "Sample MVP should provide tradeOffs");
  assert(
    prd.tradeOffs.every((item) => typeof item === "string"),
    "tradeOffs items must be strings",
  );

  assert(
    prd.prioritizationLogic.length ===
      workspace.mvpScope.prioritizationLogic.length &&
      prd.prioritizationLogic.every(
        (item, i) => item === workspace.mvpScope.prioritizationLogic[i],
      ),
    "prioritizationLogic must match mvpScope.prioritizationLogic verbatim",
  );
  assert(
    prd.tradeOffs.length === workspace.mvpScope.tradeOffs.length &&
      prd.tradeOffs.every(
        (item, i) => item === workspace.mvpScope.tradeOffs[i],
      ),
    "tradeOffs must match mvpScope.tradeOffs verbatim",
  );

  assert(
    prd.productOverview.productName === defaultProjectInput.projectName,
    "productName should still assemble from input",
  );
  assert(prd.mvpScope.mustHave.length > 0, "Sample mustHave should be present");
  assert(Array.isArray(prd.risks), "risks must remain for existing UI");

  console.log("PASS — PRD v2 Phase 1 assembly fields");
  console.log(`  constraints: ${prd.constraints.slice(0, 48)}…`);
  console.log(`  prioritizationLogic: ${prd.prioritizationLogic.length} items`);
  console.log(`  tradeOffs: ${prd.tradeOffs.length} items`);
}

function testPhase2Merge(): void {
  const workspace = buildMockWorkspace(defaultProjectInput);
  const assembled = assemblePrd(workspace);
  const empty = emptyPrdOverride();

  assert(empty.version === PRD_OVERRIDE_VERSION, "empty override version");
  assert(empty.successMetrics === "", "empty successMetrics");
  assert(empty.validationPlan === "", "empty validationPlan");
  assert(empty.openDecisions === "", "empty openDecisions");
  assert(empty.pmNotes === "", "empty pmNotes");
  assert(typeof empty.updatedAt === "string", "empty updatedAt is string");

  const withEmpty = mergePrd(assembled, empty);
  assert(
    withEmpty.successMetrics === "" &&
      withEmpty.validationPlan === "" &&
      withEmpty.openDecisions === "" &&
      withEmpty.pmNotes === "",
    "empty override → empty PM fields on document",
  );
  assert(
    withEmpty.productOverview.productName ===
      assembled.productOverview.productName,
    "merge keeps assembled productName",
  );
  assert(
    withEmpty.constraints === assembled.constraints,
    "merge keeps assembled constraints",
  );
  assert(
    withEmpty.mvpScope.mustHave.length === assembled.mvpScope.mustHave.length,
    "merge keeps mustHave count",
  );
  assert(
    withEmpty.functionalRequirements.length ===
      assembled.functionalRequirements.length,
    "merge keeps requirements count",
  );

  const filled: PrdOverride = {
    version: PRD_OVERRIDE_VERSION,
    successMetrics: "一周内完成至少一次完整计划生成与审阅",
    validationPlan: "访谈 5 名大学生，观察是否采用生成计划",
    openDecisions: "是否在 V1 支持手动编辑单个学习块",
    pmNotes: "作品集演示备注",
    updatedAt: "2026-09-07T00:00:00.000Z",
  };

  const withFilled = mergePrd(assembled, filled);
  assert(
    withFilled.successMetrics === filled.successMetrics,
    "filled successMetrics appears on document",
  );
  assert(
    withFilled.validationPlan === filled.validationPlan,
    "filled validationPlan appears on document",
  );
  assert(
    withFilled.openDecisions === filled.openDecisions,
    "filled openDecisions appears on document",
  );
  assert(
    withFilled.pmNotes === filled.pmNotes,
    "filled pmNotes appears on document",
  );
  assert(
    withFilled.overrideUpdatedAt === filled.updatedAt,
    "overrideUpdatedAt mirrors override.updatedAt",
  );

  // Assembled source must not be mutated by merge or later doc edits
  const nameBefore = assembled.productOverview.productName;
  withFilled.productOverview.productName = "MUTATED";
  withFilled.tradeOffs.push("should-not-affect-assembled");
  assert(
    assembled.productOverview.productName === nameBefore,
    "mutating merged document must not change assembled productName",
  );
  assert(
    !assembled.tradeOffs.includes("should-not-affect-assembled"),
    "mutating merged tradeOffs must not change assembled.tradeOffs",
  );

  // Override cannot clobber upstream: only PM keys are taken from override
  assert(
    withFilled.productHypothesis === assembled.productHypothesis,
    "productHypothesis stays from assembled, not override",
  );

  console.log("PASS — PRD v2 Phase 2 emptyPrdOverride + mergePrd");
  console.log(`  empty PM fields: ok`);
  console.log(`  filled PM fields: ok`);
  console.log(`  assembled immutability: ok`);
}

function testPhase3Markdown(): void {
  const workspace = buildMockWorkspace(defaultProjectInput);
  const assembled = assemblePrd(workspace);

  const filled: PrdOverride = {
    version: PRD_OVERRIDE_VERSION,
    successMetrics: "一周内完成至少一次完整计划生成与审阅",
    validationPlan: "访谈 5 名大学生，观察是否采用生成计划",
    openDecisions: "是否在 V1 支持手动编辑单个学习块",
    pmNotes: "作品集演示备注",
    updatedAt: "2026-09-07T00:00:00.000Z",
  };

  const doc = mergePrd(assembled, filled);
  const md = prdToMarkdown(doc);

  const requiredHeadings = [
    "## 产品概述",
    "## 用户问题",
    "## 产品目标",
    "## MVP 范围",
    "## 功能需求",
    "## 决策依据",
    "## 风险与限制",
    "## PM 补充",
  ];
  for (const heading of requiredHeadings) {
    assert(md.includes(heading), `Markdown missing heading: ${heading}`);
  }

  assert(
    md.includes(defaultProjectInput.projectName),
    "Markdown should include product name",
  );
  assert(
    assembled.mvpScope.mustHave.length > 0,
    "Sample mustHave required for markdown assertion",
  );
  assert(
    md.includes(assembled.mvpScope.mustHave[0]!.name),
    "Markdown should include at least one mustHave feature name",
  );

  assert(
    doc.functionalRequirements.length > 0,
    "Sample should have functional requirements",
  );
  for (const requirement of doc.functionalRequirements) {
    assert(
      md.includes(requirement.featureName),
      `Markdown missing requirement feature: ${requirement.featureName}`,
    );
    for (const criterion of requirement.acceptanceCriteria) {
      assert(
        md.includes(criterion.given),
        `Markdown missing full AC Given (UI truncation forbidden): ${criterion.given.slice(0, 40)}…`,
      );
    }
    for (const behavior of requirement.systemBehavior) {
      assert(
        md.includes(behavior),
        `Markdown missing full systemBehavior: ${behavior.slice(0, 40)}…`,
      );
    }
  }

  assert(md.includes("## PM 补充"), "PM supplement section required");
  assert(md.includes("成功标准"), "PM successMetrics label required");
  assert(
    md.includes(filled.successMetrics),
    "Markdown should include filled successMetrics",
  );
  assert(
    md.includes(filled.validationPlan),
    "Markdown should include filled validationPlan",
  );
  assert(
    md.includes(filled.openDecisions),
    "Markdown should include filled openDecisions",
  );
  assert(md.includes(filled.pmNotes), "Markdown should include filled pmNotes");

  const emptyDoc = mergePrd(assembled, emptyPrdOverride());
  const emptyMd = prdToMarkdown(emptyDoc);
  assert(
    emptyMd.includes("（未填写）"),
    "empty PM fields should render as （未填写）",
  );

  console.log("PASS — PRD v2 Phase 3 prdToMarkdown");
  console.log(`  headings: ${requiredHeadings.length} ok`);
  console.log(
    `  requirements: ${doc.functionalRequirements.length} full (all AC + behaviors)`,
  );
  console.log(`  markdown length: ${md.length} chars`);
}

function testPhase4StoreKeysAndExportPipeline(): void {
  assert(
    normalizeProjectKey("AI 学习规划助手") ===
      normalizeProjectKey("  AI 学习规划助手  "),
    "normalizeProjectKey should trim",
  );
  assert(
    normalizeProjectKey("Sample A") !== normalizeProjectKey("Sample B"),
    "different project names must not share keys",
  );
  assert(
    normalizeProjectKey("Live Project") !==
      normalizeProjectKey("AI 学习规划助手"),
    "Live vs Sample names must isolate",
  );
  assert(
    PRD_OVERRIDE_STORAGE_KEY !== ("ai-pm-copilot-workspace" as string),
    "override storage key must not equal workspace key",
  );

  const workspace = buildMockWorkspace(defaultProjectInput);
  const override: PrdOverride = {
    version: PRD_OVERRIDE_VERSION,
    successMetrics: "pipeline-metric",
    validationPlan: "pipeline-plan",
    openDecisions: "pipeline-decision",
    pmNotes: "pipeline-note",
    updatedAt: "2026-09-07T12:00:00.000Z",
  };
  const md = prdToMarkdown(mergePrd(assemblePrd(workspace), override));
  assert(md.includes("pipeline-metric"), "export pipeline includes override");
  assert(
    md.includes(defaultProjectInput.projectName),
    "export pipeline includes assembled name",
  );

  console.log("PASS — PRD v2 Phase 4 store keys + export pipeline");
  console.log(`  storage key: ${PRD_OVERRIDE_STORAGE_KEY}`);
}

function main() {
  testPhase1Assembly();
  testPhase2Merge();
  testPhase3Markdown();
  testPhase4StoreKeysAndExportPipeline();
}

main();
