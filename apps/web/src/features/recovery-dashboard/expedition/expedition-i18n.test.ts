import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enExpedition from "../../../i18n/locales/en/expedition.json" with { type: "json" };
import esExpedition from "../../../i18n/locales/es/expedition.json" with { type: "json" };

const config = readFileSync(new URL("../../../i18n/config.ts", import.meta.url), "utf8");

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (value == null || typeof value !== "object") return prefix ? [prefix] : [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    flattenKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
}

test("ES and EN expedition catalogs share keys and cover GAME-07 chrome", () => {
  assert.deepEqual(flattenKeys(esExpedition).sort(), flattenKeys(enExpedition).sort());
  for (const key of flattenKeys(esExpedition)) {
    const es = key.split(".").reduce<unknown>((acc, part) => {
      return acc != null && typeof acc === "object"
        ? (acc as Record<string, unknown>)[part]
        : undefined;
    }, esExpedition);
    const en = key.split(".").reduce<unknown>((acc, part) => {
      return acc != null && typeof acc === "object"
        ? (acc as Record<string, unknown>)[part]
        : undefined;
    }, enExpedition);
    assert.equal(typeof es, "string", key);
    assert.equal(typeof en, "string", key);
    assert.ok(String(es).length > 0, key);
    assert.ok(String(en).length > 0, key);
  }
  assert.match(config, /"expedition"/);
  assert.match(config, /enExpedition/);
  assert.match(config, /esExpedition/);
  assert.equal(config.includes("expedicion-3.0"), false);
});

test("expedition copy is not clinical and does not invent mockup ratios", () => {
  const es = JSON.stringify(esExpedition);
  const en = JSON.stringify(enExpedition);
  assert.equal(es.includes("6/12"), false);
  assert.equal(en.includes("18 / 48"), false);
  assert.equal(es.toLowerCase().includes("culpa"), false);
  assert.match(esExpedition.pageDescription, /ritmo/);
  assert.match(enExpedition.pageDescription, /pace/);
  assert.match(esExpedition.nodeNeurotransmittersDesc, /neurotransmisores/);
  assert.match(enExpedition.nodeOrientationDesc, /atlas/i);
  assert.match(esExpedition.statsRegion, /Indicadores/);
  assert.match(esExpedition.journeyIntro, /Cinco destinos/);
  assert.match(enExpedition.journeyIntro, /Five destinations/);
  assert.match(esExpedition.mapSwipeHint, /Desliza/);
  assert.match(enExpedition.mapSwipeHint, /Swipe/);
});
