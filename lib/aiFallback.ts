import {
  generateText,
  Output,
  type LanguageModel,
} from "ai";
import type { z } from "zod";
import {
  getConfiguredAIModels,
  type AIModelPurpose,
  type AIProvider,
} from "@/ai/providers";
import { logger } from "@/lib/logger";

type ProviderAttempt = {
  provider: AIProvider;
  model: LanguageModel;
};

const AI_REQUEST_TIMEOUT_MS = 20_000;
// Leave headroom below Vercel's configured 60-second function ceiling for
// provider fallback, database persistence, and response serialization.
const AI_OPERATION_TIMEOUT_MS = 45_000;

type GenerateObjectWithFallbackArgs<TSchema extends z.ZodTypeAny> = {
  purpose: AIModelPurpose;
  schema: TSchema;
  system?: string;
  prompt: string;
};

type GenerateTextWithFallbackArgs = {
  purpose: AIModelPurpose;
  system?: string;
  prompt: string;
};

export class AIProviderUnavailableError extends Error {
  constructor(message = "AI service is temporarily unavailable. Please try again shortly.") {
    super(message);
    this.name = "AIProviderUnavailableError";
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableAIError(error: any): boolean {
  const status = error?.statusCode ?? error?.status ?? error?.response?.status;
  const message = String(error?.message ?? error ?? "").toLowerCase();

  return (
    status === 408 ||
    status === 409 ||
    status === 425 ||
    status === 429 ||
    (typeof status === "number" && status >= 500) ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("overloaded") ||
    message.includes("temporarily unavailable") ||
    message.includes("timeout")
  );
}

function isQuotaError(error: any): boolean {
  const status = error?.statusCode ?? error?.status ?? error?.response?.status;
  const message = String(error?.message ?? error ?? "").toLowerCase();
  return status === 429 || message.includes("quota") || message.includes("resource_exhausted");
}

async function runWithRetries<T>(
  provider: AIProvider,
  action: (timeoutMs: number) => Promise<T>,
  deadline: number,
  maxAttempts = 2,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) throw new Error("AI operation timeout");
      return await action(Math.min(AI_REQUEST_TIMEOUT_MS, remainingMs));
    } catch (error: any) {
      lastError = error;
      if (!isRetryableAIError(error) || attempt === maxAttempts) break;

      const delayMs = Math.min(2000, 300 * 2 ** (attempt - 1));
      logger.warn("AI provider retry scheduled", {
        provider,
        attempt,
        delayMs,
        errorType: error?.name ?? "ProviderError",
      });
      if (deadline - Date.now() <= delayMs) break;
      await sleep(delayMs);
    }
  }

  throw lastError;
}

async function runWithProviderFallback<T>(
  purpose: AIModelPurpose,
  executor: (attempt: ProviderAttempt, timeoutMs: number) => Promise<T>
): Promise<T> {
  const attempts = getConfiguredAIModels({ purpose });
  const deadline = Date.now() + AI_OPERATION_TIMEOUT_MS;
  let lastError: unknown;

  if (attempts.length === 0) {
    throw new AIProviderUnavailableError(
      "No AI providers are configured for this environment."
    );
  }

  for (const attempt of attempts) {
    if (deadline <= Date.now()) break;
    try {
      const result = await runWithRetries(
        attempt.provider,
        (timeoutMs) => executor(attempt, timeoutMs),
        deadline
      );
      logger.info("AI provider succeeded", {
        provider: attempt.provider,
        purpose,
      });
      return result;
    } catch (error: any) {
      lastError = error;
      logger.warn("AI provider failed; trying next provider", {
        provider: attempt.provider,
        purpose,
        errorType: error?.name ?? "ProviderError",
      });
    }
  }

  logger.error("All AI providers failed");
  const isQuota = isQuotaError(lastError);
  throw new AIProviderUnavailableError(
    isQuota
      ? "AI provider quota is exhausted. Please try again later."
      : "AI service is temporarily unavailable. Please try again shortly."
  );
}

export async function generateObjectWithFallback<TSchema extends z.ZodTypeAny>(
  args: GenerateObjectWithFallbackArgs<TSchema>
): Promise<{ object: z.infer<TSchema> }> {
  const { purpose, schema, system, prompt } = args;
  return runWithProviderFallback(purpose, async ({ model }, timeoutMs) => {
    const { output } = await generateText({
      model,
      output: Output.object({ schema }),
      ...(system && { system }),
      prompt,
      abortSignal: AbortSignal.timeout(timeoutMs),
      maxRetries: 0,
    });
    if (!output) throw new Error("AI provider returned no structured output");
    return { object: output };
  });
}

export async function generateTextWithFallback(args: GenerateTextWithFallbackArgs) {
  const { purpose, ...rest } = args;
  return runWithProviderFallback(purpose, ({ model }, timeoutMs) =>
    generateText({ ...rest, model, abortSignal: AbortSignal.timeout(timeoutMs), maxRetries: 0 } as Parameters<typeof generateText>[0])
  );
}
