import assert from "node:assert/strict";
import { test } from "node:test";
import enRecovery from "../../../i18n/locales/en/recovery.json" with { type: "json" };
import esRecovery from "../../../i18n/locales/es/recovery.json" with { type: "json" };
import { pickDailyMessage, readDailyMessages } from "./home-daily-message.ts";

test("daily message is stable for the same local day", () => {
  const messages = ["a", "b", "c", "d"];
  const morning = new Date(2026, 9, 21, 8, 15);
  const night = new Date(2026, 9, 21, 23, 50);
  assert.equal(pickDailyMessage(messages, morning), pickDailyMessage(messages, night));
});

test("spanish and english daily collections share length and index", () => {
  const es = readDailyMessages(esRecovery.homeDailyMessages);
  const en = readDailyMessages(enRecovery.homeDailyMessages);
  assert.ok(es.length >= 6);
  assert.equal(es.length, en.length);
  const now = new Date(2026, 9, 21);
  const esPick = pickDailyMessage(es, now);
  const enPick = pickDailyMessage(en, now);
  assert.equal(es.indexOf(esPick ?? ""), en.indexOf(enPick ?? ""));
  assert.notEqual(esPick, enPick);
});

test("daily messages stay non-clinical", () => {
  const pool = [
    ...readDailyMessages(esRecovery.homeDailyMessages),
    ...readDailyMessages(enRecovery.homeDailyMessages),
  ].join(" ");
  for (const token of ["DOI", "clínic", "clinic", "hígado", "liver", "dopamina", "dopamine"]) {
    assert.equal(pool.toLowerCase().includes(token.toLowerCase()), false, token);
  }
});
