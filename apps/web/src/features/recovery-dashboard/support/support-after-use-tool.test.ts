import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { shouldOfferAfterUseSupport } from "./after-use-offer.js";
import {
  getSupportAfterUseContent,
  supportAfterUseContent,
} from "./support-after-use-content.js";
import {
  SUPPORT_AFTER_USE_COMPANION_ID,
  SUPPORT_AFTER_USE_CONTENT_VERSION,
  SUPPORT_AFTER_USE_CLINICAL_STATUS,
  SUPPORT_AFTER_USE_EDITORIAL_STATUS,
  SUPPORT_AFTER_USE_IMPLEMENTATION_STATUS,
  SUPPORT_AFTER_USE_PUBLICATION_GATE,
  SUPPORT_AFTER_USE_PUBLICATION_STATUS,
  SUPPORT_AFTER_USE_TOOL_ENABLED,
  consumeAfterUseCompanionOpenRequest,
  isSupportAfterUseToolEnabled,
  requestAfterUseCompanionOpen,
  resetAfterUseCompanionOpenRequest,
} from "./support-after-use-tool.js";
import { SUPPORT_CRAVING_TOOL_ENABLED } from "./support-craving-tool.js";
import { SUPPORT_ENABLED_STRATEGY_IDS } from "./support-strategies.js";

test("after-use companion stays unpublished until independent authorization", () => {
  assert.equal(SUPPORT_AFTER_USE_TOOL_ENABLED, false);
  assert.equal(isSupportAfterUseToolEnabled(), false);
  assert.equal(SUPPORT_AFTER_USE_PUBLICATION_STATUS, "unpublished");
  assert.equal(SUPPORT_AFTER_USE_PUBLICATION_GATE, "pending_independent_authorization");
  assert.equal(SUPPORT_AFTER_USE_IMPLEMENTATION_STATUS, "implemented");
  assert.equal(SUPPORT_AFTER_USE_EDITORIAL_STATUS, "pending");
  assert.equal(SUPPORT_AFTER_USE_CLINICAL_STATUS, "pending");
  assert.equal(SUPPORT_AFTER_USE_CONTENT_VERSION, "0.1.0");
  assert.equal(SUPPORT_AFTER_USE_COMPANION_ID, "after.use.companion");
});

test("SUP-02E does not publish SUP-02B or SUP-02C", () => {
  assert.equal(SUPPORT_CRAVING_TOOL_ENABLED, false);
  assert.equal(
    (SUPPORT_ENABLED_STRATEGY_IDS as readonly string[]).includes("relapse.prevention"),
    false,
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

test("ES/EN after-use content stays educational and claims XP preservation carefully", () => {
  const es = getSupportAfterUseContent("es");
  const en = getSupportAfterUseContent("en");
  assert.equal(es.steps.welcome.title, "Tu camino no empieza de cero");
  assert.equal(en.steps.welcome.title, "Your path does not start from zero");
  assert.equal(es.invitePrompt, "¿Te gustaría recibir apoyo en este momento?");
  assert.equal(en.invitePrompt, "Would you like support right now?");
  assert.match(es.steps.welcome.body.join("\n"), /logros y el XP/);
  assert.match(en.steps.welcome.body.join("\n"), /achievements and XP/);
  assert.doesNotMatch(es.invitePrompt, /\brecaída\b/);
  assert.doesNotMatch(en.invitePrompt, /\brelapse\b/i);
  assert.match(es.inviteNote, /No clasifica ese cambio como una recaída/);
  assert.match(en.inviteNote, /does not classify that change as a relapse/i);
  assert.equal(Object.keys(supportAfterUseContent.es.steps).length, 2);
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
  assert.match(onboarding, /requestAfterUseCompanionOpen/);
  assert.match(onboarding, /navigate\("\/app\/support", \{ replace: true \}\)/);
  assert.doesNotMatch(onboarding, /location\.state|openAfterUseCompanion/);
  assert.match(onboarding, /data-after-use-invite/);

  const tool = readFileSync(new URL("./AfterUseCompanionTool.tsx", import.meta.url), "utf8");
  assert.match(tool, /data-after-use-companion/);
  assert.match(tool, /data-after-use-emergency/);
  assert.match(tool, /state=\{somiState\}/);
  assert.doesNotMatch(tool, /fetch\(|grantAchievement|telemetry|analytics/i);
});
