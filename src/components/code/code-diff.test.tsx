import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CodeDiff } from "./code-diff";

describe("CodeDiff", () => {
  it("shows additions and removals as text", () => {
    render(<CodeDiff original={"color: red;"} revised={"color: blue;"} />);

    expect(screen.getByText(/-color: red/)).toBeVisible();
    expect(screen.getByText(/\+color: blue/)).toBeVisible();
  });

  it("announces a successful copy without relying on color", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<CodeDiff original="a" revised="b" />);

    await user.click(
      screen.getByRole("button", { name: /copy generated code/i }),
    );

    expect(writeText).toHaveBeenCalledWith("b");
    expect(screen.getByRole("status")).toHaveTextContent(/copied/i);
  });
});
