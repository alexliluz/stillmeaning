import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import {
  analysisSchema,
  type AnalysisRequest,
} from "../../domain/analysis";
import { buildAnalysisPrompt } from "./prompt";

export interface AnalysisProvider {
  analyze(request: AnalysisRequest, signal: AbortSignal): Promise<unknown>;
}

interface ProviderClient {
  responses: {
    parse(
      body: Record<string, unknown>,
      options: { signal: AbortSignal },
    ): Promise<{ output_parsed: unknown }>;
  };
}

interface OpenAIAnalysisProviderOptions {
  apiKey: string;
  model?: string;
  client?: ProviderClient;
}

const modelAnalysisSchema = analysisSchema.omit({ source: true });

export class OpenAIAnalysisProvider implements AnalysisProvider {
  private readonly client: ProviderClient;
  private readonly model: string;

  constructor(options: OpenAIAnalysisProviderOptions) {
    this.client =
      options.client ??
      (new OpenAI({ apiKey: options.apiKey }) as unknown as ProviderClient);
    this.model = options.model ?? process.env.OPENAI_MODEL ?? "gpt-5.6";
  }

  async analyze(request: AnalysisRequest, signal: AbortSignal): Promise<unknown> {
    const response = await this.client.responses.parse(
      {
        model: this.model,
        input: [
          {
            role: "user",
            content: buildAnalysisPrompt(request),
          },
        ],
        max_output_tokens: 6_000,
        reasoning: { effort: "low" },
        text: {
          format: zodTextFormat(modelAnalysisSchema, "motion_analysis"),
        },
        store: false,
      },
      { signal },
    );

    if (!response.output_parsed) {
      throw new Error("The model did not return a structured analysis.");
    }

    return response.output_parsed;
  }
}
