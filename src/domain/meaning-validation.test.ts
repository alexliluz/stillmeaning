import { describe, expect, it } from "vitest";

import { summarizeMeaningChecks } from "./meaning-validation";

describe("summarizeMeaningChecks", () => {
  it("only reports preserved when every check passes", () => {
    expect(
      summarizeMeaningChecks([
        { id: "a", label: "A", passed: true, evidence: "Visible" },
      ]),
    ).toBe("preserved");
    expect(
      summarizeMeaningChecks([
        { id: "a", label: "A", passed: false, evidence: "Missing" },
      ]),
    ).toBe("needs-review");
  });

  it("does not claim preservation without checks", () => {
    expect(summarizeMeaningChecks([])).toBe("needs-review");
  });
});
