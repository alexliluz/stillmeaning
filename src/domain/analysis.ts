import { z } from "zod";

export const MAX_SOURCE_LENGTH = 20_000;

const conciseText = z.string().trim().min(1).max(2_000);

export const detectedTechniqueSchema = z.enum([
  "css-keyframes",
  "css-transition",
  "web-animations",
  "react-motion",
  "unknown",
]);

export const semanticRoleSchema = z.enum([
  "progress",
  "status-feedback",
  "hierarchy-transition",
  "focus-context",
  "decorative",
  "unknown",
]);

export const motionRiskSchema = z.enum(["low", "medium", "high"]);

export const validationCheckSchema = z
  .object({
    id: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/),
    label: z.string().trim().min(1).max(160),
    passed: z.boolean(),
    evidence: conciseText,
  })
  .strict();

export const semanticImpactSchema = z.enum([
  "lost",
  "ambiguous",
  "retained",
]);

export const semanticTraceSchema = z
  .object({
    id: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/),
    meaning: z.string().trim().min(1).max(240),
    originalSignal: conciseText,
    removalEffect: conciseText,
    impact: semanticImpactSchema,
    replacementSignal: conciseText,
    validationCheckId: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9-]+$/),
  })
  .strict();

export const analysisSourceSchema = z.enum(["gpt-5.6", "demo-fallback"]);

const analysisShape = {
  animationId: z.string().trim().min(1).max(120),
  detectedTechnique: detectedTechniqueSchema,
  semanticRole: semanticRoleSchema,
  motionRisk: motionRiskSchema,
  riskReason: conciseText,
  originalBehavior: conciseText,
  proposedAlternative: conciseText,
  preservedMeaning: z.array(z.string().trim().min(1).max(240)).min(1).max(8),
  semanticTrace: z.array(semanticTraceSchema).min(1).max(8),
  confidence: z.number().min(0).max(1),
  generatedCode: z.string().trim().min(1).max(50_000),
  validationChecks: z.array(validationCheckSchema).min(1).max(12),
};

interface SemanticReferenceValue {
  semanticTrace: Array<{ id: string; validationCheckId: string }>;
  validationChecks: Array<{ id: string }>;
}

function validateSemanticReferences(
  value: SemanticReferenceValue,
  context: z.RefinementCtx,
) {
  const checkIds = new Set(value.validationChecks.map((check) => check.id));
  const traceIds = new Set<string>();

  value.semanticTrace.forEach((trace, index) => {
    if (traceIds.has(trace.id)) {
      context.addIssue({
        code: "custom",
        path: ["semanticTrace", index, "id"],
        message: "Semantic trace ids must be unique.",
      });
    }
    traceIds.add(trace.id);

    if (!checkIds.has(trace.validationCheckId)) {
      context.addIssue({
        code: "custom",
        path: ["semanticTrace", index, "validationCheckId"],
        message: "Semantic trace must reference an existing validation check.",
      });
    }
  });
}

export const modelAnalysisSchema = z
  .object(analysisShape)
  .strict()
  .superRefine(validateSemanticReferences);

export const analysisSchema = z
  .object({ ...analysisShape, source: analysisSourceSchema })
  .strict()
  .superRefine(validateSemanticReferences);

const exampleAnalysisRequestSchema = z
  .object({
    exampleId: z.string().trim().min(1).max(80),
    sourceCode: z.never().optional(),
  })
  .strict();

const sourceAnalysisRequestSchema = z
  .object({
    sourceCode: z.string().trim().min(1).max(MAX_SOURCE_LENGTH),
    exampleId: z.never().optional(),
  })
  .strict();

export const analysisRequestSchema = z.union([
  exampleAnalysisRequestSchema,
  sourceAnalysisRequestSchema,
]);

export type Analysis = z.infer<typeof analysisSchema>;
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
export type AnalysisSource = z.infer<typeof analysisSourceSchema>;
export type DetectedTechnique = z.infer<typeof detectedTechniqueSchema>;
export type MotionRisk = z.infer<typeof motionRiskSchema>;
export type SemanticImpact = z.infer<typeof semanticImpactSchema>;
export type SemanticRole = z.infer<typeof semanticRoleSchema>;
export type SemanticTrace = z.infer<typeof semanticTraceSchema>;
export type ValidationCheck = z.infer<typeof validationCheckSchema>;
