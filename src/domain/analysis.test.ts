import { describe, expect, it } from "vitest";

import {
  analysisRequestSchema,
  analysisSchema,
  MAX_SOURCE_LENGTH,
} from "./analysis";

function validAnalysis() {
  return {
    animationId: "progress-upload",
    detectedTechnique: "css-keyframes",
    semanticRole: "progress",
    motionRisk: "medium",
    riskReason: "Continuous lateral motion.",
    originalBehavior: "A sweeping bar indicates an active upload.",
    proposedAlternative: "Use static progress with explicit text.",
    preservedMeaning: ["The upload remains active"],
    semanticTrace: [
      {
        id: "activity-state",
        meaning: "The upload is still active",
        originalSignal: "A repeated sweeping highlight",
        removalEffect: "A static bar can look stalled",
        impact: "ambiguous",
        replacementSignal: "Persistent Uploading · 68% text",
        validationCheckId: "activity-state",
      },
    ],
    confidence: 0.9,
    generatedCode: ".progress { width: 68%; }",
    validationChecks: [
      {
        id: "activity-state",
        label: "Activity remains explicit",
        passed: true,
        evidence: "Uploading · 68% remains visible.",
      },
    ],
    source: "demo-fallback",
  };
}

describe("analysisSchema", () => {
  it("accepts a semantic trace linked to validation evidence", () => {
    expect(analysisSchema.safeParse(validAnalysis()).success).toBe(true);
  });

  it("rejects dangling validation references", () => {
    const input = structuredClone(validAnalysis());
    input.semanticTrace[0].validationCheckId = "missing-check";

    expect(analysisSchema.safeParse(input).success).toBe(false);
  });

  it("rejects duplicate semantic trace ids", () => {
    const input = structuredClone(validAnalysis());
    input.semanticTrace.push({ ...input.semanticTrace[0] });

    expect(analysisSchema.safeParse(input).success).toBe(false);
  });

  it("rejects confidence outside zero and one", () => {
    const result = analysisSchema.safeParse({
      animationId: "progress-upload",
      detectedTechnique: "css-keyframes",
      semanticRole: "progress",
      motionRisk: "medium",
      riskReason: "Continuous lateral motion.",
      originalBehavior: "A bar moves across the track.",
      proposedAlternative: "Use a static filled track with text.",
      preservedMeaning: ["Current completion value"],
      confidence: 1.2,
      generatedCode: ".progress { width: 68%; }",
      validationChecks: [
        {
          id: "value",
          label: "Value remains visible",
          passed: true,
          evidence: "68% is visible.",
        },
      ],
      source: "demo-fallback",
    });

    expect(result.success).toBe(false);
  });

  it("requires at least one validation check", () => {
    const result = analysisSchema.safeParse({
      animationId: "progress-upload",
      detectedTechnique: "css-keyframes",
      semanticRole: "progress",
      motionRisk: "medium",
      riskReason: "Continuous lateral motion.",
      originalBehavior: "A bar moves across the track.",
      proposedAlternative: "Use a static filled track with text.",
      preservedMeaning: ["Current completion value"],
      confidence: 0.9,
      generatedCode: ".progress { width: 68%; }",
      validationChecks: [],
      source: "demo-fallback",
    });

    expect(result.success).toBe(false);
  });
});

describe("analysisRequestSchema", () => {
  it("rejects source larger than the configured limit", () => {
    const result = analysisRequestSchema.safeParse({
      sourceCode: "x".repeat(MAX_SOURCE_LENGTH + 1),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a request that supplies an example and source together", () => {
    const result = analysisRequestSchema.safeParse({
      exampleId: "progress-upload",
      sourceCode: ".box { animation: spin 1s infinite; }",
    });

    expect(result.success).toBe(false);
  });
});
