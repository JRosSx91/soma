import assert from "node:assert/strict";
import { test } from "node:test";
import enRecovery from "../../../i18n/locales/en/recovery.json" with { type: "json" };
import esRecovery from "../../../i18n/locales/es/recovery.json" with { type: "json" };
import {
  fillRecoveryTemplate,
  recoveryCopyFromSource,
  SPANISH_RECOVERY_COPY,
} from "./recovery-copy.js";

test("spanish and english recovery bundles expose the same keys", () => {
  const enKeys = Object.keys(enRecovery).sort();
  const esKeys = Object.keys(esRecovery).sort();
  assert.deepEqual(esKeys, enKeys);
});

test("copy contract follows the active language without mixing fragments", () => {
  const en = recoveryCopyFromSource((key) => (enRecovery as Record<string, string>)[key] ?? key);
  const es = recoveryCopyFromSource((key) => (esRecovery as Record<string, string>)[key] ?? key);
  assert.equal(es.today, "Hoy");
  assert.equal(en.today, "Today");
  assert.match(es.liveFootnote, /del eje/);
  assert.equal(es.liveFootnote.includes("deleje"), false);
  const phaseEs = fillRecoveryTemplate(es.substancePhaseCeilingConfidence, {
    percent: 60,
    confidence: es.confidenceHigh,
  });
  const phaseEn = fillRecoveryTemplate(en.substancePhaseCeilingConfidence, {
    percent: 60,
    confidence: en.confidenceHigh,
  });
  assert.match(phaseEs, /Techo del modelo: 60%/);
  assert.match(phaseEn, /Model ceiling: 60%/);
  assert.match(phaseEs, /confianza alta/);
  assert.match(phaseEn, /confidence high/);
  assert.equal(SPANISH_RECOVERY_COPY.today, es.today);
  assert.equal(es.liveFootnoteOverlay, SPANISH_RECOVERY_COPY.liveFootnoteOverlay);
  assert.match(es.liveFootnoteOverlay, /puntos de referencia/);
  assert.match(en.liveFootnoteOverlay, /checkpoints/);
  assert.notEqual(es.liveFootnote, es.liveFootnoteOverlay);
});
