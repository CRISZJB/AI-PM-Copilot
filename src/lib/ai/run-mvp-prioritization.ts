import { z } from "zod";
import type { MvpScope, ProductAnalysis, ProjectInput } from "@/ai/types";
import { MvpScopeSchema } from "@/ai/schemas";
import {
  MVP_PRIORITIZATION_SYSTEM_PROMPT,
  buildMvpPrioritizationUserPrompt,
} from "@/lib/ai/prompts/mvp-prioritization";
import {
  AiConfigError,
  getDeepSeekClient,
  getDeepSeekModel,
} from "@/lib/ai/deepseek-client";
import { extractJsonObject } from "@/lib/ai/extract-json";

export class AiMvpError extends Error {
  readonly code:
    | "request_failed"
    | "parse_failed"
    | "empty_output"
    | "analysis_not_confirmed";

  constructor(
    code:
      | "request_failed"
      | "parse_failed"
      | "empty_output"
      | "analysis_not_confirmed",
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "AiMvpError";
    this.code = code;
  }
}

export type { AiConfigError };

function buildJsonSchemaInstruction(): string {
  const schema = z.toJSONSchema(MvpScopeSchema);
  return [
    "Return a single JSON object that matches this JSON Schema exactly.",
    "Do not wrap the JSON in Markdown fences.",
    "Do not include commentary outside the JSON object.",
    JSON.stringify(schema),
  ].join("\n\n");
}

/**
 * Live MVP Prioritization via DeepSeek.
 * Caller must only invoke with confirmed Product Analysis.
 */
export async function runMvpPrioritization(
  input: ProjectInput,
  confirmedAnalysis: ProductAnalysis,
): Promise<MvpScope> {
  const client = getDeepSeekClient();
  const model = getDeepSeekModel();

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `${MVP_PRIORITIZATION_SYSTEM_PROMPT}\n\n${buildJsonSchemaInstruction()}`,
        },
        {
          role: "user",
          content: buildMvpPrioritizationUserPrompt(input, confirmedAnalysis),
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new AiMvpError("empty_output", "Structured output was empty.");
    }

    let json: unknown;
    try {
      json = extractJsonObject(content);
    } catch (error) {
      console.error("[mvp-scope] JSON parse failed", error);
      throw new AiMvpError(
        "parse_failed",
        "Structured output could not be validated.",
        { cause: error },
      );
    }

    const validated = MvpScopeSchema.safeParse(json);
    if (!validated.success) {
      console.error("[mvp-scope] schema validation failed", validated.error.flatten());
      throw new AiMvpError(
        "parse_failed",
        "Structured output could not be validated.",
      );
    }

    // Strip any accidental LLM edit flags — app owns those.
    return {
      ...validated.data,
      features: validated.data.features.map((feature) => ({
        id: feature.id,
        name: feature.name,
        description: feature.description,
        priority: feature.priority,
        category: feature.category,
        rationale: feature.rationale,
        prioritizationBasis: feature.prioritizationBasis,
      })),
    };
  } catch (error) {
    if (error instanceof AiConfigError || error instanceof AiMvpError) {
      throw error;
    }

    console.error("[mvp-scope] DeepSeek request failed", error);
    throw new AiMvpError(
      "request_failed",
      "We couldn't prioritize this MVP scope.",
      { cause: error },
    );
  }
}
