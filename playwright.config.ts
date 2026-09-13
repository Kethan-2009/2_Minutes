import { defineConfig, devices } from "@playwright/test";

const PORT = 2000;
const baseURL = `http://localhost:${PORT}`;

/**
 * Normally Playwright uses the Chromium it downloaded via `npx playwright
 * install`. Set PLAYWRIGHT_CHROMIUM_PATH to point at an existing binary
 * instead — useful in sandboxes and CI images that already ship one.
 */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;

/**
 * End-to-end tests run against preview mode — no Supabase project, no secrets.
 *
 * That is the point: routing, validation, accessibility and the not-connected
 * path are all exercised in CI without anyone having to provision a database or
 * store a credential. Flows that need a real session (logging in, resetting a
 * password) are not covered here and need a test project.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "list" : [["list"], ["html", { open: "never" }]],
  // The dev server compiles routes lazily, so the first hit on a cold route can
  // take several seconds. The default 5s assertion timeout makes that look like
  // a failure on a fresh checkout — which is exactly how CI always runs.
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], launchOptions: { executablePath } },
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], launchOptions: { executablePath } },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Deliberately no Supabase env: these tests assert preview-mode behaviour.
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    },
  },
});
