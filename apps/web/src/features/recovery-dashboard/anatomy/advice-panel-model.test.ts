import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  publishedAdviceCatalog,
  type EducationalAdviceItem,
} from "./advice-catalog.ts";
import { buildAdvicePanelModel } from "./advice-panel-model.ts";
import { draftAdviceCatalog } from "./advice-drafts.ts";
import enAnatomy from "../../../i18n/locales/en/anatomy.json" with { type: "json" };
import esAnatomy from "../../../i18n/locales/es/anatomy.json" with { type: "json" };

const publishableGeneral: EducationalAdviceItem = {
  id: "fixture.panel.safety.alcohol.acute",
  category: "safety",
  scope: "substance_phase",
  substanceIds: ["alcohol"],
  phases: ["acute_withdrawal"],
  titleKey: "fixture.panel.safety.alcohol.acute.title",
  bodyKey: "fixture.panel.safety.alcohol.acute.body",
  reference: { source: "Fixture verified citation.", status: "verified" },
  editorialStatus: "clinically_reviewed",
  personalized: false,
};

const publishableOrgan: EducationalAdviceItem = {
  id: "fixture.panel.self-care.liver.alcohol.acute",
  category: "self_care",
  scope: "organ",
  substanceIds: ["alcohol"],
  phases: ["acute_withdrawal"],
  organIds: ["liver"],
  titleKey: "fixture.panel.self-care.liver.alcohol.acute.title",
  bodyKey: "fixture.panel.self-care.liver.alcohol.acute.body",
  reference: { source: "Fixture verified organ citation.", status: "verified" },
  editorialStatus: "clinically_reviewed",
  personalized: false,
};

const publishableSeekHelp: EducationalAdviceItem = {
  id: "fixture.panel.seek-help.alcohol.acute",
  category: "seek_help",
  scope: "substance_phase",
  substanceIds: ["alcohol"],
  phases: ["acute_withdrawal"],
  titleKey: "fixture.panel.seek-help.alcohol.acute.title",
  bodyKey: "fixture.panel.seek-help.alcohol.acute.body",
  reference: { source: "Fixture verified seek-help citation.", status: "verified" },
  editorialStatus: "clinically_reviewed",
  personalized: false,
  alertSurface: "contextual",
};

const publishablePersistent: EducationalAdviceItem = {
  id: "fixture.panel.safety.alcohol.persistent",
  category: "safety",
  scope: "substance_phase",
  substanceIds: ["alcohol"],
  phases: ["during_use"],
  titleKey: "fixture.panel.safety.alcohol.persistent.title",
  bodyKey: "fixture.panel.safety.alcohol.persistent.body",
  reference: { source: "Fixture verified persistent citation.", status: "verified" },
  editorialStatus: "clinically_reviewed",
  personalized: false,
  alertSurface: "persistent_safety",
};

const pendingDraftLike: EducationalAdviceItem = {
  id: "fixture.panel.safety.alcohol.pending",
  category: "safety",
  scope: "substance_phase",
  substanceIds: ["alcohol"],
  phases: ["acute_withdrawal"],
  titleKey: "fixture.panel.safety.alcohol.pending.title",
  bodyKey: "fixture.panel.safety.alcohol.pending.body",
  reference: { source: "Pending source.", status: "pending" },
  editorialStatus: "pending_clinical_review",
  personalized: false,
};

const injectedCatalog: readonly EducationalAdviceItem[] = [
  pendingDraftLike,
  publishablePersistent,
  publishableGeneral,
  publishableSeekHelp,
  publishableOrgan,
];

test("the real published catalog yields an empty advice panel", () => {
  assert.deepEqual(publishedAdviceCatalog, []);
  const model = buildAdvicePanelModel("liver", "alcohol", "acute_withdrawal");
  assert.equal(model.empty, true);
  assert.equal(model.emptyReason, "catalog_empty");
  assert.equal(model.showSelectors, false);
  assert.deepEqual(model.substanceOptions, []);
  assert.deepEqual(model.persistent, []);
});

test("pending sidecar records are never a default catalog for the panel", () => {
  const model = buildAdvicePanelModel("liver", "alcohol", "acute_withdrawal");
  const sidecarIds = new Set(draftAdviceCatalog.map((record) => record.item.id));
  assert.equal(model.persistent.some((item) => sidecarIds.has(item.id)), false);
  assert.equal(
    model.contextualGroups.some((group) => group.items.some((item) => sidecarIds.has(item.id))),
    false,
  );
  assert.equal(draftAdviceCatalog.length, 25);
});

test("a selected substance without published advice stays selected and empty", () => {
  const model = buildAdvicePanelModel(null, "nicotine", "during_use", injectedCatalog);
  assert.equal(model.empty, true);
  assert.equal(model.emptyReason, "no_published_for_selection");
  assert.equal(model.selectedSubstanceInCatalog, false);
  assert.deepEqual([...model.substanceOptions], ["alcohol"]);
  assert.equal(model.showSelectors, true);
});

test("general publishable advice appears without an organ", () => {
  const model = buildAdvicePanelModel(null, "alcohol", "acute_withdrawal", injectedCatalog);
  const contextualIds = model.contextualGroups.flatMap((group) => group.items.map((item) => item.id));
  assert.equal(contextualIds.includes(publishableGeneral.id), true);
  assert.equal(contextualIds.includes(publishableOrgan.id), false);
});

test("organ-scoped publishable advice appears with a matching organ", () => {
  const model = buildAdvicePanelModel("liver", "alcohol", "acute_withdrawal", injectedCatalog);
  const contextualIds = model.contextualGroups.flatMap((group) => group.items.map((item) => item.id));
  assert.equal(contextualIds.includes(publishableOrgan.id), true);
  assert.equal(contextualIds.includes(publishableGeneral.id), true);
});

test("persistent items are listed above contextual groups and are not duplicated", () => {
  const model = buildAdvicePanelModel("liver", "alcohol", "during_use", injectedCatalog);
  assert.deepEqual(
    model.persistent.map((item) => item.id),
    [publishablePersistent.id],
  );
  const contextualIds = model.contextualGroups.flatMap((group) => group.items.map((item) => item.id));
  assert.equal(contextualIds.includes(publishablePersistent.id), false);
  assert.equal(model.empty, false);
});

test("contextual seek_help is not promoted into the persistent band", () => {
  const model = buildAdvicePanelModel("liver", "alcohol", "acute_withdrawal", injectedCatalog);
  assert.equal(
    model.persistent.some((item) => item.id === publishableSeekHelp.id),
    false,
  );
  assert.deepEqual(
    model.contextualGroups.map((group) => group.category),
    ["safety", "seek_help", "self_care"],
  );
});

test("an invalid organ-scoped persistent payload is discarded by the panel model", () => {
  const invalid = {
    ...publishableOrgan,
    alertSurface: "persistent_safety",
  } as EducationalAdviceItem;
  const model = buildAdvicePanelModel("heart", "alcohol", "acute_withdrawal", [
    invalid,
    publishableGeneral,
  ]);
  assert.equal(
    model.persistent.some((item) => item.id === publishableOrgan.id),
    false,
  );
});

test("anatomy chrome keys for Consejos exist in ES and EN", () => {
  const keys = [
    "advicePlaceholder",
    "adviceDisclaimer",
    "adviceEmptySelection",
    "advicePersistentHeading",
  ] as const;
  for (const key of keys) {
    assert.equal(typeof esAnatomy[key], "string", key);
    assert.equal(typeof enAnatomy[key], "string", key);
    assert.notEqual(esAnatomy[key], enAnatomy[key], key);
  }
  assert.deepEqual(Object.keys(esAnatomy.adviceCategory), ["safety", "seek_help", "self_care"]);
  assert.deepEqual(Object.keys(enAnatomy.adviceCategory), ["safety", "seek_help", "self_care"]);
  assert.notEqual(esAnatomy.adviceCategory.safety, enAnatomy.adviceCategory.safety);
});

test("the advice panel module does not read the sidecar or unpublished matcher", () => {
  const modelSource = readFileSync(new URL("./advice-panel-model.ts", import.meta.url), "utf8");
  const panelSource = readFileSync(
    new URL("../components/AdvicePanel.tsx", import.meta.url),
    "utf8",
  );
  const page = readFileSync(new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url), "utf8");
  for (const source of [modelSource, panelSource, page]) {
    assert.equal(source.includes("advice-drafts"), false);
    assert.equal(source.includes("matchApplicableAdvice"), false);
  }
  assert.equal(modelSource.includes("educationalEffectsSubstances"), false);
  assert.equal(panelSource.includes("educationalEffectsSubstances"), false);
  assert.equal(modelSource.includes("recoverySubstances"), false);
  assert.equal(panelSource.includes("recoverySubstances"), false);
  assert.match(page, /AdvicePanel/);
  assert.match(page, /EffectsPanel/);
  assert.match(page, /RecoveryPanel/);
  assert.match(page, /phaseCategoryNote/);
  assert.equal(page.includes("phaseWindow"), false);
  assert.equal(panelSource.includes("phaseWindow"), false);
  assert.equal(panelSource.includes("phaseCategoryNote"), false);
});
