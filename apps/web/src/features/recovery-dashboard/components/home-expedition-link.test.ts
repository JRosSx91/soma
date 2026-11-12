import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enRecovery from "../../../i18n/locales/en/recovery.json" with { type: "json" };
import esRecovery from "../../../i18n/locales/es/recovery.json" with { type: "json" };
import { shellSections } from "../shell-base.js";

const home = readFileSync(new URL("./PreviewHome.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");

test("home links to the expedition inside the active shell base", () => {
  assert.match(home, /const expeditionTo = `\$\{base\}\/expedition`;/);
  assert.match(home, /<HorizonCard message=\{horizonMessage\} expeditionTo=\{expeditionTo\} \/>/);
  assert.match(home, /<Link to=\{expeditionTo\}/);
  assert.match(home, /t\("homeExpeditionCta"\)/);
  assert.match(home, /<Mountain className="h-4 w-4" aria-hidden="true" \/>/);
});

test("expedition route exists for both DEMO and LIVE shells", () => {
  assert.match(app, /path="expedition" element=\{<ExpeditionPage \/>\}/);
  assert.match(app, /<Route path="\/preview">[\s\S]*\{soma2Pages\}/);
  assert.match(app, /<Route path="\/app">[\s\S]*\{soma2Pages\}/);
  for (const base of ["/preview", "/app"] as const) {
    const expedition = shellSections(base).find((item) => item.id === "expedicion");
    assert.equal(expedition?.to, `${base}/expedition`);
    assert.equal(expedition?.icon, "mountain");
  }
});

test("home expedition copy exists in spanish and english", () => {
  assert.equal(esRecovery.homeExpeditionCta, "Abrir el Centro de Expedición");
  assert.equal(enRecovery.homeExpeditionCta, "Open the Expedition centre");
});
