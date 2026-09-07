/**
 * Live Product Analysis smoke tests.
 *
 * 1. Copy .env.example → .env.local and fill DEEPSEEK_API_KEY + DEEPSEEK_MODEL
 * 2. Run: npm run test:analysis
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ProjectInputSchema, ProductAnalysisSchema } from "../src/ai/schemas";
import { runProductAnalysis } from "../src/lib/ai/run-product-analysis";
import type { ProjectInput } from "../src/ai/types";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    console.error(
      "Missing .env.local. Copy .env.example to .env.local and set DEEPSEEK_API_KEY + DEEPSEEK_MODEL.",
    );
    process.exit(1);
  }

  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const cases: { name: string; input: ProjectInput }[] = [
  {
    name: "CASE 1 — AI Study Planner",
    input: {
      projectName: "AI Study Planner",
      productIdea:
        "An AI product that helps university students generate study plans from course deadlines and free time.",
      targetUser: "University students",
      problem:
        "Students struggle to turn course deadlines and available free time into a workable study plan.",
      businessGoal:
        "Help students create structured study plans they can actually follow.",
      constraints:
        "Keep the MVP focused on planning, not tutoring or a full learning platform.",
    },
  },
  {
    name: "CASE 2 — Elder scam-call assistant",
    input: {
      projectName: "CallGuard Elder",
      productIdea:
        "An AI assistant that helps older adults living alone identify scam phone calls.",
      targetUser: "Older adults living alone",
      problem:
        "Solo older adults find it hard to tell legitimate calls from scam calls in the moment.",
      businessGoal:
        "Reduce successful phone scams by helping users assess suspicious calls more safely.",
      constraints:
        "MVP should stay assistive and cautious — not a full banking or legal advisory product.",
    },
  },
  {
    name: "CASE 3 — Restaurant prep forecasting",
    input: {
      projectName: "PrepForecast",
      productIdea:
        "An AI tool that helps small restaurants forecast next-day prep volume from historical orders.",
      targetUser: "Owners and kitchen leads at small restaurants",
      problem:
        "Small restaurants often over-prep or under-prep because next-day demand is guessed from memory.",
      businessGoal:
        "Improve prep planning accuracy using historical order patterns.",
      constraints:
        "MVP should focus on next-day prep forecasts, not full inventory ERP or supplier procurement.",
    },
  },
];

function assertNoInventedPersonaName(text: string) {
  const suspicious = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/;
  if (suspicious.test(text)) {
    throw new Error(`Possible invented persona name detected: "${text}"`);
  }
}

async function runCase(name: string, input: ProjectInput) {
  console.log(`\n=== ${name} ===`);
  ProjectInputSchema.parse(input);

  const analysis = await runProductAnalysis(input);
  ProductAnalysisSchema.parse(analysis);

  assertNoInventedPersonaName(analysis.targetUser.segment.value);
  assertNoInventedPersonaName(analysis.targetUser.ageRange.value);

  console.log("Target user segment:", analysis.targetUser.segment.value);
  console.log("Age range:", analysis.targetUser.ageRange.value);
  console.log("Core problem:", analysis.coreProblem.value);
  console.log(
    "Assumptions:",
    analysis.assumptions.map((item) => item.value),
  );
  console.log(
    "Open questions:",
    analysis.openQuestions.map((item) => item.value),
  );
  console.log("PASS");
}

async function main() {
  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    console.error("DEEPSEEK_API_KEY is empty in .env.local");
    process.exit(1);
  }
  if (!process.env.DEEPSEEK_MODEL?.trim()) {
    console.error("DEEPSEEK_MODEL is empty in .env.local");
    process.exit(1);
  }

  for (const testCase of cases) {
    await runCase(testCase.name, testCase.input);
  }
  console.log("\nAll cases completed.");
}

main().catch((error) => {
  console.error("\nTEST FAILED");
  console.error(error);
  process.exit(1);
});
