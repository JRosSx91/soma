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
  assert.equal(es.chartTitle, "Avance de las curvas educativas");
  assert.equal(en.chartTitle, "Educational curve progress");
  assert.equal(es.chartYAxis, "Avance de la curva educativa (%)");
  assert.equal(en.chartYAxis, "Educational curve progress (%)");
  assert.equal(es.chartOverview, "Mostrar todas las curvas");
  assert.equal(en.chartOverview, "Show all curves");
  assert.equal(es.axis1Year, "365 días");
  assert.equal(en.axis1Year, "365 days");
  assert.equal(
    es.chartCurveNote,
    "Los porcentajes indican el avance de cada curva matemática educativa, no cuánto se ha recuperado tu organismo ni una concentración de neurotransmisores.",
  );
  assert.equal(
    en.chartCurveNote,
    "Percentages show progress along each educational mathematical curve, not how much your body has recovered and not a neurotransmitter concentration.",
  );
  assert.equal(
    es.chartSubtitle,
    "Cada porcentaje es el avance de una curva matemática educativa del catálogo. No es una recuperación individual, ni un estado clínico, ni una medición fisiológica.",
  );
  assert.equal(
    en.chartSubtitle,
    "Each percentage is progress along an educational mathematical curve from the catalog. It is not individual recovery, a clinical status, or a physiological measurement.",
  );
  assert.equal(
    fillRecoveryTemplate(es.todayCurveLegend, { today: "Hoy", percent: 46 }),
    "Hoy · 46 % de la curva",
  );
  assert.equal(
    fillRecoveryTemplate(en.todayCurveLegend, { today: "Today", percent: 46 }),
    "Today · 46% of the curve",
  );
  assert.equal(
    fillRecoveryTemplate(es.recoveryNextMilestoneDays, { current: 42, target: 60 }),
    "42 de 60 días hacia el próximo hito",
  );
  assert.equal(
    fillRecoveryTemplate(en.recoveryNextMilestoneDays, { current: 42, target: 60 }),
    "42 of 60 days toward the next milestone",
  );
  assert.equal(SPANISH_RECOVERY_COPY.day365, es.day365);
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
  assert.equal(es.statusMixed, "Situación mixta");
  assert.equal(en.statusMixed, "Mixed status");
  assert.equal(
    es.organBodyMixed,
    "Hay sustancias con consumo activo y otras con abstinencia registrada. No mostramos un avance conjunto.",
  );
  assert.equal(
    en.organBodyMixed,
    "Some substances are recorded as active use and others with registered abstinence. We do not show a combined advance.",
  );
  assert.equal(
    es.organEstimatePartial,
    "Esta estimación solo incluye las sustancias con una fecha de último consumo registrada y una trayectoria calculable.",
  );
  assert.equal(
    en.organEstimatePartial,
    "This estimate only includes substances with a recorded last-use date and a calculable trajectory.",
  );
  assert.equal(SPANISH_RECOVERY_COPY.statusMixed, es.statusMixed);
  assert.equal(SPANISH_RECOVERY_COPY.organBodyMixed, es.organBodyMixed);
  assert.doesNotMatch(es.organBodyActive, /0\s*%/);
  assert.doesNotMatch(en.organBodyActive, /0\s*%/);
  assert.equal(es.unavailable, "Fecha pendiente");
  assert.equal(en.unavailable, "Date not provided");
  assert.equal(SPANISH_RECOVERY_COPY.activeShort, es.activeShort);
  assert.equal(SPANISH_RECOVERY_COPY.unavailable, es.unavailable);
  assert.equal(SPANISH_RECOVERY_COPY.phaseActive, es.phaseActive);
  assert.equal(SPANISH_RECOVERY_COPY.phaseMissingDate, es.phaseMissingDate);
  assert.equal(SPANISH_RECOVERY_COPY.todayCurveLegend, es.todayCurveLegend);
  assert.equal(SPANISH_RECOVERY_COPY.axisLabels[4], "365 días");
  assert.equal(
    es.liveFootnoteOverlay,
    "Como las sustancias tienen distintos días de abstinencia, no podemos señalar un único «hoy» en el gráfico.",
  );
  assert.equal(
    en.liveFootnoteOverlay,
    "Each substance has a different number of days since last use, so we can't show a single ‘today’ on the chart.",
  );
  assert.notEqual(es.liveFootnote, es.liveFootnoteOverlay);
  assert.match(es.demoFootnote, /demostración/);
  assert.match(en.demoFootnote, /Demonstration/);
  assert.match(es.demoFootnote, /hoy.*compartido/i);
  assert.match(en.demoFootnote, /shared “today”/);
  assert.doesNotMatch(es.demoFootnote, /posición ficticia/);
  assert.doesNotMatch(en.demoFootnote, /fictional mockup position/);
  assert.equal(es.demoFootnote, SPANISH_RECOVERY_COPY.demoFootnote);
  assert.equal(esRecovery.demoChartNoSeries.includes("{{percent}}"), false);
  assert.equal(enRecovery.demoChartNoSeries.includes("{{percent}}"), false);
  assert.match(es.liveFootnote, /días reales/);
  assert.match(en.liveFootnote, /real days/);
  assert.match(es.demoFootnote, /Modelo: día 365/);
  assert.match(en.demoFootnote, /Model: day 365/);
  assert.doesNotMatch(es.demoFootnote, /medición clínica/);
  assert.doesNotMatch(en.demoFootnote, /clinical measurement/);
  assert.doesNotMatch(es.liveFootnoteOverlay, /medición clínica/);
  assert.doesNotMatch(en.liveFootnoteOverlay, /clinical measurement/);
});
