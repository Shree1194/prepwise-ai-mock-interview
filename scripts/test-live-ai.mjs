import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const MODEL = "gemini-3.8-flash";

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  console.error("Live Gemini smoke test requires GOOGLE_GENERATIVE_AI_API_KEY.");
  process.exit(1);
}

let catalogResponse;
try {
  catalogResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
    headers: { "x-goog-api-key": process.env.GOOGLE_GENERATIVE_AI_API_KEY },
    signal: AbortSignal.timeout(10_000),
  });
} catch (error) {
  console.error(JSON.stringify({
    success: false,
    step: "model-catalog",
    errorType: error instanceof Error ? error.name : "UnknownError",
  }));
  process.exit(1);
}

if (!catalogResponse.ok) {
  console.error(JSON.stringify({ success: false, step: "model-catalog", statusCode: catalogResponse.status }));
  process.exit(1);
}

const catalog = await catalogResponse.json();
const modelAvailable = catalog.models?.some(
  (model) => model.name === `models/${MODEL}` && model.supportedGenerationMethods?.includes("generateContent")
);
if (!modelAvailable) {
  console.error(JSON.stringify({ success: false, step: "model-catalog", modelAvailable: false }));
  process.exit(1);
}

let lastError;
let succeeded = false;
let attemptsUsed = 0;
for (let attempt = 1; attempt <= 2; attempt++) {
  attemptsUsed = attempt;
  try {
    const { output } = await generateText({
      model: google(MODEL),
      output: Output.object({ schema: z.object({ ok: z.boolean() }) }),
      prompt: "Return the object with ok set to true.",
      abortSignal: AbortSignal.timeout(15_000),
      maxRetries: 0,
      maxOutputTokens: 256,
    });

    if (output?.ok !== true) throw new Error("Unexpected structured output");
    succeeded = true;
    console.log(JSON.stringify({ success: true, provider: "Google Gemini", model: MODEL, attempts: attempt }));
    break;
  } catch (error) {
    lastError = error;
    const statusCode =
      typeof error === "object" && error && "statusCode" in error
        ? error.statusCode
        : undefined;
    if (attempt === 2 || ![408, 409, 425, 429, 500, 502, 503, 504].includes(statusCode)) break;
    await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
  }
}

if (!succeeded) {
  console.error(
    JSON.stringify({
      success: false,
      provider: "Google Gemini",
      model: MODEL,
      attempts: attemptsUsed,
      errorType: lastError instanceof Error ? lastError.name : "UnknownError",
      statusCode:
        typeof lastError === "object" && lastError && "statusCode" in lastError
          ? lastError.statusCode
          : undefined,
    })
  );
  process.exitCode = 1;
}
