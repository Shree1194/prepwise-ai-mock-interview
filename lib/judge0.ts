import { logger } from "@/lib/logger";

const PUBLIC_JUDGE0_HOST = "ce.judge0.com";

function getJudge0Config() {
  const baseUrl = process.env.JUDGE0_API_BASE_URL?.replace(/\/$/, "");
  const apiKey = process.env.JUDGE0_API_KEY;
  if (!baseUrl || !apiKey) return null;

  try {
    const url = new URL(baseUrl);
    if (url.protocol !== "https:" || url.hostname.toLowerCase() === PUBLIC_JUDGE0_HOST) {
      return null;
    }
    return { baseUrl, apiKey };
  } catch {
    return null;
  }
}

export function isJudge0Configured() {
  return getJudge0Config() !== null;
}

// Judge0 CE language IDs (kept in sync with data/coding-problems/index.ts)
export const JUDGE0_LANGUAGE_IDS = {
  c:          103,  // C (GCC 14.1.0)
  cpp:        105,  // C++ (GCC 14.1.0)
  java:       91,   // Java (JDK 17.0.6)
  python:     100,  // Python (3.12.5)
  javascript: 102,  // JavaScript (Node.js 22.08.0)
} as const;

export type Judge0Language = keyof typeof JUDGE0_LANGUAGE_IDS;

export interface Judge0SubmissionRequest {
  enable_network?: boolean;
  max_processes_and_or_threads?: number;
  max_file_size?: number;
  language_id: number;
  source_code: string;
  stdin?: string;
  cpu_time_limit?: number;
  wall_time_limit?: number;
  memory_limit?: number;
}

export interface Judge0SubmissionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
  token: string;
  status: { id: number; description: string };
}

export const JUDGE0_STATUS: Record<number, string> = {
  1: "In Queue", 2: "Processing", 3: "Accepted",
  4: "Wrong Answer", 5: "Time Limit Exceeded",
  6: "Compilation Error", 7: "Runtime Error (SIGSEGV)",
  8: "Runtime Error (SIGXFSZ)", 9: "Runtime Error (SIGFPE)",
  10: "Runtime Error (SIGABRT)", 11: "Runtime Error (NZEC)",
  12: "Runtime Error (Other)", 13: "Internal Error", 14: "Exec Format Error",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function submitToJudge0(
  payload: Judge0SubmissionRequest,
  opts: { timeoutMs?: number; retries?: number } = {}
): Promise<Judge0SubmissionResult> {
  const { timeoutMs = 20000, retries = 1 } = opts;
  const config = getJudge0Config();
  if (!config) {
    throw new Error("A private HTTPS Judge0 endpoint and API key are required.");
  }
  const { baseUrl, apiKey } = config;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${baseUrl}/submissions?base64_encoded=false&wait=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "X-Auth-Token": apiKey } : {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        // 429 from Judge0 = quota exceeded — worth retrying
        if (res.status === 429 && attempt < retries) {
          logger.warn("Judge0 rate limited, retrying", { attempt: attempt + 1 });
          await sleep(500 * 2 ** attempt);
          continue;
        }
        throw new Error(`Judge0 error ${res.status}: ${text}`);
      }

      return (await res.json()) as Judge0SubmissionResult;
    } catch (error) {
      lastError = error;
      if (attempt === retries) throw error;
      logger.warn("Judge0 network retry", {
        attempt: attempt + 1,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      await sleep(300 * 2 ** attempt);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError;
}

export async function pingJudge0(timeoutMs = 5000): Promise<boolean> {
  const config = getJudge0Config();
  if (!config) return false;
  const { baseUrl, apiKey } = config;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl}/languages`, {
      method: "GET",
      headers: { "X-Auth-Token": apiKey },
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
