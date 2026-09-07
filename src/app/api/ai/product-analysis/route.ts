import { NextResponse } from "next/server";
import { ProjectInputSchema } from "@/ai/schemas";
import { AiConfigError } from "@/lib/ai/deepseek-client";
import {
  AiAnalysisError,
  runProductAnalysis,
} from "@/lib/ai/run-product-analysis";

export const runtime = "nodejs";

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

  const parsedInput = ProjectInputSchema.safeParse(body);
  if (!parsedInput.success) {
    return NextResponse.json(
      {
        error: "Invalid ProjectInput.",
        code: "invalid_input",
        details: parsedInput.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const analysis = await runProductAnalysis(parsedInput.data);
    return NextResponse.json({ analysis });
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

    if (error instanceof AiAnalysisError) {
      const status = error.code === "parse_failed" ? 422 : 502;
      return NextResponse.json(
        {
          error: "We couldn't analyze this product idea.",
          code: error.code,
        },
        { status },
      );
    }

    console.error("[api/ai/product-analysis] unexpected error", error);
    return NextResponse.json(
      {
        error: "We couldn't analyze this product idea.",
        code: "unknown",
      },
      { status: 500 },
    );
  }
}
