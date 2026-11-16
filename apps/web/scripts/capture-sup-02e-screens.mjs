/**
 * Local review screenshots for SUP-02E (gate true).
 * Also captures the Support hub with craving + after-use available.
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "../../../docs/review/support/sup-02e-screens");
const hubOutDir = join(here, "../../../docs/review/support/sup-02-release-screens");
mkdirSync(outDir, { recursive: true });
mkdirSync(hubOutDir, { recursive: true });

const origin = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";

async function shoot(page, path, selector) {
  await page.addStyleTag({
    content: `nav[aria-label], [data-preview-mobile-nav], footer { visibility: hidden !important; }`,
  });
  if (selector) {
    const target = page.locator(selector);
    await target.scrollIntoViewIfNeeded();
    await target.screenshot({ path, animations: "disabled" });
    return;
  }
  await page.screenshot({ path, animations: "disabled", fullPage: true });
}

async function capture(page, viewport, label) {
  await page.setViewportSize(viewport);
  await page.goto(`${origin}/preview/support`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.setItem("soma.i18n.lang", "es"));
  await page.reload({ waitUntil: "networkidle" });

  await shoot(page, join(hubOutDir, `${label}-hub.png`));

  const available = page.locator('[data-tool="afterUse"][data-tool-state="available"] button');
  if (!(await available.count())) {
    throw new Error("afterUse card must be available (gate true)");
  }
  await available.click();
  await page.waitForSelector("[data-after-use-companion]");

  const steps = ["welcome", "care", "recognize", "forward", "close"];
  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    await page.waitForSelector(`[data-after-use-step="${step}"]`);
    await shoot(
      page,
      join(outDir, `${label}-step-${index + 1}-${step}.png`),
      "[data-after-use-companion]",
    );
    if (step !== "close") {
      await page.locator('[data-after-use-nav="continue"]').click();
    }
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();
await capture(page, { width: 375, height: 900 }, "mobile-375");
await capture(page, { width: 1440, height: 1100 }, "desktop-1440");
await browser.close();
console.log(`Wrote screenshots under ${outDir} and ${hubOutDir}`);
