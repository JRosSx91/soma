import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { shouldOfferAfterUseSupport } from "./after-use-offer.js";
import {
  getSupportAfterUseContent,
  supportAfterUseContent,
} from "./support-after-use-content.js";
import {
  AFTER_USE_COMPANION_STEPS,
  SUPPORT_AFTER_USE_COMPANION_ID,
  SUPPORT_AFTER_USE_CONTENT_VERSION,
  SUPPORT_AFTER_USE_CLINICAL_STATUS,
  SUPPORT_AFTER_USE_EDITORIAL_STATUS,
  SUPPORT_AFTER_USE_IMPLEMENTATION_STATUS,
  SUPPORT_AFTER_USE_PUBLICATION_GATE,
  SUPPORT_AFTER_USE_PUBLICATION_STATUS,
  SUPPORT_AFTER_USE_SAFETY_STATUS,
  SUPPORT_AFTER_USE_INVITE_ENABLED,
  SUPPORT_AFTER_USE_TOOL_ENABLED,
  consumeAfterUseCompanionOpenRequest,
  isSupportAfterUseInviteEnabled,
  isSupportAfterUseToolEnabled,
  requestAfterUseCompanionOpen,
  resetAfterUseCompanionOpenRequest,
} from "./support-after-use-tool.js";
import { SUPPORT_CRAVING_TOOL_ENABLED } from "./support-craving-tool.js";
import { SUPPORT_ENABLED_STRATEGY_IDS } from "./support-strategies.js";

test("after-use companion is enabled locally pending production release", () => {
  assert.equal(SUPPORT_AFTER_USE_TOOL_ENABLED, true);
  assert.equal(isSupportAfterUseToolEnabled(), true);
  assert.equal(SUPPORT_AFTER_USE_INVITE_ENABLED, false);
  assert.equal(isSupportAfterUseInviteEnabled(), false);
  assert.equal(SUPPORT_AFTER_USE_PUBLICATION_STATUS, "enabled_pending_production");
  assert.equal(SUPPORT_AFTER_USE_PUBLICATION_GATE, "awaiting_express_production_release");
  assert.equal(SUPPORT_AFTER_USE_IMPLEMENTATION_STATUS, "implemented");
  assert.equal(SUPPORT_AFTER_USE_EDITORIAL_STATUS, "editorial_review_done");
  assert.equal(SUPPORT_AFTER_USE_SAFETY_STATUS, "safety_review_done");
  assert.equal(SUPPORT_AFTER_USE_CLINICAL_STATUS, "external_clinical_validation_not_done");
  assert.equal(SUPPORT_AFTER_USE_CONTENT_VERSION, "0.2.0");
  assert.equal(SUPPORT_AFTER_USE_COMPANION_ID, "after.use.companion");
  assert.deepEqual([...AFTER_USE_COMPANION_STEPS], [
    "welcome",
    "care",
    "recognize",
    "forward",
    "close",
  ]);
});

test("SUP-02 joint release keeps craving and relapse prevention enabled together", () => {
  assert.equal(SUPPORT_CRAVING_TOOL_ENABLED, true);
  assert.equal(
    (SUPPORT_ENABLED_STRATEGY_IDS as readonly string[]).includes("relapse.prevention"),
    true,
  );
});

test("offer heuristic detects relevant diffs without labeling relapse", () => {
  assert.equal(
    shouldOfferAfterUseSupport(
      [{ substanceId: "nicotine", status: "abstinent", lastUseDate: "2026-01-01" }],
      [{ substanceId: "nicotine", status: "active", lastUseDate: null }],
    ),
    true,
  );
  assert.equal(
    shouldOfferAfterUseSupport(
      [{ substanceId: "nicotine", status: "abstinent", lastUseDate: "2026-01-01" }],
      [{ substanceId: "nicotine", status: "abstinent", lastUseDate: "2026-02-01" }],
    ),
    true,
  );
  assert.equal(
    shouldOfferAfterUseSupport(
      [{ substanceId: "nicotine", status: "abstinent", lastUseDate: "2026-02-01" }],
      [{ substanceId: "nicotine", status: "abstinent", lastUseDate: "2026-01-01" }],
    ),
    false,
  );
  assert.equal(
    shouldOfferAfterUseSupport(
      [{ substanceId: "nicotine", status: "active", lastUseDate: null }],
      [{ substanceId: "nicotine", status: "abstinent", lastUseDate: "2026-03-01" }],
    ),
    false,
  );
  assert.equal(
    shouldOfferAfterUseSupport(
      [{ substanceId: "nicotine", status: "abstinent", lastUseDate: "2026-01-01" }],
      [{ substanceId: "nicotine", status: "abstinent", lastUseDate: "2026-01-01" }],
    ),
    false,
  );
  assert.equal(
    shouldOfferAfterUseSupport(
      [],
      [{ substanceId: "nicotine", status: "active", lastUseDate: null }],
    ),
    false,
  );
});

test("ES/EN after-use content matches release copy and safety framing", () => {
  const es = getSupportAfterUseContent("es");
  const en = getSupportAfterUseContent("en");
  assert.equal(es.steps.welcome.title, "Tu camino no empieza de cero");
  assert.equal(en.steps.welcome.title, "Your path does not start from zero");
  assert.equal(es.steps.care.title, "Un momento para cuidarte");
  assert.equal(en.steps.care.title, "A moment to take care of yourself");
  assert.equal(es.steps.recognize.title, "Reconocer lo ocurrido sin juzgarte");
  assert.equal(en.steps.recognize.title, "Acknowledge what happened without judging yourself");
  assert.equal(es.steps.forward.title, "Un pequeño paso hacia adelante");
  assert.equal(en.steps.forward.title, "A small step forward");
  assert.equal(es.invitePrompt, "¿Te gustaría recibir apoyo en este momento?");
  assert.equal(en.invitePrompt, "Would you like support right now?");
  assert.match(es.steps.welcome.body.join("\n"), /logros y el XP/);
  assert.match(en.steps.welcome.body.join("\n"), /achievements and XP/);
  assert.match(es.steps.care.body.join("\n"), /Prioriza tu seguridad/);
  assert.match(en.steps.care.body.join("\n"), /Put your safety first/);
  assert.doesNotMatch(es.steps.care.body.join("\n"), /vaso de agua|beber agua|respiraci[oó]n/i);
  assert.doesNotMatch(en.steps.care.body.join("\n"), /glass of water|drink water|breathing exercise/i);
  assert.doesNotMatch(JSON.stringify(supportAfterUseContent), /guarda(ste)? un registro|saved a (log|record)/i);
  assert.match(es.inviteNote, /No asume que hubo un consumo reciente/);
  assert.match(en.inviteNote, /does not assume recent use/i);
  assert.doesNotMatch(es.invitePrompt, /\brecaída\b/);
  assert.doesNotMatch(en.invitePrompt, /\brelapse\b/i);
  assert.match(es.inviteNote, /no clasifica el cambio como una recaída/i);
  assert.match(en.inviteNote, /does not classify the change as a relapse/i);
  assert.equal(Object.keys(supportAfterUseContent.es.steps).length, 5);
  assert.equal(es.references.length, en.references.length);
});

test("invite hand-off uses one-shot module memory without location.state", () => {
  resetAfterUseCompanionOpenRequest();
  assert.equal(consumeAfterUseCompanionOpenRequest(), false);
  requestAfterUseCompanionOpen();
  assert.equal(consumeAfterUseCompanionOpenRequest(), true);
  assert.equal(consumeAfterUseCompanionOpenRequest(), false);

  const page = readFileSync(new URL("../pages/SupportPage.tsx", import.meta.url), "utf8");
  assert.match(page, /afterUseOpen/);
  assert.match(page, /consumeAfterUseCompanionOpenRequest/);
  assert.match(page, /const requested = consumeAfterUseCompanionOpenRequest\(\)/);
  assert.doesNotMatch(page, /SUPPORT_AFTER_USE_LOCATION_STATE_KEY|openAfterUseCompanion/);
  assert.doesNotMatch(page, /state:\s*\{[^}]*openAfterUse/);
  assert.doesNotMatch(page, /localStorage|sessionStorage|indexedDB/i);

  const onboarding = readFileSync(
    new URL("../../../pages/OnboardingPage.tsx", import.meta.url),
    "utf8",
  );
  assert.match(onboarding, /shouldOfferAfterUseSupport/);
  assert.match(onboarding, /editingExistingTracking/);
  assert.match(onboarding, /isSupportAfterUseInviteEnabled/);
  assert.match(onboarding, /requestAfterUseCompanionOpen/);
  assert.match(onboarding, /navigate\("\/app\/support", \{ replace: true \}\)/);
  assert.doesNotMatch(onboarding, /location\.state|openAfterUseCompanion/);
  assert.match(onboarding, /data-after-use-invite/);
  assert.doesNotMatch(onboarding, /isSupportAfterUseToolEnabled\(\)/);

  const tool = readFileSync(new URL("./AfterUseCompanionTool.tsx", import.meta.url), "utf8");
  assert.match(tool, /data-after-use-companion/);
  assert.match(tool, /data-after-use-emergency/);
  assert.match(tool, /state=\{somiState\}/);
  assert.doesNotMatch(tool, /fetch\(|grantAchievement|telemetry|analytics/i);
});
