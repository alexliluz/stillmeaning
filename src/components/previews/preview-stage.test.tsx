import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PreviewStage } from "./preview-stage";

describe("PreviewStage", () => {
  it("keeps numeric progress semantics in both versions", () => {
    const { rerender } = render(
      <PreviewStage
        exampleId="progress-upload"
        motionMode="normal"
        version="original"
      />,
    );

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "68");

    rerender(
      <PreviewStage
        exampleId="progress-upload"
        motionMode="reduced"
        version="stillmeaning"
      />,
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "68");
    expect(screen.getByText("Uploading · 68%")).toBeVisible();
  });

  it("retains a textual success status", () => {
    render(
      <PreviewStage
        exampleId="success-save"
        motionMode="reduced"
        version="stillmeaning"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Changes saved");
    expect(screen.getByText("Draft synced at 10:42")).toBeVisible();
  });

  it("moves focus to the hierarchy destination", async () => {
    const user = userEvent.setup();
    render(
      <PreviewStage
        exampleId="hierarchy-panel"
        motionMode="reduced"
        version="stillmeaning"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open project details" }));

    expect(
      screen.getByRole("heading", { name: "Project details" }),
    ).toHaveFocus();
  });
});
