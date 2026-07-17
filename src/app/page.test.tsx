import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("states the product promise", () => {
    render(<Home />);

    expect(screen.getByText("Reduce motion, not meaning.")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Upload progress", level: 1 }),
    ).toBeInTheDocument();
  });
});
