import {
  analysisSchema,
  type Analysis,
  type AnalysisRequest,
} from "../../domain/analysis";
import { getFallbackAnalysis } from "../../domain/examples";
import type { AnalysisProvider } from "./provider";

const DEFAULT_TIMEOUT_MS = 12_000;

export interface AnalysisServiceDependencies {
  apiKey: string | undefined;
  provider: AnalysisProvider;
  timeoutMs?: number;
}

export interface AnalysisServiceResult {
  analysis: Analysis;
  notice?: string;
}

export class AnalysisUnavailableError extends Error {
  constructor(message = "Motion analysis is temporarily unavailable.") {
    super(message);
    this.name = "AnalysisUnavailableError";
  }
}

class InvalidProviderOutputError extends Error {}

function fallbackFor(request: AnalysisRequest): Analysis | undefined {
  if (!("exampleId" in request) || typeof request.exampleId !== "string") {
    return undefined;
  }
  const analysis = getFallbackAnalysis(request.exampleId);
  return analysis ? structuredClone(analysis) : undefined;
}

function fallbackResult(
  request: AnalysisRequest,
  notice: string,
): AnalysisServiceResult {
  const analysis = fallbackFor(request);
  if (!analysis) throw new AnalysisUnavailableError();
  return { analysis, notice };
}

export async function analyzeMotion(
  request: AnalysisRequest,
  dependencies: AnalysisServiceDependencies,
): Promise<AnalysisServiceResult> {
  if (!dependencies.apiKey) {
    return fallbackResult(
      request,
      "Demo data — add a server-side OpenAI API key to run GPT-5.6 analysis.",
    );
  }

  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, dependencies.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const providerOutput = await dependencies.provider.analyze(
      request,
      controller.signal,
    );
    const objectOutput =
      providerOutput && typeof providerOutput === "object" ? providerOutput : {};
    const parsed = analysisSchema.safeParse({
      ...objectOutput,
      source: "gpt-5.6",
    });

    if (!parsed.success) throw new InvalidProviderOutputError();
    return { analysis: parsed.data };
  } catch (error) {
    if (error instanceof InvalidProviderOutputError) {
      return fallbackResult(
        request,
        "GPT-5.6 output could not be validated. Showing clearly labeled Demo data.",
      );
    }
    if (timedOut) {
      return fallbackResult(
        request,
        "GPT-5.6 analysis timed out. Showing clearly labeled Demo data.",
      );
    }
    return fallbackResult(
      request,
      "GPT-5.6 analysis was unavailable. Showing clearly labeled Demo data.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
