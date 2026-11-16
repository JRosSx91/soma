/**
 * Local review screenshots for SUP-02C.
 * Requires SUPPORT_CRAVING_TOOL_ENABLED=true in the built bundle.
 * Opens via hub button (no ?tool= URL). Does not flip the gate.
 * Screenshots the companion article after scroll-into-view (avoids dock crop).
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "../../../docs/review/support/sup-02c-screens");
mkdirSync(outDir, { recursive: true });

const origin = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";
const steps = ["welcome", "ground", "observe", "choose", "close"];

async function expectNoToolInUrl(page) {
  const url = page.url();
  if (url.includes("tool=") || url.includes("craving.companion")) {
    throw new Error(`Sensitive tool id leaked into URL: ${url}`);
  }
}

async function openCompanion(page) {
  await page.goto(`${origin}/preview/support`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.setItem("soma.i18n.lang", "es"));
  await page.reload({ waitUntil: "networkidle" });
  await page.locator('[data-tool="craving"][data-tool-state="available"] button').click();
  const companion = page.locator("[data-craving-companion]");
  await companion.waitFor();
  await companion.scrollIntoViewIfNeeded();
  await expectNoToolInUrl(page);
  return companion;
}

async function shoot(page, companion, path) {
  await companion.scrollIntoViewIfNeeded();
  // Hide fixed mobile dock for a clean crop of the accompaniment surface.
  await page.addStyleTag({
    content: `
      nav[aria-label], [data-preview-mobile-nav], footer { visibility: hidden !important; }
    `,
  });
  await companion.screenshot({ path, animations: "disabled" });
}

async function capture(page, viewport, label) {
  await page.setViewportSize(viewport);
  const companion = await openCompanion(page);

  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i];
    await page.waitForSelector(`[data-craving-step="${step}"]`);
    await expectNoToolInUrl(page);
    await shoot(
      page,
      companion,
      join(outDir, `${label}-step-${i + 1}-${step}.png`),
    );
    if (step === "welcome") {
      await page.locator('[data-craving-nav="start"]').click();
    } else if (step === "ground" || step === "observe") {
      await page.locator('[data-craving-nav="continue"]').click();
    } else if (step === "choose") {
      await page.locator('[data-craving-choice="breathing"]').click();
      await page.locator('[data-craving-nav="continue"]').click();
    }
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();
await capture(page, { width: 375, height: 900 }, "mobile-375");
await capture(page, { width: 1440, height: 1100 }, "desktop-1440");
await browser.close();
console.log(`Wrote screenshots under ${outDir}`);
