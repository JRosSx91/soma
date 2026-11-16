/**
 * Controlled local QA for SUP-02E when SUPPORT_AFTER_USE_TOOL_ENABLED=true.
 * DEMO hub only (no real profile / production). Does not flip the gate.
 */
import { chromium } from "@playwright/test";

const origin = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(`${origin}/preview/support`, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.setItem("soma.i18n.lang", "es"));
await page.reload({ waitUntil: "networkidle" });

const card = page.locator('[data-tool="afterUse"][data-tool-state="available"] button');
assert(await card.count(), "afterUse card must be available when gate is true");
await card.click();
await page.waitForSelector("[data-after-use-companion]");
assert(!(await page.url()).includes("tool="), "URL must not contain tool=");
assert(!(await page.url()).includes("after.use"), "URL must not contain product id");

await page.waitForSelector('[data-after-use-step="welcome"]');
assert(await page.locator("[data-after-use-emergency]").count(), "emergency banner required");
assert(
  await page.getByText("Tu camino no empieza de cero").count(),
  "welcome title missing",
);

await page.locator('[data-after-use-nav="exit"]').click();
await page.waitForSelector('[data-tool="afterUse"]');
assert((await page.locator("[data-after-use-companion]").count()) === 0, "exit must close companion");

await page.locator('[data-tool="afterUse"][data-tool-state="available"] button').click();
await page.waitForSelector('[data-after-use-step="welcome"]');
await page.locator('[data-after-use-nav="continue"]').click();
await page.waitForSelector('[data-after-use-step="care"]');
assert(await page.getByText(/Prioriza tu seguridad/).count(), "care safety copy missing");
for (const step of ["recognize", "forward", "close"]) {
  await page.locator('[data-after-use-nav="continue"]').click();
  await page.waitForSelector(`[data-after-use-step="${step}"]`);
}
await page.locator('[data-after-use-nav="help"]').click();
await page.waitForURL(/\/preview\/support/);
assert((await page.locator("[data-after-use-companion]").count()) === 0, "help must return to hub");

await page.goto(`${origin}/preview/support?tool=after.use.companion`, {
  waitUntil: "networkidle",
});
assert((await page.locator("[data-after-use-companion]").count()) === 0, "query must not open");
assert(!(await page.url()).includes("tool="), "tool query must be stripped");

await browser.close();
console.log("SUP-02E controlled DEMO validation OK");
