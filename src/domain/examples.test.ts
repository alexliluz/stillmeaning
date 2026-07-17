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
    }
  });

  it("looks up known examples and returns nothing for unknown ids", () => {
    expect(getMotionExample("success-save")?.title).toBe("Saved with confidence");
    expect(getMotionExample("missing")).toBeUndefined();
    expect(getFallbackAnalysis("progress-upload")?.animationId).toBe("progress-upload");
    expect(getFallbackAnalysis("missing")).toBeUndefined();
  });
});
