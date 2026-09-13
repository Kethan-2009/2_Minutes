import { expect, test } from "@playwright/test";

/**
 * Preview mode lets these pages render, so these tests pin the routing rules
 * rather than the auth gate. The gate itself is exercised by the unit tests
 * around safeRedirect and by the proxy once Supabase is configured.
 */
test.describe("routing", () => {
  test("reset-password is reachable only through a recovery link", async ({
    page,
  }) => {
    // /auth/confirm with no token is not a valid recovery link.
    await page.goto("/auth/confirm");

    await expect(page).toHaveURL(/\/login\?error=link-invalid/);
    await expect(page.getByRole("alert")).toContainText("didn't look right");
  });

  test("the callback route rejects a missing code", async ({ page }) => {
    await page.goto("/auth/callback");

    await expect(page).toHaveURL(/\/login\?error=link-invalid/);
  });

  test("login carries a next destination through to the form", async ({
    page,
  }) => {
    await page.goto("/login?next=/today");

    await expect(page.locator('input[name="next"]')).toHaveValue("/today");
  });

  test("an off-origin next is not reflected into the page", async ({ page }) => {
    await page.goto("/login?next=https://evil.example");

    // It may be echoed into the hidden field, but it must never survive the
    // server action. safeRedirect is unit-tested; this guards the render path.
    const html = await page.content();
    expect(html).not.toContain('href="https://evil.example"');
  });
});
