import { expect, test } from "@playwright/test";

test("controls the simulated hub in the production build", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  // Keep the analytics script in index.html from reporting test runs
  await page.route(/getclicky\.com/, (route) =>
    route.fulfill({
      body: "",
      headers: { "access-control-allow-origin": "*" },
    }),
  );

  await page.goto("/?fakeHub");
  await expect(page.getByText("TECHNIC_MEDIUM_HUB")).toBeVisible();
  await expect(page.getByText("TECHNIC_LARGE_LINEAR_MOTOR")).toHaveCount(2);
  // The fake hub's tilt sensor rocks, so the reading changes over time
  await expect(page.getByText(/^-?\d+°$/).first()).toBeVisible();

  await page.getByLabel("Add motor control for port A").click();
  await page.getByLabel("Faster").click();
  await page.getByLabel("Faster").click();
  await expect
    .poll(() => page.evaluate(() => window.simulatedHub?.power.A))
    .toBe(20);

  await page.getByLabel("Remove control").click();
  await expect
    .poll(() => page.evaluate(() => window.simulatedHub?.power.A))
    .toBe(0);

  await page.getByRole("button", { name: "Disconnect" }).click();
  await expect(page.getByRole("heading", { name: "About" })).toBeVisible();

  expect(errors).toEqual([]);
});
