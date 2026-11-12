import assert from "node:assert/strict";
import { test } from "node:test";
import en from "../../i18n/locales/en/onboarding-tour.json" with { type: "json" };
import es from "../../i18n/locales/es/onboarding-tour.json" with { type: "json" };
import { ONB_TOUR_STEP_IDS, ONB_TOUR_STEPS } from "./tour-steps.js";

test("the nav step points to the expedition without adding a step", () => {
  assert.equal(ONB_TOUR_STEPS.length, 9);
  assert.equal(ONB_TOUR_STEP_IDS.includes("expedition" as never), false);
  assert.match(es.steps.nav.body, /En «Más» encontrarás el Centro de Expedición/);
  assert.match(en.steps.nav.body, /Under «More» you will find the Expedition centre/);
  assert.match(es.restartHint, /nueve pasos/);
  assert.match(en.restartHint, /nine-step/);
});
