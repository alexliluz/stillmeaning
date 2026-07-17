import {
  analysisRequestSchema,
  MAX_SOURCE_LENGTH,
} from "../../../domain/analysis";
import {
  type AnalysisProvider,
  OpenAIAnalysisProvider,
} from "../../../server/analysis/provider";
import {
  AnalysisUnavailableError,
  analyzeMotion,
} from "../../../server/analysis/service";

export const runtime = "nodejs";

const unavailableProvider: AnalysisProvider = {
  async analyze() {
    throw new AnalysisUnavailableError();
  },
};

function json(data: unknown, status: number): Response {
  return Response.json(data, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  if (
    body &&
    typeof body === "object" &&
    "sourceCode" in body &&
    typeof body.sourceCode === "string" &&
    body.sourceCode.length > MAX_SOURCE_LENGTH
  ) {
    return json({ error: "Source code is too large." }, 413);
  }

  const parsed = analysisRequestSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Invalid analysis request." }, 400);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim() || undefined;
  const provider = apiKey
    ? new OpenAIAnalysisProvider({ apiKey })
    : unavailableProvider;

  try {
    const result = await analyzeMotion(parsed.data, { apiKey, provider });
    return json(result, 200);
  } catch (error) {
    if (error instanceof AnalysisUnavailableError) {
      return json({ error: error.message }, 503);
    }
    return json({ error: "Motion analysis failed." }, 500);
  }
}
