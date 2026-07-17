import { describe, expect, it, vi } from "vitest";

import { getFallbackAnalysis } from "../../domain/examples";
import { OpenAIAnalysisProvider } from "./provider";

describe("OpenAIAnalysisProvider", () => {
  it("uses the Responses API with a strict text format and abort signal", async () => {
    const parsed = getFallbackAnalysis("progress-upload");
    const parse = vi.fn().mockResolvedValue({ output_parsed: parsed });
    const client = { responses: { parse } };
    const signal = new AbortController().signal;
    const provider = new OpenAIAnalysisProvider({
      apiKey: "test-only",
      client,
      model: "gpt-5.6",
    });

    await expect(
      provider.analyze({ exampleId: "progress-upload" }, signal),
    ).resolves.toEqual(parsed);
    expect(parse).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5.6",
        max_output_tokens: 6_000,
        reasoning: { effort: "low" },
        text: { format: expect.objectContaining({ type: "json_schema", strict: true }) },
      }),
      { signal },
    );
  });

  it("rejects an empty parsed response", async () => {
    const provider = new OpenAIAnalysisProvider({
      apiKey: "test-only",
      client: { responses: { parse: vi.fn().mockResolvedValue({ output_parsed: null }) } },
    });

    await expect(
      provider.analyze({ exampleId: "progress-upload" }, new AbortController().signal),
    ).rejects.toThrow("structured analysis");
  });
});
