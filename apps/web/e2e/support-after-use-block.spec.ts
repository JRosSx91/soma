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
 * SUP-02E publication + privacy gate:
 * - afterUse stays planned while unpublished
 * - legacy `?tool=after.use.companion` never opens the companion
 */
test.describe("Support after-use publication block", () => {
  let blocked: string[] = [];

  test.beforeEach(async ({ context, page }) => {
    blocked = await installRequestGuard(context);
    await page.addInitScript((langKey: string) => {
      window.localStorage.setItem(langKey, "es");
    }, INTERFACE_LANGUAGE_STORAGE_KEY);
  });

  test("after-use card stays planned and legacy tool query never opens the companion", async ({
    page,
  }) => {
    await page.goto("/preview/support");
    await expect(page).toHaveURL(/\/preview\/support\/?$/);

    const afterUseCard = page.locator('[data-tool="afterUse"]');
    await expect(afterUseCard).toBeVisible();
    await expect(afterUseCard).toHaveAttribute("data-tool-state", "planned");
    await expect(afterUseCard.getByText("Prevista")).toBeVisible();
    await expect(page.locator("[data-after-use-companion]")).toHaveCount(0);

    await page.goto("/preview/support?tool=after.use.companion");
    await expect(page.locator("[data-after-use-companion]")).toHaveCount(0);
    await expect(page).toHaveURL(/\/preview\/support\/?$/);
    await expect(page).not.toHaveURL(/tool=/);
    await expect(page).not.toHaveURL(/after\.use\.companion/);
    await expect(page.locator('[data-tool="afterUse"]')).toHaveAttribute(
      "data-tool-state",
      "planned",
    );

    for (const url of blocked) {
      expect(
        isAllowedE2eRequestUrl(url, safe.origin),
        `allowlist leaked for ${url}`,
      ).toBe(false);
    }
  });
});
