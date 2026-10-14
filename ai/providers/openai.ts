import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export type OpenAIModelId = string;

export interface OpenAIProviderOptions {
  model?: OpenAIModelId;
}

export function getOpenAIModel(options: OpenAIProviderOptions = {}): LanguageModel {
  const model = options.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  return openai(model) as LanguageModel;
}
