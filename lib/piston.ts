import { logger } from "@/lib/logger";

export class PistonConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PistonConfigurationError";
  }
}

export function getPistonBaseUrl(): string {
  const configured = process.env.PISTON_API_BASE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new PistonConfigurationError(
      "PISTON_API_BASE_URL is required in production. Use a self-hosted Piston service."
    );
  }

  return "http://localhost:2000";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchPiston(
  path: string,
  init: RequestInit & { timeoutMs?: number; retries?: number } = {}
): Promise<Response> {
  const { timeoutMs = 15000, retries = 1, ...requestInit } = init;
  const baseUrl = getPistonBaseUrl();
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...requestInit,
        headers: {
          "Content-Type": "application/json",
          ...(process.env.PISTON_API_KEY
            ? { Authorization: `Bearer ${process.env.PISTON_API_KEY}` }
            : {}),
          ...(requestInit.headers ?? {}),
        },
        signal: controller.signal,
      });

      if (response.ok || response.status < 500 || attempt === retries) {
        return response;
      }

      logger.warn("Piston retry scheduled", {
        status: response.status,
        attempt: attempt + 1,
      });
    } catch (error) {
      lastError = error;
      if (attempt === retries) throw error;
      logger.warn("Piston network retry scheduled", {
        attempt: attempt + 1,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    } finally {
      clearTimeout(timeoutId);
    }

    await sleep(300 * 2 ** attempt);
  }

  throw lastError;
}
