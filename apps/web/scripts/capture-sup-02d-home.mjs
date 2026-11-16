/**
 * Local review screenshots for SUP-02D home → Support card.
 * Captures DEMO home with bottom nav visible (mobile) to verify no covered controls.
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "../../../docs/review/support/sup-02d-screens");
mkdirSync(outDir, { recursive: true });

const origin = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";

async function shoot(page, viewport, label) {
  await page.setViewportSize(viewport);
  await page.goto(`${origin}/preview`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.setItem("soma.i18n.lang", "es"));
  await page.reload({ waitUntil: "networkidle" });
  const card = page.locator("[data-home-support]");
  await card.waitFor();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await page.screenshot({
    path: join(outDir, `${label}-home-support.png`),
    fullPage: false,
    animations: "disabled",
  });
}

const browser = await chromium.launch();
const page = await browser.newPage();
await shoot(page, { width: 375, height: 812 }, "mobile-375");
await shoot(page, { width: 1440, height: 900 }, "desktop-1440");
await browser.close();
console.log(`Wrote screenshots under ${outDir}`);
