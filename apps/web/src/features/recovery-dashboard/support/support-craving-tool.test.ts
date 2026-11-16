import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { getSupportCravingContent, supportCravingContent } from "./support-craving-content.js";
import {
  SUPPORT_CRAVING_CLINICAL_STATUS,
  SUPPORT_CRAVING_COMPANION_ID,
  SUPPORT_CRAVING_CONTENT_VERSION,
  SUPPORT_CRAVING_EDITORIAL_STATUS,
  SUPPORT_CRAVING_IMPLEMENTATION_STATUS,
  SUPPORT_CRAVING_PUBLICATION_GATE,
  SUPPORT_CRAVING_PUBLICATION_STATUS,
  SUPPORT_CRAVING_TOOL_ENABLED,
  SUPPORT_TOOL_QUERY_KEY,
  isSupportCravingToolEnabled,
  resolveSupportToolQueryParam,
  writeSupportToolSearchParams,
} from "./support-craving-tool.js";

test("craving companion stays unpublished and never opens from the URL", () => {
  assert.equal(SUPPORT_CRAVING_TOOL_ENABLED, false);
  assert.equal(isSupportCravingToolEnabled(), false);
  assert.equal(SUPPORT_CRAVING_PUBLICATION_STATUS, "unpublished");
  assert.equal(SUPPORT_CRAVING_PUBLICATION_GATE, "pending_independent_authorization");
  assert.equal(SUPPORT_CRAVING_IMPLEMENTATION_STATUS, "implemented");
  assert.equal(SUPPORT_CRAVING_EDITORIAL_STATUS, "editorial_review_done");
  assert.equal(SUPPORT_CRAVING_CLINICAL_STATUS, "pending");
  assert.equal(SUPPORT_CRAVING_CONTENT_VERSION, "0.1.2");
  assert.equal(resolveSupportToolQueryParam(SUPPORT_CRAVING_COMPANION_ID), null);
  assert.equal(resolveSupportToolQueryParam("craving"), null);
  assert.equal(resolveSupportToolQueryParam("breathing"), null);
  assert.equal(resolveSupportToolQueryParam(null), null);

  const params = writeSupportToolSearchParams(
    new URLSearchParams(`${SUPPORT_TOOL_QUERY_KEY}=${SUPPORT_CRAVING_COMPANION_ID}`),
  );
  assert.equal(params.has(SUPPORT_TOOL_QUERY_KEY), false);
});

test("SUP-02B relapse draft gates stay intact", () => {
  const relapse = readFileSync(new URL("./support-relapse-draft-content.ts", import.meta.url), "utf8");
  assert.match(relapse, /editorial_review_done/);
  assert.match(relapse, /pending_independent_authorization/);
  assert.match(relapse, /RELAPSE_PREVENTION_PUBLICATION_STATUS = "unpublished"/);
  const strategies = readFileSync(new URL("./support-strategies.ts", import.meta.url), "utf8");
  assert.match(strategies, /relapse: null/);
  assert.doesNotMatch(strategies, /craving\.companion/);
});

test("ES/EN content parity and editorial corrections", () => {
  const es = getSupportCravingContent("es");
  const en = getSupportCravingContent("en");
  assert.equal(es.steps.welcome.title, "Un momento para ti");
  assert.equal(en.steps.welcome.title, "A moment for you");
  assert.equal(es.steps.close.title, "Un momento dedicado a ti");
  assert.equal(en.steps.close.title, "A moment set aside for you");
  assert.match(es.steps.welcome.body.join("\n"), /No tienes que demostrar nada a nadie/);
  assert.match(en.steps.welcome.body.join("\n"), /You do not have to prove anything to anyone/);
  assert.match(es.steps.observe.body.join("\n"), /No necesitas que el impulso desaparezca/);
  assert.match(en.steps.observe.body.join("\n"), /does not have to disappear/);
  assert.match(es.choices.find((item) => item.id === "recall_reasons")!.afterSelect, /siguiente paso/);
  assert.doesNotMatch(JSON.stringify(supportCravingContent), /No inventamos números/);
  assert.doesNotMatch(JSON.stringify(supportCravingContent), /basta como ancla/);
  assert.equal(es.choices.length, 6);
  assert.equal(en.choices.length, 6);
  assert.equal(es.references.length, 3);
  assert.match(es.choices.find((item) => item.id === "safe_activity")!.body, /sobredosis/);
  assert.match(es.referencesIntro, /no.*clínicamente validada/i);
  assert.match(es.references.find((item) => item.refId === "REF-CR-03")!.scopeNote, /alcohol/i);
});

test("companion source uses in-memory open path and avoids URL product id", () => {
  const source = readFileSync(new URL("./CravingCompanionTool.tsx", import.meta.url), "utf8");
  assert.match(source, /data-craving-companion=""/);
  assert.match(source, /data-craving-emergency/);
  assert.match(source, /data-craving-choices/);
  assert.match(source, /data-craving-nav/);
  assert.match(source, /data-craving-progress/);
  assert.match(source, /data-craving-references/);
  assert.match(source, /max-w-\[45rem\]/);
  assert.match(source, /Somi/);
  assert.match(source, /size="medium"/);
  assert.match(source, /UrgeWaveVisual/);
  assert.match(source, /supportBreathingLocation/);
  assert.match(source, /SUPPORT_HELP_PANEL_HASH/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|IndexedDB|document\.cookie/);
  assert.doesNotMatch(source, /\bXP\b|grantAchievement|telemetry|analytics/i);
  assert.doesNotMatch(source, /fetch\(/);

  const page = readFileSync(new URL("../pages/SupportPage.tsx", import.meta.url), "utf8");
  assert.match(page, /cravingOpen/);
  assert.match(page, /setCravingOpen/);
  assert.match(page, /isSupportCravingToolEnabled/);
  assert.match(page, /writeSupportToolSearchParams/);
  assert.doesNotMatch(page, /resolveSupportToolQueryParam/);

  const sections = readFileSync(new URL("./SupportSections.tsx", import.meta.url), "utf8");
  assert.match(sections, /onOpenCraving/);
  assert.doesNotMatch(sections, /supportCravingCompanionHref|\?tool=/);

  const tool = readFileSync(new URL("./support-craving-tool.ts", import.meta.url), "utf8");
  assert.match(tool, /resolveSupportToolQueryParam[\s\S]*return null/);

  const waveSource = readFileSync(new URL("./UrgeWaveVisual.tsx", import.meta.url), "utf8");
  assert.match(waveSource, /data-craving-wave/);
  assert.match(waveSource, /prefers-reduced-motion/);
  assert.match(waveSource, /soma-craving-wave/);
});

test("hub copy and editorial register stay aligned", () => {
  const esHub = JSON.parse(
    readFileSync(new URL("../../../i18n/locales/es/support.json", import.meta.url), "utf8"),
  ) as { tools: { craving: { title: string } } };
  const enHub = JSON.parse(
    readFileSync(new URL("../../../i18n/locales/en/support.json", import.meta.url), "utf8"),
  ) as { tools: { craving: { title: string } } };
  assert.equal(esHub.tools.craving.title, "Afrontar el impulso de consumir");
  assert.equal(enHub.tools.craving.title, "Coping with cravings");

  const doc = readFileSync(
    new URL("../../../../../../docs/review/support/sup-02c-craving-companion.md", import.meta.url),
    "utf8",
  );
  const refs = readFileSync(
    new URL("../../../../../../docs/review/support/sup-02c-references.md", import.meta.url),
    "utf8",
  );
  assert.match(doc, /publicationStatus.*unpublished/i);
  assert.match(doc, /0\.1\.2|contentVersion.*0\.1/);
  assert.match(doc, /in-memory|memoria|sin URL|URL/i);
  assert.match(doc, /editorialStatus.*editorial_review_done/i);
  assert.match(doc, /clinicalStatus.*pending/i);
  assert.match(refs, /REF-CR-01/);
  assert.match(refs, /alcohol/i);
  assert.match(refs, /Ninguna fuente se presenta como evidencia de eficacia clínica de SOMA/);
});
