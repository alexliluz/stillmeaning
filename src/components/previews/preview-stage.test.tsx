import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PreviewStage } from "./preview-stage";

describe("PreviewStage", () => {
  it("keeps numeric progress semantics in the StillMeaning version", () => {
    render(
      <PreviewStage
        exampleId="progress-upload"
        motionMode="reduced"
        version="stillmeaning"
      />,
    );

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "68");
    expect(screen.getByText("Uploading · 68%")).toBeVisible();
  });

  it("renders a motion-removed progress state without invented numeric semantics", () => {
    render(
      <PreviewStage
        exampleId="progress-upload"
        motionMode="reduced"
        version="motion-removed"
      />,
    );

    expect(
      screen.getByRole("article", { name: "Motion Removed Only preview" }),
    ).toBeVisible();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByText("Uploading · 68%")).not.toBeInTheDocument();
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

  it("does not invent status semantics in the original save preview", () => {
    render(
      <PreviewStage
        exampleId="success-save"
        motionMode="normal"
        version="original"
      />,
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText("Changes saved")).not.toBeInTheDocument();
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

  it("does not move focus in the motion-removed hierarchy preview", async () => {
    const user = userEvent.setup();
    render(
      <PreviewStage
        exampleId="hierarchy-panel"
        motionMode="reduced"
        version="motion-removed"
      />,
    );

    const trigger = screen.getByRole("button", { name: "Open project details" });
    await user.click(trigger);

    expect(
      screen.getByRole("heading", { name: "Project details" }),
    ).not.toHaveFocus();
    expect(screen.queryByText("Deeper level")).not.toBeInTheDocument();
  });
});
