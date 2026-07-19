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
    expect(
      screen.getByText("Meaning preserved by these checks"),
    ).toBeInTheDocument();
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

  it("reveals meaning loss and restores the StillMeaning result", async () => {
    const user = userEvent.setup();
    render(<Workbench initialAnalysis={motionExamples[0].fallbackAnalysis} />);

    await user.click(
      screen.getByRole("button", { name: "Why not just turn motion off?" }),
    );
    expect(
      screen.getByRole("article", { name: "Motion Removed Only preview" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Meaning at Risk" }),
    ).toBeVisible();
    expect(screen.getByText("A static bar can look stalled.")).toBeVisible();

    await user.click(
      screen.getByRole("button", {
        name: "Restore meaning with StillMeaning",
      }),
    );
    expect(
      screen.getByRole("article", { name: "StillMeaning preview" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Meaning preserved by these checks",
      }),
    ).toBeVisible();
    expect(screen.getByText("Requires developer review")).toBeVisible();
  });

  it("resets the counterfactual when another example is selected", async () => {
    const user = userEvent.setup();
    render(<Workbench initialAnalysis={motionExamples[0].fallbackAnalysis} />);

    await user.click(
      screen.getByRole("button", { name: "Why not just turn motion off?" }),
    );
    await user.click(screen.getByRole("button", { name: /save confirmation/i }));

    expect(
      screen.getByRole("article", { name: "StillMeaning preview" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Why not just turn motion off?" }),
    ).toBeVisible();
  });
});
