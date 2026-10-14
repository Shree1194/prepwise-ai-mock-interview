import { NextResponse } from "next/server";
import { auth, db, storage } from "@/firebase/admin";
import { getConfiguredAIModels } from "@/ai/providers";
import { isJudge0Configured, pingJudge0 } from "@/lib/judge0";

type HealthCheck = { ok: boolean; detail?: string };

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function setCheck(
  checks: Record<string, HealthCheck>,
  name: string,
  ok: boolean,
  detail: string | undefined
) {
  checks[name] = {
    ok,
    ...(detail && { detail }),
  };
}

async function checkDependency(
  checks: Record<string, HealthCheck>,
  name: string,
  operation: () => Promise<unknown>
) {
  try {
    await withTimeout(operation(), 5000);
    setCheck(checks, name, true, "ok");
  } catch (error: any) {
    setCheck(checks, name, false, error?.message ?? "unavailable");
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const deep = url.searchParams.get("deep") === "1";

  // The default endpoint is a safe liveness probe. Dependency diagnostics
  // perform privileged Firebase reads and a Storage write/delete, so require
  // an internal secret in production before touching external services.
  if (!deep) {
    return NextResponse.json(
      { ok: true, service: "prepwise", checks: { app: { ok: true } } },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const internalSecret = process.env.INTERNAL_API_SECRET;
  if (
    process.env.NODE_ENV === "production" &&
    (!internalSecret || req.headers.get("x-prepwise-internal-secret") !== internalSecret)
  ) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const checks: Record<string, HealthCheck> = {};
  await Promise.all([
    checkDependency(checks, "firebaseAuth", async () => auth.listUsers(1)),
    checkDependency(checks, "firestore", async () => db.collection("_health").limit(1).get()),
    checkDependency(checks, "storage", async () => {
      const file = storage.bucket().file(`_health/health-${Date.now()}.txt`);
      try {
        await file.save("ok", { contentType: "text/plain" });
      } finally {
        await file.delete({ ignoreNotFound: true });
      }
    }),
    (async () => {
      if (process.env.CODE_EXECUTION_ENABLED !== "true") {
        setCheck(checks, "codeExecution", true, "disabled by configuration");
      } else if (!isJudge0Configured()) {
        setCheck(checks, "codeExecution", false, "private HTTPS endpoint and API key required");
      } else {
        await checkDependency(checks, "codeExecution", async () => {
          if (!(await pingJudge0(5000))) throw new Error("Configured Judge0 is unavailable");
        });
      }
    })(),
  ]);

  const configuredProviders = getConfiguredAIModels({ purpose: "question" }).map(
    ({ provider }) => provider
  );
  checks.aiProviders = {
    ok: configuredProviders.length > 0,
    detail: configuredProviders.join(", ") || "none configured",
  };

  const ok = Object.values(checks).every((check) => check.ok);
  return NextResponse.json(
    {
      ok,
      service: "prepwise",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
