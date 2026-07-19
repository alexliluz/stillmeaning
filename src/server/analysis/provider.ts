import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import {
  type AnalysisRequest,
  modelAnalysisSchema,
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

interface AnalysisFailureDiagnostic {
  event: "openai_analysis_failed";
  name: string;
  status?: number;
  code?: string;
  type?: string;
  category: OpenAIProviderFailureCategory;
}

export type OpenAIProviderFailureCategory =
  | "authentication"
  | "quota"
  | "rate-limit"
  | "model-access"
  | "request"
  | "network"
  | "unknown";

export class OpenAIProviderError extends Error {
  readonly category: OpenAIProviderFailureCategory;

  constructor(category: OpenAIProviderFailureCategory, cause: unknown) {
    super("OpenAI analysis request failed.", { cause });
    this.name = "OpenAIProviderError";
    this.category = category;
  }
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
  const code = safeString(record?.code);
  const type = safeString(record?.type);
  const category = failureCategory({ name, status, code, type });

  return {
    event: "openai_analysis_failed",
    name,
    ...(status === undefined ? {} : { status }),
    ...(code ? { code } : {}),
    ...(type ? { type } : {}),
    category,
  };
}

function failureCategory(
  diagnostic: Pick<AnalysisFailureDiagnostic, "name" | "status" | "code" | "type">,
): OpenAIProviderFailureCategory {
  const { name, status, code, type } = diagnostic;
  if (code === "insufficient_quota" || type === "insufficient_quota") {
    return "quota";
  }
  if (status === 401 || code === "invalid_api_key") return "authentication";
  if (status === 403 || status === 404 || code === "model_not_found") {
    return "model-access";
  }
  if (status === 429) return "rate-limit";
  if (status === 400 || status === 422) return "request";
  if (
    name === "APIConnectionError" ||
    name === "FetchError" ||
    name === "TypeError"
  ) {
    return "network";
  }
  return "unknown";
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
      const diagnostic = failureDiagnostic(error);
      this.reportFailure(diagnostic);
      throw new OpenAIProviderError(diagnostic.category, error);
    }

    if (!response.output_parsed) {
      throw new Error("The model did not return a structured analysis.");
    }

    return response.output_parsed;
  }
}
