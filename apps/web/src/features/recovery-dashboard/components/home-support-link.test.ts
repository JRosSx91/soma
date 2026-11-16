import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enRecovery from "../../../i18n/locales/en/recovery.json" with { type: "json" };
import esRecovery from "../../../i18n/locales/es/recovery.json" with { type: "json" };
import { shellSections } from "../shell-base.js";
import { SUPPORT_CRAVING_TOOL_ENABLED } from "../support/support-craving-tool.js";
import { SUPPORT_ENABLED_STRATEGY_IDS } from "../support/support-strategies.js";

const home = readFileSync(new URL("./PreviewHome.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");

test("home links to Support inside the active shell base", () => {
  assert.match(home, /const supportTo = `\$\{base\}\/support`;/);
  assert.match(home, /<SupportAccessCard supportTo=\{supportTo\} \/>/);
  assert.match(home, /data-home-support/);
  assert.match(home, /<Link[\s\S]*to=\{supportTo\}/);
  assert.match(home, /t\("homeSupportTitle"\)/);
  assert.match(home, /t\("homeSupportBody"\)/);
  assert.match(home, /t\("homeSupportCta"\)/);
  assert.match(home, /<HeartHandshake className="h-5 w-5" \/>/);
  assert.doesNotMatch(home, /craving\.companion|relapse\.prevention|\?tool=/);
});

test("support card stays available without recovery substances", () => {
  assert.match(home, /dashboard\.error[\s\S]*SupportAccessCard/);
  assert.match(home, /emptyUsages[\s\S]*SupportAccessCard/);
  assert.match(home, /substances\.length === 0[\s\S]*SupportAccessCard/);
});

test("support route exists for both DEMO and LIVE shells", () => {
  assert.match(app, /path="support" element=\{<SupportPage \/>\}/);
  assert.match(app, /<Route path="\/preview">[\s\S]*\{soma2Pages\}/);
  assert.match(app, /<Route path="\/app">[\s\S]*\{soma2Pages\}/);
  for (const base of ["/preview", "/app"] as const) {
    const support = shellSections(base).find((item) => item.id === "apoyo");
    assert.equal(support?.to, `${base}/support`);
    assert.equal(support?.icon, "heartHandshake");
    assert.equal(support?.more, true);
  }
});

test("home support copy exists in spanish and english", () => {
  assert.equal(esRecovery.homeSupportTitle, "¿Necesitas un momento para ti?");
  assert.equal(esRecovery.homeSupportBody, "Encuentra herramientas y recursos para acompañarte en los días difíciles.");
  assert.equal(esRecovery.homeSupportCta, "Ir a Apoyo");
  assert.equal(enRecovery.homeSupportTitle, "Need a moment for yourself?");
  assert.equal(enRecovery.homeSupportBody, "Find tools and resources to support you through difficult days.");
  assert.equal(enRecovery.homeSupportCta, "Go to Support");
});

test("SUP-02D remains hub-only while SUP-02B/C stay independently gated", () => {
  assert.equal(SUPPORT_CRAVING_TOOL_ENABLED, true);
  assert.equal(
    (SUPPORT_ENABLED_STRATEGY_IDS as readonly string[]).includes("relapse.prevention"),
    true,
  );
  assert.match(home, /data-home-support/);
  assert.doesNotMatch(home, /craving\.companion|after\.use\.companion|relapse\.prevention/);
});
