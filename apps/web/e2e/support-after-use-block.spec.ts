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

/**
 * SUP-02E enablement + privacy:
 * - afterUse card is available from the hub
 * - full step path keeps emergency access
 * - legacy `?tool=after.use.companion` never opens the companion
 */
test.describe("Support after-use companion release", () => {
  let blocked: string[] = [];

  test.beforeEach(async ({ context, page }) => {
    blocked = await installRequestGuard(context);
    await page.addInitScript((langKey: string) => {
      window.localStorage.setItem(langKey, "es");
    }, INTERFACE_LANGUAGE_STORAGE_KEY);
  });

  test("after-use opens from hub, walks steps, and legacy tool query never opens", async ({
    page,
  }) => {
    await page.goto("/preview/support");
    await expect(page).toHaveURL(/\/preview\/support\/?$/);

    const afterUseCard = page.locator('[data-tool="afterUse"]');
    await expect(afterUseCard).toBeVisible();
    await expect(afterUseCard).toHaveAttribute("data-tool-state", "available");
    await expect(afterUseCard.getByText("Después de volver a consumir")).toBeVisible();
    await afterUseCard.getByRole("button", { name: /Abrir acompañamiento/i }).click();

    await expect(page.locator("[data-after-use-companion]")).toBeVisible();
    await expect(page.locator("[data-after-use-emergency]")).toBeVisible();
    await expect(page).not.toHaveURL(/tool=/);
    await expect(page).not.toHaveURL(/after\.use\.companion/);
    await expect(page.getByText("Tu camino no empieza de cero")).toBeVisible();

    await page.locator('[data-after-use-nav="continue"]').click();
    await expect(page.locator('[data-after-use-step="care"]')).toBeVisible();
    await expect(page.getByText("Un momento para cuidarte")).toBeVisible();
    await expect(page.getByText(/Prioriza tu seguridad/)).toBeVisible();

    await page.locator('[data-after-use-nav="continue"]').click();
    await expect(page.locator('[data-after-use-step="recognize"]')).toBeVisible();
    await expect(page.getByText("Reconocer lo ocurrido sin juzgarte")).toBeVisible();

    await page.locator('[data-after-use-nav="continue"]').click();
    await expect(page.locator('[data-after-use-step="forward"]')).toBeVisible();
    await expect(page.getByText("Un pequeño paso hacia adelante")).toBeVisible();

    await page.locator('[data-after-use-nav="continue"]').click();
    await expect(page.locator('[data-after-use-step="close"]')).toBeVisible();
    await page.locator('[data-after-use-nav="hub"]').click();
    await expect(page.locator("[data-after-use-companion]")).toHaveCount(0);

    await page.goto("/preview/support?tool=after.use.companion");
    await expect(page.locator("[data-after-use-companion]")).toHaveCount(0);
    await expect(page).toHaveURL(/\/preview\/support\/?$/);
    await expect(page).not.toHaveURL(/tool=/);
    await expect(page).not.toHaveURL(/after\.use\.companion/);
    await expect(page.locator('[data-tool="afterUse"]')).toHaveAttribute(
      "data-tool-state",
      "available",
    );

    for (const url of blocked) {
      expect(
        isAllowedE2eRequestUrl(url, safe.origin),
        `allowlist leaked for ${url}`,
      ).toBe(false);
    }
  });
});
