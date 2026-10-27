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
  assert.equal(es.recoveryProgressTitle, "Tu progreso");
  assert.equal(es.recoveryEditLastUse, "Editar fecha de última vez");
  assert.equal(
    es.recoveryFocusIntro,
    "Aquí puedes consultar tu progreso temporal, los hitos alcanzados y cómo podrían evolucionar distintos sistemas de tu organismo según la evidencia científica disponible.",
  );
  assert.equal(
    en.recoveryFocusIntro,
    "Here you can explore your time-based progress, the milestones you've reached, and how different systems in your body may evolve according to the available scientific evidence.",
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
  assert.doesNotMatch(panel, /substance\.phase/);
  const chart = readFileSync(new URL("./EvolutionChart.tsx", import.meta.url), "utf8");
  assert.match(chart, /modelNote/);
});
