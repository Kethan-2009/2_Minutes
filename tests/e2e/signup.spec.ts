import { expect, test } from "@playwright/test";

test.describe("sign up form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
  });

  test("reports each bad field separately, and as an error not a hint", async ({
    page,
  }) => {
    await page.getByLabel("First name").fill("Alex");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: "Create account" }).click();

    const email = page.getByLabel("Email");
    const password = page.getByLabel("Password");

    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(password).toHaveAttribute("aria-invalid", "true");

    // The message must be wired to the input, so a screen reader reads it out.
    const emailMessageId = await email.getAttribute("aria-describedby");
    expect(emailMessageId).toBeTruthy();
    await expect(page.locator(`#${emailMessageId}`)).toHaveText(
      "That doesn't look like an email address.",
    );
    await expect(page.locator(`#${emailMessageId}`)).toHaveAttribute(
      "role",
      "alert",
    );
  });

  test("keeps what was typed when the submit fails", async ({ page }) => {
    await page.getByLabel("First name").fill("Alex");
    await page.getByLabel("Email").fill("alex@school.edu");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByLabel("Password")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.getByLabel("First name")).toHaveValue("Alex");
    await expect(page.getByLabel("Email")).toHaveValue("alex@school.edu");
  });

  test("a valid submit in preview mode names the missing keys", async ({
    page,
  }) => {
    await page.getByLabel("First name").fill("Alex");
    await page.getByLabel("Email").fill("alex@school.edu");
    await page.getByLabel("Password").fill("correcthorse");
    await page.getByRole("button", { name: "Create account" }).click();

    const alert = page.locator('form p[role="alert"]');
    await expect(alert).toContainText("NEXT_PUBLIC_SUPABASE_URL");
    await expect(alert).toContainText("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    await expect(alert).toContainText(".env.local");
  });

  test("a valid field shows its hint rather than an error", async ({ page }) => {
    const password = page.getByLabel("Password");

    await expect(password).not.toHaveAttribute("aria-invalid", "true");
    const messageId = await password.getAttribute("aria-describedby");
    await expect(page.locator(`#${messageId}`)).toHaveText(
      "At least 8 characters.",
    );
  });

  test("sends the browser timezone along with the form", async ({ page }) => {
    const timezone = page.locator('input[name="timezone"]');

    await expect(timezone).toHaveCount(1);
    // Populated on mount from Intl, so the profile gets the right "today".
    await expect
      .poll(async () => (await timezone.inputValue()).length)
      .toBeGreaterThan(0);
  });
});
