import { describe, expect, it, vi } from "vitest";

import { getFallbackAnalysis } from "../../domain/examples";
import type { AnalysisProvider } from "./provider";
import { AnalysisUnavailableError, analyzeMotion } from "./service";

function progressAnalysis() {
  const analysis = getFallbackAnalysis("progress-upload");
  if (!analysis) throw new Error("Missing test fixture");
  return structuredClone(analysis);
}

describe("analyzeMotion", () => {
  it("uses clearly labeled demo data for a known example when no key exists", async () => {
    const provider: AnalysisProvider = { analyze: vi.fn() };

    const result = await analyzeMotion(
      { exampleId: "progress-upload" },
      { apiKey: undefined, provider, timeoutMs: 50 },
    );

    expect(result.analysis.source).toBe("demo-fallback");
    expect(result.notice).toMatch(/Demo data/i);
    expect(provider.analyze).not.toHaveBeenCalled();
  });

  it("accepts valid provider output and identifies it as GPT-5.6", async () => {
    const provider: AnalysisProvider = {
      analyze: vi.fn().mockResolvedValue(progressAnalysis()),
    };

    const result = await analyzeMotion(
      { exampleId: "progress-upload" },
      { apiKey: "test-only", provider, timeoutMs: 50 },
    );

    expect(result.analysis.source).toBe("gpt-5.6");
    expect(result.notice).toBeUndefined();
  });

  it("rejects invalid provider output and falls back without leaking details", async () => {
    const provider: AnalysisProvider = {
      analyze: vi.fn().mockResolvedValue({ confidence: 2, secret: "do-not-return" }),
    };

    const result = await analyzeMotion(
      { exampleId: "progress-upload" },
      { apiKey: "test-only", provider, timeoutMs: 50 },
    );

    expect(result.analysis.source).toBe("demo-fallback");
    expect(result.notice).toMatch(/could not be validated/i);
    expect(result.notice).not.toContain("do-not-return");
  });

  it("aborts a slow provider and returns a labeled fallback", async () => {
    const provider: AnalysisProvider = {
      analyze: vi.fn((_request, signal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(new Error("aborted")), {
            once: true,
          });
        }),
      ),
    };

    const result = await analyzeMotion(
      { exampleId: "progress-upload" },
      { apiKey: "test-only", provider, timeoutMs: 5 },
    );

    expect(result.analysis.source).toBe("demo-fallback");
    expect(result.notice).toMatch(/timed out/i);
  });

  it("does not fabricate demo analysis for custom source", async () => {
    const provider: AnalysisProvider = { analyze: vi.fn() };

    await expect(
      analyzeMotion(
        { sourceCode: ".box { animation: spin 1s infinite; }" },
        { apiKey: undefined, provider, timeoutMs: 50 },
      ),
    ).rejects.toBeInstanceOf(AnalysisUnavailableError);
  });
});
