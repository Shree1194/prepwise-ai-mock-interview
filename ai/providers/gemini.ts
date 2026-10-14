import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export type GeminiModelId = "gemini-3.8-flash";

export interface GeminiProviderOptions {
  model?: GeminiModelId;
}

/**
 * Returns a Gemini LanguageModel instance.
 * Default model: Gemini 3.8 Flash (stable, structured-output capable).
 */
export function getGeminiModel(options: GeminiProviderOptions = {}): LanguageModel {
  const { model = "gemini-3.8-flash" } = options;
  return google(model) as LanguageModel;
}

export const GEMINI_DEFAULTS = {
  feedbackModel: "gemini-3.8-flash" as GeminiModelId,
  questionModel: "gemini-3.8-flash" as GeminiModelId,
  resumeModel: "gemini-3.8-flash" as GeminiModelId,
  coachModel: "gemini-3.8-flash" as GeminiModelId,
} as const;
