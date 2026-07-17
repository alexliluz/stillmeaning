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
  reportFailure?: (diagnostic: AnalysisFailureDiagnostic) => void;
}

const modelAnalysisSchema = analysisSchema.omit({ source: true });

interface AnalysisFailureDiagnostic {
  event: "openai_analysis_failed";
  name: string;
  status?: number;
  code?: string;
  type?: string;
}

function safeString(value: unknown): string | undefined {
  return typeof value === "string" && value.length <= 120 ? value : undefined;
}

function failureDiagnostic(error: unknown): AnalysisFailureDiagnostic {
  const record =
    error && typeof error === "object"
      ? (error as Record<string, unknown>)
      : undefined;
  const name = error instanceof Error ? error.name : "UnknownError";
  const status =
    typeof record?.status === "number" && Number.isInteger(record.status)
      ? record.status
      : undefined;

  return {
    event: "openai_analysis_failed",
    name,
    ...(status === undefined ? {} : { status }),
    ...(safeString(record?.code) ? { code: safeString(record?.code) } : {}),
    ...(safeString(record?.type) ? { type: safeString(record?.type) } : {}),
  };
}

function reportFailureToConsole(diagnostic: AnalysisFailureDiagnostic): void {
  console.error(JSON.stringify(diagnostic));
}

export class OpenAIAnalysisProvider implements AnalysisProvider {
  private readonly client: ProviderClient;
  private readonly model: string;
  private readonly reportFailure: (diagnostic: AnalysisFailureDiagnostic) => void;

  constructor(options: OpenAIAnalysisProviderOptions) {
    this.client =
      options.client ??
      (new OpenAI({ apiKey: options.apiKey }) as unknown as ProviderClient);
    this.model = options.model ?? process.env.OPENAI_MODEL ?? "gpt-5.6";
    this.reportFailure = options.reportFailure ?? reportFailureToConsole;
  }

  async analyze(request: AnalysisRequest, signal: AbortSignal): Promise<unknown> {
    let response: { output_parsed: unknown };
    try {
      response = await this.client.responses.parse(
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
    } catch (error) {
      this.reportFailure(failureDiagnostic(error));
      throw error;
    }

    if (!response.output_parsed) {
      throw new Error("The model did not return a structured analysis.");
    }

    return response.output_parsed;
  }
}
