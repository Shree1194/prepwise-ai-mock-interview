import { anthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

export type AnthropicModelId = string;

export interface AnthropicProviderOptions {
  model?: AnthropicModelId;
}

export function getAnthropicModel(
  options: AnthropicProviderOptions = {}
): LanguageModel {
  const model =
    options.model ?? process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest";
  return anthropic(model) as LanguageModel;
}
