import { z } from "zod";
import type {
  MvpScope,
  ProductAnalysis,
  ProjectInput,
  Requirement,
} from "@/ai/types";
import { RequirementsOutputSchema } from "@/ai/schemas";
import {
  REQUIREMENTS_SYSTEM_PROMPT,
  buildRequirementsUserPrompt,
} from "@/lib/ai/prompts/requirements";
import {
  AiConfigError,
  getDeepSeekClient,
  getDeepSeekModel,
} from "@/lib/ai/deepseek-client";
import { extractJsonObject } from "@/lib/ai/extract-json";

export class AiRequirementsError extends Error {
  readonly code:
    | "request_failed"
    | "parse_failed"
    | "empty_output"
    | "analysis_not_confirmed"
    | "mvp_not_confirmed";

  constructor(
    code:
      | "request_failed"
      | "parse_failed"
      | "empty_output"
      | "analysis_not_confirmed"
      | "mvp_not_confirmed",
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "AiRequirementsError";
    this.code = code;
  }
}

export type { AiConfigError };

function buildJsonSchemaInstruction(): string {
  const schema = z.toJSONSchema(RequirementsOutputSchema);
  return [
    "Return a single JSON object that matches this JSON Schema exactly.",
    "Do not wrap the JSON in Markdown fences.",
    "Do not include commentary outside the JSON object.",
    JSON.stringify(schema),
  ].join("\n\n");
}

/**
 * Live Requirements Generation via DeepSeek.
 * Caller must only invoke with confirmed Analysis + confirmed MVP Scope.
 */
export async function runRequirementsGeneration(
  input: ProjectInput,
  confirmedAnalysis: ProductAnalysis,
  confirmedMvp: MvpScope,
): Promise<Requirement[]> {
  const client = getDeepSeekClient();
  const model = getDeepSeekModel();

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `${REQUIREMENTS_SYSTEM_PROMPT}\n\n${buildJsonSchemaInstruction()}`,
        },
        {
          role: "user",
          content: buildRequirementsUserPrompt(
            input,
            confirmedAnalysis,
            confirmedMvp,
          ),
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new AiRequirementsError(
        "empty_output",
        "Structured output was empty.",
      );
    }

    let json: unknown;
    try {
      json = extractJsonObject(content);
    } catch (error) {
      console.error("[requirements] JSON parse failed", error);
      throw new AiRequirementsError(
        "parse_failed",
        "Structured output could not be validated.",
        { cause: error },
      );
    }

    const validated = RequirementsOutputSchema.safeParse(json);
    if (!validated.success) {
      console.error(
        "[requirements] schema validation failed",
        validated.error.flatten(),
      );
      throw new AiRequirementsError(
        "parse_failed",
        "Structured output could not be validated.",
      );
    }

    return validated.data.requirements.map((requirement) => ({
      id: requirement.id,
      featureName: requirement.featureName,
      priority: requirement.priority,
      userStory: requirement.userStory,
      requiredInputs: requirement.requiredInputs,
      optionalInputs: requirement.optionalInputs,
      userActions: requirement.userActions,
      systemBehavior: requirement.systemBehavior,
      acceptanceCriteria: requirement.acceptanceCriteria,
      missingInformation: requirement.missingInformation,
      edgeCases: requirement.edgeCases,
    }));
  } catch (error) {
    if (error instanceof AiConfigError || error instanceof AiRequirementsError) {
      throw error;
    }

    console.error("[requirements] DeepSeek request failed", error);
    throw new AiRequirementsError(
      "request_failed",
      "We couldn't generate requirements.",
      { cause: error },
    );
  }
}
