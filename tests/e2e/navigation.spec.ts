import { expect, test } from "@playwright/test";

test.describe("public routes", () => {
  test("landing page states the pitch and offers both doors", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Let’s finish one.",
    );
    await expect(page.getByRole("link", { name: "Get started" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "I already have an account" }),
    ).toBeVisible();
  });

  test("every auth page is reachable by clicking", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Get started" }).click();
    await expect(page).toHaveURL("/signup");
    await expect(page.getByLabel("Email")).toBeVisible();

    await page.getByRole("link", { name: "Log in" }).click();
    await expect(page).toHaveURL("/login");

    await page.getByRole("link", { name: "Forgot your password?" }).click();
    await expect(page).toHaveURL("/forgot-password");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Reset your password.",
    );
  });

  test("an unknown path gets the styled not-found page", async ({ page }) => {
    const response = await page.goto("/no-such-page");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Nothing here.",
    );
    await expect(
      page.getByRole("link", { name: "Back to the start" }),
    ).toBeVisible();
  });

  test("an expired confirmation link explains itself on the login page", async ({
    page,
  }) => {
    await page.goto("/login?error=link-expired");

    await expect(page.getByRole("alert")).toContainText("expired");
  });
});

test.describe("preview mode", () => {
  test("says plainly that nothing is connected", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Preview mode.")).toBeVisible();
  });
});
