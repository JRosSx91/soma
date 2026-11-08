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

test("invite notes keep public beta and do not say closed beta", () => {
  assert.match(es.hero.ctaInviteNote, /beta pública/);
  assert.match(en.hero.ctaInviteNote, /public beta/i);
  assert.match(es.closing.ctaInviteNote, /beta pública/);
  assert.match(en.closing.ctaInviteNote, /public beta/i);
  assert.doesNotMatch(es.hero.ctaInviteNote, /cerrada/);
  assert.doesNotMatch(en.hero.ctaInviteNote, /closed beta/i);
  assert.doesNotMatch(es.closing.ctaInviteNote, /cerrada/);
  assert.doesNotMatch(en.closing.ctaInviteNote, /closed beta/i);
});
