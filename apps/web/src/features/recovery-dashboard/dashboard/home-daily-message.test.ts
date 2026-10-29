import assert from "node:assert/strict";
import { test } from "node:test";
import enRecovery from "../../../i18n/locales/en/recovery.json" with { type: "json" };
import esRecovery from "../../../i18n/locales/es/recovery.json" with { type: "json" };
import { pickDailyMessage, readDailyMessages } from "./home-daily-message.ts";

const ORIGINAL_ES = [
  "Hoy basta con dar el siguiente paso.",
  "Estar aquí ya es una forma de avanzar.",
  "Un día cada vez. Eso es el camino.",
  "La constancia discreta también es valentía.",
  "No hace falta que hoy sea perfecto. Hace falta que sea tuyo.",
  "Lo que eliges en silencio también suma.",
  "Sigue a tu ritmo. El día cuenta igual.",
  "Cuidar este día es construir el siguiente.",
] as const;

const ORIGINAL_EN = [
  "Today it is enough to take the next step.",
  "Being here is already a way of moving forward.",
  "One day at a time. That is the path.",
  "Quiet consistency is also courage.",
  "Today does not need to be perfect. It needs to be yours.",
  "What you choose in silence still counts.",
  "Keep your own pace. The day still counts.",
  "Looking after this day is building the next one.",
] as const;

test("daily message is stable for the same local day", () => {
  const messages = ["a", "b", "c", "d"];
  const morning = new Date(2026, 9, 21, 8, 15);
  const night = new Date(2026, 9, 21, 23, 50);
  assert.equal(pickDailyMessage(messages, morning), pickDailyMessage(messages, night));
  assert.notEqual(pickDailyMessage(messages, morning, 0), pickDailyMessage(messages, morning, 1));
});

test("spanish and english daily collections share length and index", () => {
  const es = readDailyMessages(esRecovery.homeDailyMessages);
  const en = readDailyMessages(enRecovery.homeDailyMessages);
  assert.equal(es.length, 60);
  assert.equal(en.length, 60);
  assert.deepEqual(es.slice(0, 8), [...ORIGINAL_ES]);
  assert.deepEqual(en.slice(0, 8), [...ORIGINAL_EN]);
  const now = new Date(2026, 9, 21);
  const esPick = pickDailyMessage(es, now);
  const enPick = pickDailyMessage(en, now);
  assert.equal(es.indexOf(esPick ?? ""), en.indexOf(enPick ?? ""));
  assert.notEqual(esPick, enPick);
});

test("daily collections have no empty or duplicate lines", () => {
  for (const [label, raw] of [
    ["es", esRecovery.homeDailyMessages],
    ["en", enRecovery.homeDailyMessages],
  ] as const) {
    const messages = readDailyMessages(raw);
    assert.equal(messages.length, 60, label);
    assert.equal(
      messages.every((item) => item.trim().length > 0),
      true,
      label,
    );
    assert.equal(new Set(messages).size, messages.length, label);
  }
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
