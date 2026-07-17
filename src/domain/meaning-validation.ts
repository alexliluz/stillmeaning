import type { ValidationCheck } from "./analysis";

export type MeaningValidationSummary = "preserved" | "needs-review";

export function summarizeMeaningChecks(
  checks: readonly ValidationCheck[],
): MeaningValidationSummary {
  return checks.length > 0 && checks.every((check) => check.passed)
    ? "preserved"
    : "needs-review";
}
