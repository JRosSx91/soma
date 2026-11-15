import { expect, test, type BrowserContext } from "@playwright/test";
import {
  assertSafeE2eOrigin,
  DEFAULT_E2E_ORIGIN,
  isAllowedE2eRequestUrl,
} from "./lib/safe-env.js";

/** Must match `INTERFACE_LANGUAGE_STORAGE_KEY` in `src/i18n/document-language.ts`. */
const INTERFACE_LANGUAGE_STORAGE_KEY = "soma.i18n.lang";

const safe = assertSafeE2eOrigin(process.env.E2E_BASE_URL ?? DEFAULT_E2E_ORIGIN);

async function installRequestGuard(context: BrowserContext): Promise<string[]> {
  const blocked: string[] = [];
  // Context-level route covers every page in the context and must be set
  // before any navigation (installed from beforeEach prior to the test body).
  await context.route("**/*", async (route) => {
    const url = route.request().url();
    if (!isAllowedE2eRequestUrl(url, safe.origin)) {
      blocked.push(url);
      await route.abort("blockedbyclient");
      return;
    }
    await route.continue();
  });
  return blocked;
}

test.describe("DEMO shell smoke", () => {
  let blocked: string[] = [];

  test.beforeEach(async ({ context, page }) => {
    blocked = await installRequestGuard(context);
    await page.addInitScript((langKey: string) => {
      window.localStorage.setItem(langKey, "es");
    }, INTERFACE_LANGUAGE_STORAGE_KEY);
  });

  test("preview → recovery → explore stays in DEMO without auth", async ({
    page,
  }) => {
    await page.goto("/preview");

    await expect(page).toHaveURL(/\/preview\/?$/);
    await expect(
      page.getByRole("navigation", { name: "Secciones" }).first(),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /DEMO/ }).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Mi recuperación" }).first(),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Explorar" }).first()).toBeVisible();

    await page.getByRole("link", { name: "Mi recuperación" }).first().click();
    await expect(page).toHaveURL(/\/preview\/recovery\/?$/);
    await expect(
      page.getByRole("heading", { name: "Tu recorrido de recuperación" }),
    ).toBeVisible();
    await expect(page.getByText("Demostración con recuentos de ejemplo")).toBeVisible();
    await expect(page.getByRole("button", { name: /Cannabis/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Nicotina/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /DEMO/ }).first()).toBeVisible();

    await page.getByRole("link", { name: "Explorar" }).first().click();
    await expect(page).toHaveURL(/\/preview\/explore\/?$/);
    await expect(
      page.getByRole("heading", {
        name: "Conocimiento para tu recuperación.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Sistemas anatómicos" }),
    ).toBeVisible();
    await expect(page.getByText("Sistema nervioso central").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /DEMO/ }).first()).toBeVisible();

    await expect(page).not.toHaveURL(/\/login|\/register|\/app\b/);

    // Fail-closed network: every aborted URL must be outside the SPA allowlist.
    for (const url of blocked) {
      expect(
        isAllowedE2eRequestUrl(url, safe.origin),
        `allowlist leaked for ${url}`,
      ).toBe(false);
    }
    expect(
      blocked.some((url) => /somarecovery|supabase/i.test(url)),
      "DEMO smoke must not attempt production hosts",
    ).toBe(false);
  });
});
