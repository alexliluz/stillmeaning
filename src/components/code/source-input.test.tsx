import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MAX_SOURCE_LENGTH } from "../../domain/analysis";
import { SourceInput } from "./source-input";

describe("SourceInput", () => {
  it("requires source and reports the character count", async () => {
    const user = userEvent.setup();
    const onAnalyze = vi.fn();
    render(<SourceInput onAnalyze={onAnalyze} pending={false} />);

    const submit = screen.getByRole("button", { name: "Analyze pasted code" });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Animation source code"), {
      target: { value: ".box {}" },
    });
    expect(screen.getByText(`7 / ${MAX_SOURCE_LENGTH}`)).toBeVisible();
    expect(submit).toBeEnabled();
    await user.click(submit);
    expect(onAnalyze).toHaveBeenCalledWith(".box {}");
  });

  it("enforces the source limit and announces pending work", () => {
    const { rerender } = render(
      <SourceInput onAnalyze={vi.fn()} pending={false} />,
    );
    const input = screen.getByLabelText("Animation source code");
    fireEvent.change(input, { target: { value: "x".repeat(MAX_SOURCE_LENGTH + 10) } });
    expect(input).toHaveValue("x".repeat(MAX_SOURCE_LENGTH));

    rerender(<SourceInput onAnalyze={vi.fn()} pending />);
    expect(screen.getByText(/analyzing pasted code with GPT-5.6/i)).toBeVisible();
  });

  it("renders actionable errors", () => {
    render(
      <SourceInput
        error="GPT-5.6 is unavailable. The last valid result is still shown."
        onAnalyze={vi.fn()}
        pending={false}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/last valid result/i);
  });
});
