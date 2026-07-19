import { describe, expect, it } from "vitest";

import { analysisSchema } from "./analysis";
import { getFallbackAnalysis, getMotionExample, motionExamples } from "./examples";

describe("motionExamples", () => {
  it("provides exactly the three golden-path examples with valid fallback analyses", () => {
    expect(motionExamples.map((example) => example.id)).toEqual([
      "progress-upload",
      "success-save",
      "hierarchy-panel",
    ]);

    for (const example of motionExamples) {
      expect(analysisSchema.safeParse(example.fallbackAnalysis).success).toBe(true);
      expect(example.fallbackAnalysis.source).toBe("demo-fallback");
      expect(example.originalCode).not.toBe(example.reducedCode);
      expect(example.motionRemovedCode.trim().length).toBeGreaterThan(0);
      expect(example.motionRemovedCode).not.toBe(example.originalCode);
      expect(example.motionRemovedCode).not.toBe(example.reducedCode);
      expect(example.fallbackAnalysis.semanticTrace.length).toBeGreaterThan(0);

      const checkIds = new Set(
        example.fallbackAnalysis.validationChecks.map((check) => check.id),
      );
      for (const trace of example.fallbackAnalysis.semanticTrace) {
        expect(checkIds.has(trace.validationCheckId)).toBe(true);
      }
    }
  });

  it("describes the distinct meaning risk in every golden-path example", () => {
    expect(
      getMotionExample("progress-upload")?.fallbackAnalysis.semanticTrace.map(
        (trace) => trace.impact,
      ),
    ).toContain("ambiguous");
    expect(
      getMotionExample("success-save")?.fallbackAnalysis.semanticTrace.map(
        (trace) => trace.impact,
      ),
    ).toContain("lost");
    expect(
      getMotionExample("hierarchy-panel")?.fallbackAnalysis.semanticTrace.map(
        (trace) => trace.impact,
      ),
    ).toContain("ambiguous");
  });

  it("looks up known examples and returns nothing for unknown ids", () => {
    expect(getMotionExample("success-save")?.title).toBe("Save confirmation");
    expect(getMotionExample("missing")).toBeUndefined();
    expect(getFallbackAnalysis("progress-upload")?.animationId).toBe("progress-upload");
    expect(getFallbackAnalysis("missing")).toBeUndefined();
  });
});
