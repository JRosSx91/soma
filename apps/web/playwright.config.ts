import { defineConfig, devices } from "@playwright/test";
import {
  assertSafeApiHint,
  assertSafeE2eOrigin,
  DEFAULT_E2E_ORIGIN,
} from "./e2e/lib/safe-env.js";

/**
 * Q-E2E-1: Chromium-only DEMO smoke against a local Vite Preview build.
 * Fail-closed: refuses non-loopback base URLs and unsafe API hints before browsers start.
 */
const safe = assertSafeE2eOrigin(process.env.E2E_BASE_URL ?? DEFAULT_E2E_ORIGIN);
assertSafeApiHint(process.env.E2E_API_URL);
assertSafeApiHint(process.env.VITE_API_URL);

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  outputDir: "test-results",
  use: {
    baseURL: safe.origin,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    locale: "es-ES",
    timezoneId: "Europe/Madrid",
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
    // Prevent SW from bypassing Playwright request interception.
    serviceWorkers: "block",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Always build under this process env (empty API URL) and bind with --strictPort.
    // reuseExistingServer: false → a process already on 4173 fails closed (no foreign preview).
    command:
      "pnpm run build && pnpm exec vite preview --host 127.0.0.1 --port 4173 --strictPort",
    url: `${safe.origin}/preview`,
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      ...process.env,
      // Vite does not overwrite existing process.env from .env* files.
      VITE_API_URL: "",
      E2E_BASE_URL: safe.origin,
      // Disables the localhost:3000 preview proxy in vite.config.ts for this server.
      SOMA_E2E_PREVIEW: "1",
    },
  },
});
