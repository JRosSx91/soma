import assert from "node:assert/strict";
import { test } from "node:test";
import enRecovery from "../../../i18n/locales/en/recovery.json" with { type: "json" };
import esRecovery from "../../../i18n/locales/es/recovery.json" with { type: "json" };
import { readFileSync } from "node:fs";
import { recoveryTabs } from "../pages-data.ts";
import {
  fillRecoveryTemplate,
  recoveryCopyFromSource,
  SPANISH_RECOVERY_COPY,
} from "./recovery-copy.js";

test("spanish and english recovery bundles expose the same keys", () => {
  const enKeys = Object.keys(enRecovery).sort();
  const esKeys = Object.keys(esRecovery).sort();
  assert.deepEqual(esKeys, enKeys);
  const es = esRecovery as Record<string, string>;
  const en = enRecovery as Record<string, string>;
  assert.equal(es.emptyTitle, "Tu recorrido de recuperación");
  assert.equal(en.emptyTitle, "Your recovery journey");
  assert.equal(es.chartTitle, "Cómo puede evolucionar tu organismo");
  assert.equal(en.chartTitle, "How your body may recover");
});

test("recovery tabs keep internal ids and localize ES/EN labels", () => {
  assert.deepEqual(
    recoveryTabs.map((item) => item.id),
    ["general", "substance", "system", "timeline"],
  );
  assert.deepEqual(
    recoveryTabs.map((item) => item.labelKey),
    ["tabAllSubstances", "tabBySubstance", "tabBySystem", "tabTimeline"],
  );
  const es = esRecovery as Record<string, string>;
  const en = enRecovery as Record<string, string>;
  assert.equal(es.tabAllSubstances, "Todas las sustancias");
  assert.equal(en.tabAllSubstances, "All substances");
  assert.equal(es.tabBySubstance, "Por sustancia");
  assert.equal(en.tabBySubstance, "By substance");
  assert.equal(es.tabBySystem, "Por sistema");
  assert.equal(en.tabBySystem, "By system");
  assert.equal(es.tabTimeline, "Cronología");
  assert.equal(en.tabTimeline, "Timeline");
  const recovery = readFileSync(new URL("../pages/RecoveryPage.tsx", import.meta.url), "utf8");
  const pages = readFileSync(new URL("../pages-data.ts", import.meta.url), "utf8");
  assert.match(recovery, /label: t\(item\.labelKey\)/);
  assert.match(recovery, /options=\{tabOptions\}/);
  assert.equal(pages.includes("Vista general"), false);
  assert.equal(pages.includes("Por sustancia"), false);
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
  assert.equal(es.activeShort, "Consumo activo");
  assert.equal(en.activeShort, "Active use");
  assert.equal(es.unavailable, "Fecha pendiente");
  assert.equal(en.unavailable, "Date not provided");
  assert.equal(SPANISH_RECOVERY_COPY.activeShort, es.activeShort);
  assert.equal(SPANISH_RECOVERY_COPY.unavailable, es.unavailable);
  assert.equal(SPANISH_RECOVERY_COPY.phaseActive, es.phaseActive);
  assert.equal(SPANISH_RECOVERY_COPY.phaseMissingDate, es.phaseMissingDate);
  assert.match(es.liveFootnoteOverlay, /puntos de referencia/);
  assert.match(en.liveFootnoteOverlay, /checkpoints/);
  assert.notEqual(es.liveFootnote, es.liveFootnoteOverlay);
});
