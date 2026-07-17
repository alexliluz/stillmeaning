import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { motionExamples } from "../../domain/examples";
import { Workbench } from "./workbench";

describe("Workbench", () => {
  it("switches examples and exposes demo fallback provenance", async () => {
    const user = userEvent.setup();
    render(<Workbench initialAnalysis={motionExamples[0].fallbackAnalysis} />);

    await user.click(screen.getByRole("button", { name: /save confirmation/i }));

    expect(
      screen.getByRole("heading", { name: /save confirmation/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/demo fallback/i)).toBeInTheDocument();
  });

  it("shows analysis evidence and meaning checks", () => {
    render(<Workbench initialAnalysis={motionExamples[0].fallbackAnalysis} />);

    expect(screen.getByText("css-keyframes")).toBeInTheDocument();
    expect(screen.getByText("progress")).toBeInTheDocument();
    expect(screen.getByText("Numeric progress remains available")).toBeInTheDocument();
    expect(screen.getByText("Meaning Preserved")).toBeInTheDocument();
  });

  it("lets judges compare normal and reduced motion modes", async () => {
    const user = userEvent.setup();
    render(<Workbench initialAnalysis={motionExamples[0].fallbackAnalysis} />);

    const normal = screen.getByRole("button", { name: "Normal motion" });
    const reduced = screen.getByRole("button", { name: "Reduced motion" });
    expect(normal).toHaveAttribute("aria-pressed", "true");
    expect(reduced).toHaveAttribute("aria-pressed", "false");

    await user.click(reduced);
    expect(normal).toHaveAttribute("aria-pressed", "false");
    expect(reduced).toHaveAttribute("aria-pressed", "true");
  });
});
