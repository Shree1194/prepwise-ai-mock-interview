import { getCurrentUser } from "@/lib/actions/auth.action";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isJudge0Configured, JUDGE0_LANGUAGE_IDS, JUDGE0_STATUS, submitToJudge0, type Judge0Language } from "@/lib/judge0";
import { rateLimit } from "@/lib/rateLimit";
import { enforceSameOrigin } from "@/lib/security";

const TIMEOUT_MS = 20000;

const executeSchema = z.object({
  language: z.enum(["c", "cpp", "java", "python", "javascript"]),
  code: z.string().max(50000),
  stdin: z.string().max(10000).optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to continue" }, { status: 401 });
    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const limiter = rateLimit(req, {
      keyPrefix: user.id + ":coding-execute",
      subject: user.id,
      limit: 30,
      windowMs: 60 * 1000,
    });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many requests", retryAfter: limiter.retryAfter },
        {
          status: 429,
          headers: { "Retry-After": String(limiter.retryAfter) },
        }
      );
    }

    if (process.env.CODE_EXECUTION_ENABLED !== "true" || !isJudge0Configured()) {
      return NextResponse.json({ error: "Code execution is unavailable until a private sandbox endpoint and authentication have been verified. You can still edit and review your solution." }, { status: 503 });
    }
    const body = await req.json();
    const { language, code, stdin } = executeSchema.parse(body);

    const languageId = JUDGE0_LANGUAGE_IDS[language as Judge0Language];

    const result = await submitToJudge0(
      {
        language_id: languageId,
        source_code: code,
        stdin,
        cpu_time_limit: 5,
        wall_time_limit: 10,
        memory_limit: 128000,
        enable_network: false,
        max_processes_and_or_threads: 16,
        max_file_size: 1024,
      },
      { timeoutMs: TIMEOUT_MS, retries: 1 }
    );

    const statusId: number = result.status?.id ?? 0;
    const statusDesc: string = result.status?.description ?? JUDGE0_STATUS[statusId] ?? "Unknown";
    const isCompileError = statusId === 6;
    const isRuntimeError = statusId >= 7 && statusId <= 12;
    const exitCode = statusId === 3 ? 0 : 1;

    return NextResponse.json({
      stdout: result.stdout ?? "",
      stderr: isRuntimeError ? (result.stderr ?? result.message ?? "") : "",
      exitCode,
      compilationError: isCompileError
        ? (result.compile_output ?? result.stderr ?? "Compilation failed")
        : null,
      executionTime: result.time ? Math.round(parseFloat(result.time) * 1000) : null,
      status: statusDesc,
      memoryUsed: result.memory ?? null,
    });
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json({ error: "Execution timed out (20s)" }, { status: 408 });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request", detail: error.errors }, { status: 400 });
    }
    console.error("[PrepWise] Code execute error:", error?.message);
    return NextResponse.json(
      {
        error: "Execution failed",
        ...(process.env.NODE_ENV !== "production" && { detail: error?.message }),
      },
      { status: 500 }
    );
  }
}
