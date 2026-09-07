import OpenAI from "openai";

export class AiConfigError extends Error {
  readonly code: "missing_api_key" | "missing_model";

  constructor(code: "missing_api_key" | "missing_model", message: string) {
    super(message);
    this.name = "AiConfigError";
    this.code = code;
  }
}

const DEFAULT_DEEPSEEK_BASE_URL = "https://api.deepseek.com";

export function getDeepSeekModel(): string {
  const model = process.env.DEEPSEEK_MODEL?.trim();
  if (!model) {
    throw new AiConfigError(
      "missing_model",
      "DEEPSEEK_MODEL is not configured.",
    );
  }
  return model;
}

export function getDeepSeekBaseUrl(): string {
  return process.env.DEEPSEEK_BASE_URL?.trim() || DEFAULT_DEEPSEEK_BASE_URL;
}

/**
 * DeepSeek is OpenAI-API compatible. We reuse the openai SDK with a custom baseURL.
 * Server-side only — never import this into client components.
 */
export function getDeepSeekClient(): OpenAI {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    throw new AiConfigError(
      "missing_api_key",
      "AI service is not configured.",
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: getDeepSeekBaseUrl(),
  });
}
