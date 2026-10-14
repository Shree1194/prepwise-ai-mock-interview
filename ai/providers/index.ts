import type { LanguageModel } from "ai";
import {
  getGeminiModel,
  GEMINI_DEFAULTS,
  type GeminiModelId,
} from "./gemini";
import { getOpenAIModel, type OpenAIModelId } from "./openai";
import { getAnthropicModel, type AnthropicModelId } from "./anthropic";

export type AIProvider = "gemini" | "openai" | "claude" | "ollama";

export type AIModelPurpose =
  | "feedback"
  | "question"
  | "resume"
  | "coach"
  | "coding";

export interface AIProviderConfig {
  provider?: AIProvider;
  model?: string;
  purpose?: AIModelPurpose;
}

export interface ConfiguredAIModel {
  provider: AIProvider;
  model: LanguageModel;
}

/**
 * Central AI provider factory.
 *
 * Usage:
 *   const model = getAIModel({ purpose: "feedback" });            // Gemini default
 *   const model = getAIModel({ provider: "openai", model: "gpt-4o" }); // OpenAI
 *
 * To add Claude or Ollama:
 *   1. Create ai/providers/claude.ts mirroring this pattern.
 *   2. Add a case below.
 *   3. No changes needed in business logic.
 */
export function getAIModel(config: AIProviderConfig = {}): LanguageModel {
  const { provider = "gemini", purpose = "question" } = config;

  switch (provider) {
    case "gemini": {
      const modelId =
        (config.model as GeminiModelId) ??
        (purpose === "feedback"
          ? GEMINI_DEFAULTS.feedbackModel
          : purpose === "resume"
          ? GEMINI_DEFAULTS.resumeModel
          : purpose === "coach"
          ? GEMINI_DEFAULTS.coachModel
          : GEMINI_DEFAULTS.questionModel);
      return getGeminiModel({ model: modelId });
    }

    case "openai": {
      return getOpenAIModel({
        model: (config.model as OpenAIModelId) ?? "gpt-4o",
      });
    }

    case "claude":
      return getAnthropicModel({
        model: config.model as AnthropicModelId | undefined,
      });

    case "ollama":
      throw new Error(
        "Ollama provider not yet configured. Create ai/providers/ollama.ts to enable."
      );

    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

export function getConfiguredAIModels(
  config: Omit<AIProviderConfig, "provider"> = {}
): ConfiguredAIModel[] {
  const order = (process.env.AI_PROVIDER_ORDER ?? "gemini,openai,claude")
    .split(",")
    .map((provider) => provider.trim().toLowerCase())
    .filter(Boolean) as AIProvider[];

  const configured: ConfiguredAIModel[] = [];

  for (const provider of order) {
    if (provider === "gemini" && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      configured.push({ provider, model: getAIModel({ ...config, provider }) });
      continue;
    }

    if (provider === "openai" && process.env.OPENAI_API_KEY) {
      configured.push({ provider, model: getAIModel({ ...config, provider }) });
      continue;
    }

    if (provider === "claude" && process.env.ANTHROPIC_API_KEY) {
      configured.push({ provider, model: getAIModel({ ...config, provider }) });
    }
  }

  return configured;
}

export { getGeminiModel, GEMINI_DEFAULTS, getAnthropicModel };
export type { GeminiModelId, OpenAIModelId, AnthropicModelId };
