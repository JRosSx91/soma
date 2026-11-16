/**
 * Local review screenshots for SUP-02E.
 * Companion shots require SUPPORT_AFTER_USE_TOOL_ENABLED=true in the built bundle.
 * Hub planned card can be captured with the gate false.
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "../../../docs/review/support/sup-02e-screens");
mkdirSync(outDir, { recursive: true });

const origin = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";

async function shoot(page, path) {
  await page.addStyleTag({
    content: `nav[aria-label], [data-preview-mobile-nav], footer { visibility: hidden !important; }`,
  });
  const companion = page.locator("[data-after-use-companion]");
  if (await companion.count()) {
    await companion.screenshot({ path, animations: "disabled" });
    return;
  }
  const card = page.locator('[data-tool="afterUse"]');
  await card.scrollIntoViewIfNeeded();
  await page.screenshot({ path, animations: "disabled" });
}

async function capture(page, viewport, label) {
  await page.setViewportSize(viewport);
  await page.goto(`${origin}/preview/support`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.setItem("soma.i18n.lang", "es"));
  await page.reload({ waitUntil: "networkidle" });

  const available = page.locator('[data-tool="afterUse"][data-tool-state="available"] button');
  if (await available.count()) {
    await available.click();
    await page.waitForSelector("[data-after-use-companion]");
    await shoot(page, join(outDir, `${label}-step-1-welcome.png`));
    await page.locator('[data-after-use-nav="continue"]').click();
    await page.waitForSelector('[data-after-use-step="close"]');
    await shoot(page, join(outDir, `${label}-step-2-close.png`));
  } else {
    await shoot(page, join(outDir, `${label}-hub-planned.png`));
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();
await capture(page, { width: 375, height: 900 }, "mobile-375");
await capture(page, { width: 1440, height: 1100 }, "desktop-1440");
await browser.close();
console.log(`Wrote screenshots under ${outDir}`);
