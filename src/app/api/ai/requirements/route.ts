import { NextResponse } from "next/server";
import { z } from "zod";
import {
  MvpScopeSchema,
  ProductAnalysisSchema,
  ProjectInputSchema,
} from "@/ai/schemas";
import { AiConfigError } from "@/lib/ai/deepseek-client";
import {
  AiRequirementsError,
  runRequirementsGeneration,
} from "@/lib/ai/run-requirements";

export const runtime = "nodejs";

const RequirementsRequestSchema = z.object({
  input: ProjectInputSchema,
  analysis: ProductAnalysisSchema,
  analysisStatus: z.literal("confirmed"),
  mvpScope: MvpScopeSchema,
  mvpScopeStatus: z.literal("confirmed"),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "请求体 JSON 无效。",
        code: "invalid_json",
      },
      { status: 400 },
    );
  }

  const record =
    body && typeof body === "object"
      ? (body as {
          analysisStatus?: unknown;
          mvpScopeStatus?: unknown;
        })
      : null;

  // Explicit gates before any DeepSeek call.
  if (!record || record.analysisStatus !== "confirmed") {
    return NextResponse.json(
      {
        error: "生成需求前需已确认产品分析。",
        code: "analysis_not_confirmed",
      },
      { status: 403 },
    );
  }

  if (record.mvpScopeStatus !== "confirmed") {
    return NextResponse.json(
      {
        error: "生成需求前需已确认 MVP 范围。",
        code: "mvp_not_confirmed",
      },
      { status: 403 },
    );
  }

  const parsed = RequirementsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "生成需求前需已确认产品分析与 MVP 范围。",
        code: "invalid_input",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const requirements = await runRequirementsGeneration(
      parsed.data.input,
      parsed.data.analysis,
      parsed.data.mvpScope,
    );
    return NextResponse.json({ requirements });
  } catch (error) {
    if (error instanceof AiConfigError) {
      return NextResponse.json(
        {
          error:
            error.code === "missing_api_key"
              ? "AI 服务未配置。"
              : "未配置 DEEPSEEK_MODEL。",
          code: error.code,
        },
        { status: 503 },
      );
    }

    if (error instanceof AiRequirementsError) {
      const status =
        error.code === "parse_failed"
          ? 422
          : error.code === "analysis_not_confirmed" ||
              error.code === "mvp_not_confirmed"
            ? 403
            : 502;
      return NextResponse.json(
        {
          error: "无法生成需求。",
          code: error.code,
        },
        { status },
      );
    }

    console.error("[api/ai/requirements] unexpected error", error);
    return NextResponse.json(
      {
        error: "无法生成需求。",
        code: "unknown",
      },
      { status: 500 },
    );
  }
}
