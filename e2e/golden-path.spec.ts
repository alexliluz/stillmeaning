import { expect, test } from "@playwright/test";

test("a judge can inspect all three meaning-preserving transformations", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("workbench")).toHaveAttribute("data-ready", "true");

  await expect(page.getByText("Reduce motion, not meaning.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Upload progress", level: 1 })).toBeVisible();

  const examples = page.getByRole("navigation", { name: "Motion examples" });
  for (const name of ["Upload progress", "Save confirmation", "Panel hierarchy"]) {
    await examples.getByRole("button").filter({ hasText: name }).click();
    await expect(page.getByRole("heading", { name, level: 1 })).toBeVisible();
    await page.getByRole("button", { name: "Why not just turn motion off?" }).click();
    await expect(
      page.getByRole("article", { name: "Motion Removed Only preview" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Meaning at Risk" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Restore meaning with StillMeaning" })
      .click();
    await expect(
      page.getByRole("article", { name: "StillMeaning preview" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Meaning preserved by these checks",
      }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy generated code" })).toBeVisible();
    await expect(page.getByText("Demo fallback", { exact: true })).toBeVisible();
  }

  const reduced = page.getByRole("button", { name: "Reduced motion" });
  await reduced.click();
  await expect(reduced).toHaveAttribute("aria-pressed", "true");

  const revisedPreview = page.getByRole("article", { name: "StillMeaning preview" });
  await revisedPreview.getByRole("button", { name: "Open project details" }).click();
  await expect(
    revisedPreview.getByRole("heading", { name: "Project details" }),
  ).toBeFocused();
});

test("copy and custom source controls remain inspectable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("workbench")).toHaveAttribute("data-ready", "true");

  await page.getByRole("button", { name: "Copy generated code" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Generated code copied" })).toBeVisible();

  await page.getByRole("button", { name: "Paste your code" }).click();
  const source = page.getByLabel("Animation source code");
  await source.fill(".box { animation: spin 1s infinite; }");
  await expect(page.getByText("37 / 20000")).toBeVisible();
  await expect(page.getByRole("button", { name: "Analyze pasted code" })).toBeEnabled();
});

test("the workbench follows system reduced-motion preference", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByTestId("workbench")).toHaveAttribute("data-ready", "true");

  const sweep = page.locator(".progress-track__sweep");
  await expect(sweep).toHaveCSS("display", "none");
  await expect(
    page.getByRole("article", { name: "StillMeaning preview" }).getByRole("progressbar"),
  ).toHaveAttribute("aria-valuenow", "68");

  await page.getByRole("button", { name: "Why not just turn motion off?" }).click();
  const removedPreview = page.getByRole("article", {
    name: "Motion Removed Only preview",
  });
  await expect(removedPreview.locator(".progress-track__sweep")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Restore meaning with StillMeaning" }),
  ).toBeEnabled();
});

test("primary controls follow a logical keyboard order", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("workbench")).toHaveAttribute("data-ready", "true");

  const expected = [
    page.getByRole("link", { name: "StillMeaning home" }),
    page.getByRole("button", { name: "Analyze with GPT-5.6" }),
    page.getByRole("navigation", { name: "Motion examples" }).getByRole("button").filter({ hasText: "Upload progress" }),
    page.getByRole("navigation", { name: "Motion examples" }).getByRole("button").filter({ hasText: "Save confirmation" }),
    page.getByRole("navigation", { name: "Motion examples" }).getByRole("button").filter({ hasText: "Panel hierarchy" }),
    page.getByRole("button", { name: "Normal motion" }),
    page.getByRole("button", { name: "Reduced motion" }),
    page.getByRole("button", { name: "Paste your code" }),
    page.getByRole("button", { name: "Why not just turn motion off?" }),
    page.getByRole("button", { name: "Copy generated code" }),
  ];

  for (const control of expected) {
    await page.keyboard.press("Tab");
    await expect(control).toBeFocused();
  }
});
