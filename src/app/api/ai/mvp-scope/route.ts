import { NextResponse } from "next/server";
import { z } from "zod";
import { ProductAnalysisSchema, ProjectInputSchema } from "@/ai/schemas";
import { AiConfigError } from "@/lib/ai/deepseek-client";
import {
  AiMvpError,
  runMvpPrioritization,
} from "@/lib/ai/run-mvp-prioritization";

export const runtime = "nodejs";

const MvpScopeRequestSchema = z.object({
  input: ProjectInputSchema,
  analysis: ProductAnalysisSchema,
  analysisStatus: z.literal("confirmed"),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON body.",
        code: "invalid_json",
      },
      { status: 400 },
    );
  }

  // Explicit gate before any DeepSeek call — status must be confirmed.
  if (
    !body ||
    typeof body !== "object" ||
    (body as { analysisStatus?: unknown }).analysisStatus !== "confirmed"
  ) {
    return NextResponse.json(
      {
        error:
          "Confirmed Product Analysis is required before MVP prioritization.",
        code: "analysis_not_confirmed",
      },
      { status: 403 },
    );
  }

  const parsed = MvpScopeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "Confirmed Product Analysis is required before MVP prioritization.",
        code: "invalid_input",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const mvpScope = await runMvpPrioritization(
      parsed.data.input,
      parsed.data.analysis,
    );
    return NextResponse.json({ mvpScope });
  } catch (error) {
    if (error instanceof AiConfigError) {
      return NextResponse.json(
        {
          error:
            error.code === "missing_api_key"
              ? "AI service is not configured."
              : "DEEPSEEK_MODEL is not configured.",
          code: error.code,
        },
        { status: 503 },
      );
    }

    if (error instanceof AiMvpError) {
      const status =
        error.code === "parse_failed"
          ? 422
          : error.code === "analysis_not_confirmed"
            ? 403
            : 502;
      return NextResponse.json(
        {
          error: "We couldn't prioritize this MVP scope.",
          code: error.code,
        },
        { status },
      );
    }

    console.error("[api/ai/mvp-scope] unexpected error", error);
    return NextResponse.json(
      {
        error: "We couldn't prioritize this MVP scope.",
        code: "unknown",
      },
      { status: 500 },
    );
  }
}
