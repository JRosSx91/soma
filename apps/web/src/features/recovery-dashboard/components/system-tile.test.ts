import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enRecovery from "../../../i18n/locales/en/recovery.json" with { type: "json" };
import esRecovery from "../../../i18n/locales/es/recovery.json" with { type: "json" };
import { demoDashboardSystems } from "../dashboard/demo-dashboard.ts";

test("demo system tiles keep numeric percents and label them as day 365", () => {
  const tile = readFileSync(new URL("./SystemTile.tsx", import.meta.url), "utf8");
  assert.match(tile, /t\("day365"\)/);
  assert.match(tile, /!live \? \(/);
  assert.equal(esRecovery.day365, "día 365");
  assert.equal(enRecovery.day365, "day 365");
  const systems = demoDashboardSystems();
  assert.equal(systems.find((item) => item.id === "nervous")?.endLabel, "68%");
  assert.equal(systems.find((item) => item.id === "cardio")?.endLabel, "72%");
  assert.equal(systems.find((item) => item.id === "respiratory")?.endLabel, "61%");
  assert.doesNotMatch(systems.find((item) => item.id === "nervous")?.endLabel ?? "", /365/);
});

test("tiles without a percent do not carry a day-365 caption in data", () => {
  const systems = demoDashboardSystems();
  for (const system of systems) {
    if (!system.endLabel) {
      assert.equal(system.endLabel, "");
      assert.equal(system.statusLabel, undefined);
    }
  }
  assert.equal(systems.find((item) => item.id === "digestive")?.endLabel, "");
  const tile = readFileSync(new URL("./SystemTile.tsx", import.meta.url), "utf8");
  const captionIndex = tile.indexOf("{!live ? (");
  const percentIndex = tile.indexOf("system.endLabel ?");
  assert.ok(percentIndex >= 0 && captionIndex > percentIndex);
});

test("live tiles do not use the demo day-365 caption", () => {
  const tile = readFileSync(new URL("./SystemTile.tsx", import.meta.url), "utf8");
  const page = readFileSync(new URL("../pages/RecoveryPage.tsx", import.meta.url), "utf8");
  assert.match(page, /live=\{live\}/);
  assert.match(tile, /trajectoryProgressSr/);
  assert.doesNotMatch(tile, /live \? t\("day365"\)/);
});
