/**
 * Controlled local QA for SUP-02C when SUPPORT_CRAVING_TOOL_ENABLED=true in the bundle.
 * Opens via hub button (no URL product id). Does not flip the gate itself.
 */
import { chromium } from "@playwright/test";

const origin = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";
const choiceIds = [
  "leave_setting",
  "contact_person",
  "recall_reasons",
  "safe_activity",
  "breathing",
  "professional",
];

function assertNoSensitiveUrl(page) {
  const url = page.url();
  if (url.includes("tool=") || url.includes("craving.companion")) {
    throw new Error(`Sensitive id in URL: ${url}`);
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();
const requests = [];
page.on("request", (req) => {
  const u = req.url();
  if (!u.startsWith(origin) && !u.startsWith("data:")) requests.push(u);
});

await page.addInitScript(() => {
  localStorage.setItem("soma.i18n.lang", "es");
});
await page.goto(`${origin}/preview/support`, { waitUntil: "networkidle" });
await page.locator('[data-tool="craving"][data-tool-state="available"] button').click();
await page.waitForSelector('[data-craving-step="welcome"]');
assertNoSensitiveUrl(page);

// Full forward path with skip on ground
await page.locator('[data-craving-nav="start"]').click();
await page.waitForSelector('[data-craving-step="ground"]');
await page.locator('[data-craving-nav="skip"]').click();
await page.waitForSelector('[data-craving-step="observe"]');
await page.locator('[data-craving-nav="back"]').click();
await page.waitForSelector('[data-craving-step="ground"]');
await page.locator('[data-craving-nav="continue"]').click();
await page.waitForSelector('[data-craving-step="observe"]');
await page.locator('[data-craving-nav="continue"]').click();
await page.waitForSelector('[data-craving-step="choose"]');

for (const id of choiceIds) {
  await page.locator(`[data-craving-choice="${id}"]`).click();
  await page.waitForSelector(`[data-craving-choice="${id}"][aria-pressed="true"]`);
}
await page.locator('[data-craving-choice="breathing"]').click();
const breathingHref = await page.locator('a[href*="#support-breathing"]').getAttribute("href");
if (!breathingHref || !breathingHref.includes("support")) {
  throw new Error("Breathing link missing");
}
await page.locator('[data-craving-choice="professional"]').click();
await page.locator('[data-craving-nav="continue"]').click();
await page.waitForSelector('[data-craving-step="close"]');

// Restart
await page.locator('[data-craving-action="repeat"]').click();
await page.waitForSelector('[data-craving-step="welcome"]');

// Early exit
await page.locator('[data-craving-nav="start"]').click();
await page.waitForSelector('[data-craving-step="ground"]');
await page.locator('[data-craving-nav="exit"]').click();
await page.waitForSelector('[data-tool="craving"][data-tool-state="available"]');
assertNoSensitiveUrl(page);

// Keyboard / focus: reopen, heading focused, start activatable via keyboard
await page.locator('[data-tool="craving"][data-tool-state="available"] button').click();
await page.waitForSelector('[data-craving-step="welcome"]');
const headingFocused = await page.evaluate(() => {
  const h = document.querySelector("[data-craving-companion] h2");
  return h instanceof HTMLElement && document.activeElement === h;
});
if (!headingFocused) throw new Error("Heading did not receive focus");
await page.locator('[data-craving-nav="start"]').focus();
const startFocused = await page.evaluate(() => {
  const btn = document.querySelector('[data-craving-nav="start"]');
  return btn instanceof HTMLElement && document.activeElement === btn;
});
if (!startFocused) throw new Error("Start control is not keyboard-focusable");
await page.keyboard.press("Enter");
await page.waitForSelector('[data-craving-step="ground"]');
assertNoSensitiveUrl(page);

// Help available without finishing the accompaniment
await page.locator('a', { hasText: "Ver recursos de ayuda" }).first().click();
await page.waitForSelector('[data-tool="craving"]');
assertNoSensitiveUrl(page);

// Persistence checks
const storageProbe = await page.evaluate(() => ({
  localKeys: Object.keys(localStorage).filter((k) => /craving|companion|urge/i.test(k)),
  sessionKeys: Object.keys(sessionStorage).filter((k) => /craving|companion|urge/i.test(k)),
}));
if (storageProbe.localKeys.length || storageProbe.sessionKeys.length) {
  throw new Error(`Unexpected storage keys: ${JSON.stringify(storageProbe)}`);
}

const sensitiveApi = requests.filter((u) => /craving|companion|urge|analytics|telemetry/i.test(u));
if (sensitiveApi.length) {
  throw new Error(`Unexpected outbound requests: ${sensitiveApi.join(", ")}`);
}

await browser.close();
console.log("SUP-02C controlled flow validation OK");
