import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import enRecovery from "../../../i18n/locales/en/recovery.json" with { type: "json" };
import esRecovery from "../../../i18n/locales/es/recovery.json" with { type: "json" };

test("recovery 2.0 copy exists in spanish and english", () => {
  const es = esRecovery as Record<string, string>;
  const en = enRecovery as Record<string, string>;
  assert.equal(es.recoveryTimelineTitle, "Tu línea de hitos temporales");
  assert.equal(en.recoveryTimelineTitle, "Your temporal milestone line");
  assert.equal(es.recoveryProgressMedalsValue, "{{count}} / 10");
  assert.equal(en.recoveryProgressMedalsValue, "{{count}} / 10");
  assert.equal(es.recoveryProgressMedals, "Hitos temporales alcanzados");
  assert.equal(en.recoveryProgressMedals, "Temporal milestones reached");
  assert.equal(es.recoveryProgressTitle, "Progreso hacia el próximo hito");
  assert.equal(en.recoveryProgressTitle, "Progress toward the next milestone");
  assert.equal(
    es.recoveryNextMilestoneDays,
    "{{current}} de {{target}} días hacia el próximo hito",
  );
  assert.equal(
    en.recoveryNextMilestoneDays,
    "{{current}} of {{target}} days toward the next milestone",
  );
  assert.equal(es.recoveryEditLastUse, "Editar fecha de última vez");
  assert.equal(
    es.recoveryFocusIntro,
    "Aquí ves el tiempo de abstinencia y los hitos temporales. Las curvas de más abajo son modelos educativos, no una medición de tu organismo.",
  );
  assert.equal(
    en.recoveryFocusIntro,
    "Here you see abstinence time and temporal milestones. The curves below are educational models, not a measurement of your body.",
  );
  assert.equal(en.recoverySeeAtlas, "Open full atlas");
  assert.doesNotMatch(es.recoveryProgressMedals, /nivel/i);
  assert.doesNotMatch(en.recoveryProgressMedals, /level/i);
  assert.doesNotMatch(es.recoveryProgressMedals, /logros conseguidos/i);
  assert.doesNotMatch(es.recoveryProgressNext, /XP/i);
});

test("recovery page composition matches GAME-03B regions", () => {
  const page = readFileSync(new URL("../pages/RecoveryPage.tsx", import.meta.url), "utf8");
  assert.match(page, /demo=\{dashboard\.showDemoBadge\}/);
  assert.match(page, /label: t\(item\.labelKey\)/);
  assert.match(page, /options=\{tabOptions\}/);
  assert.match(page, /tab === "substance" \? \(/);
  assert.match(page, /anatomyExplorerHref/);
  assert.match(page, /to="\/onboarding"/);
  assert.match(page, /embedded/);
  assert.match(page, /highlighted=\{tab === "timeline"\}/);
  assert.equal((page.match(/<TemporalThresholdRail/g) ?? []).length, 1);
  const panel = readFileSync(new URL("./RecoveryFocusPanel.tsx", import.meta.url), "utf8");
  assert.match(panel, /recoveryFocusIntro/);
  assert.match(panel, /recoveryNextMilestoneDays/);
  assert.doesNotMatch(panel, /homeNextMedalDays/);
  assert.doesNotMatch(panel, /substance\.phase/);
  const chart = readFileSync(new URL("./EvolutionChart.tsx", import.meta.url), "utf8");
  assert.match(chart, /modelNote/);
});

test("temporal milestone copy stays distinct from educational curve percents", () => {
  const es = esRecovery as Record<string, string>;
  const en = enRecovery as Record<string, string>;
  assert.match(es.recoveryNextMilestoneDays, /días hacia el próximo hito/);
  assert.match(en.recoveryNextMilestoneDays, /days toward the next milestone/);
  assert.doesNotMatch(es.recoveryNextMilestoneDays, /%/);
  assert.doesNotMatch(en.recoveryNextMilestoneDays, /%/);
  assert.doesNotMatch(es.recoveryProgressTitle, /curva/i);
  assert.doesNotMatch(en.recoveryProgressTitle, /curve/i);
  assert.match(es.chartTitle, /curvas educativas/);
  assert.match(en.chartTitle, /Educational curve/);
  assert.match(es.chartYAxis, /curva educativa/);
  assert.match(en.chartYAxis, /Educational curve progress/);
  assert.match(es.chartCurveNote, /curva matemática educativa/);
  assert.match(en.chartCurveNote, /educational mathematical curve/);
  assert.match(es.chartSubtitle, /No es una recuperación individual/);
  assert.match(en.chartSubtitle, /not individual recovery/);
  assert.doesNotMatch(es.homeNextMedalDays, /hito/);
  assert.equal(es.homeNextMedalDays, "{{current}} / {{target}} días");
  assert.equal(en.homeNextMedalDays, "{{current}} / {{target}} days");
});

test("day-365 legend is labeled as a model checkpoint in ES and EN", () => {
  const es = esRecovery as Record<string, string>;
  const en = enRecovery as Record<string, string>;
  assert.equal(es.day365, "Modelo: día 365");
  assert.equal(en.day365, "Model: day 365");
  assert.match(es.legendYearHint, /Modelo: día 365/);
  assert.match(en.legendYearHint, /Model: day 365/);
  assert.match(es.legendYearHint, /no el día actual de abstinencia/);
  assert.match(en.legendYearHint, /not the current abstinence day/);
  assert.equal(es.axis1Year, "365 días");
  assert.equal(en.axis1Year, "365 days");
});

test("recovery 2.0 copy files do not change math, seeds, or backend adapters", () => {
  const math = readFileSync(
    new URL("../../../../../../packages/shared-types/src/recovery-math.ts", import.meta.url),
    "utf8",
  );
  assert.match(math, /estimatedRecovery: curveProgress \* model\.recoveryCeiling/);
  const panel = readFileSync(new URL("./RecoveryFocusPanel.tsx", import.meta.url), "utf8");
  const chart = readFileSync(new URL("./EvolutionChart.tsx", import.meta.url), "utf8");
  const copy = readFileSync(new URL("../dashboard/recovery-copy.ts", import.meta.url), "utf8");
  for (const source of [panel, chart, copy]) {
    assert.doesNotMatch(source, /recovery-math/);
    assert.doesNotMatch(source, /recovery-curves/);
    assert.doesNotMatch(source, /from ["']@prisma/);
  }
});
