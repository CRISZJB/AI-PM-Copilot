import { z } from "zod";
import type { ProductAnalysis, ProjectInput } from "@/ai/types";
import { ProductAnalysisSchema } from "@/ai/schemas";
import {
  PRODUCT_ANALYSIS_SYSTEM_PROMPT,
  buildProductAnalysisUserPrompt,
} from "@/lib/ai/prompts/product-analysis";
import {
  AiConfigError,
  getDeepSeekClient,
  getDeepSeekModel,
} from "@/lib/ai/deepseek-client";

export class AiAnalysisError extends Error {
  readonly code: "request_failed" | "parse_failed" | "empty_output";

  constructor(
    code: "request_failed" | "parse_failed" | "empty_output",
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "AiAnalysisError";
    this.code = code;
  }
}

export type { AiConfigError };

function buildJsonSchemaInstruction(): string {
  // Zod 4 JSON Schema — included in the prompt so json_object mode stays schema-aligned.
  const schema = z.toJSONSchema(ProductAnalysisSchema);
  return [
    "Return a single JSON object that matches this JSON Schema exactly.",
    "Do not wrap the JSON in Markdown fences.",
    "Do not include commentary outside the JSON object.",
    JSON.stringify(schema),
  ].join("\n\n");
}

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Some models still wrap JSON despite instructions — peel a fenced block only.
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      return JSON.parse(fenced[1].trim());
    }
    throw new AiAnalysisError(
      "parse_failed",
      "Structured output could not be validated.",
    );
  }
}

/**
 * Live Product Analysis via DeepSeek (OpenAI-compatible Chat Completions + JSON Output).
 * Final ProductAnalysis shape is unchanged and always Zod-validated before return.
 */
export async function runProductAnalysis(
  input: ProjectInput,
): Promise<ProductAnalysis> {
  const client = getDeepSeekClient();
  const model = getDeepSeekModel();

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `${PRODUCT_ANALYSIS_SYSTEM_PROMPT}\n\n${buildJsonSchemaInstruction()}`,
        },
        {
          role: "user",
          content: buildProductAnalysisUserPrompt(input),
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new AiAnalysisError(
        "empty_output",
        "Structured output was empty.",
      );
    }

    let json: unknown;
    try {
      json = extractJsonObject(content);
    } catch (error) {
      if (error instanceof AiAnalysisError) throw error;
      console.error("[product-analysis] JSON parse failed", error);
      throw new AiAnalysisError(
        "parse_failed",
        "Structured output could not be validated.",
        { cause: error },
      );
    }

    const validated = ProductAnalysisSchema.safeParse(json);
    if (!validated.success) {
      console.error(
        "[product-analysis] schema validation failed",
        validated.error.flatten(),
      );
      throw new AiAnalysisError(
        "parse_failed",
        "Structured output could not be validated.",
      );
    }

    return validated.data;
  } catch (error) {
    if (error instanceof AiConfigError || error instanceof AiAnalysisError) {
      throw error;
    }

    console.error("[product-analysis] DeepSeek request failed", error);
    throw new AiAnalysisError(
      "request_failed",
      "We couldn't analyze this product idea.",
      { cause: error },
    );
  }
}
