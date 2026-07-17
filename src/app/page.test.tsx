import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("states the product promise", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Reduce motion, not meaning." }),
    ).toBeInTheDocument();
  });
});
