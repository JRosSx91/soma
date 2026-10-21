import assert from "node:assert/strict";
import { test } from "node:test";
import en from "../../i18n/locales/en/landing-v2.json" with { type: "json" };
import es from "../../i18n/locales/es/landing-v2.json" with { type: "json" };

function keysOf(value: unknown, prefix = ""): string[] {
  if (value == null || typeof value !== "object") return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    keysOf(nested, prefix ? `${prefix}.${key}` : key),
  );
}

test("landing-v2 english and spanish bundles expose the same keys", () => {
  assert.deepEqual(keysOf(es).sort(), keysOf(en).sort());
});
