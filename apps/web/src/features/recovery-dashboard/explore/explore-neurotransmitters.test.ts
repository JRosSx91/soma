import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enExplore from "../../../i18n/locales/en/explore.json" with { type: "json" };
import esExplore from "../../../i18n/locales/es/explore.json" with { type: "json" };
import { exploreNtPhases, isExploreNtPhase } from "./explore-neurotransmitters.ts";

test("explore neurotransmitter copy stays paired in spanish and english", () => {
  const es = esExplore as Record<string, unknown>;
  const en = enExplore as Record<string, unknown>;
  assert.equal(es.ntTitle, "Neurotransmisores");
  assert.equal(en.ntTitle, "Neurotransmitters");
  assert.equal(
    es.ntPhaseNotice,
    "Tú eliges la fase para comparar. El catálogo no mide tus neurotransmisores ni usa tus días de abstinencia.",
  );
  assert.equal(
    en.ntPhaseNotice,
    "You choose the phase to compare. The catalog does not measure your neurotransmitters or use your abstinence days.",
  );
  assert.equal("ntIntro" in es, false);
  assert.equal("ntStateLabel" in es, false);
  assert.equal("ntMoreDetail" in es, false);
  const esPhases = es.ntPhases as Record<string, string>;
  const enPhases = en.ntPhases as Record<string, string>;
  assert.equal(esPhases.during_use, "Durante el consumo");
  assert.equal(esPhases.acute_withdrawal, "Abstinencia aguda");
  assert.equal(esPhases.post_acute, "Fase postaguda");
  assert.equal(esPhases.normalizing, "Normalización progresiva");
  assert.equal(enPhases.during_use, "During use");
  assert.equal(enPhases.acute_withdrawal, "Acute withdrawal");
  assert.equal(enPhases.post_acute, "Post-acute phase");
  assert.equal(enPhases.normalizing, "Gradual normalization");
  for (const text of [...Object.values(esPhases), ...Object.values(enPhases), es.ntPhaseNotice, en.ntPhaseNotice]) {
    assert.equal(String(text).includes("1–7"), false);
    assert.equal(String(text).includes("8–56"), false);
    assert.equal(String(text).includes("57+"), false);
  }
});

test("explore phase helper only accepts catalog phases", () => {
  assert.deepEqual([...exploreNtPhases], [
    "during_use",
    "acute_withdrawal",
    "post_acute",
    "normalizing",
  ]);
  assert.equal(isExploreNtPhase("during_use"), true);
  assert.equal(isExploreNtPhase("paws"), false);
});

test("explore page reuses educational resolvers and not soma 1.0 bars", () => {
  const page = readFileSync(new URL("../pages/ExplorePage.tsx", import.meta.url), "utf8");
  const section = readFileSync(
    new URL("../components/ExploreNeurotransmitters.tsx", import.meta.url),
    "utf8",
  );
  const track = readFileSync(
    new URL("../components/EducationalPhaseTrack.tsx", import.meta.url),
    "utf8",
  );
  const card = readFileSync(
    new URL("../components/ExploreNeurotransmitterCard.tsx", import.meta.url),
    "utf8",
  );
  const helper = readFileSync(new URL("./explore-neurotransmitters.ts", import.meta.url), "utf8");
  const anatomy = readFileSync(new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url), "utf8");
  const sheet = readFileSync(
    new URL("../components/DetailSheet.tsx", import.meta.url),
    "utf8",
  );
  assert.match(page, /ExploreNeurotransmitters/);
  assert.match(page, /t\("openAnatomy"\)/);
  assert.equal(page.includes("educationalAnatomyHrefForSignaling"), false);
  assert.equal(section.includes("anatomyExplorerHref"), false);
  assert.equal(card.includes("anatomyExplorerHref"), false);
  assert.equal(card.includes("<Link"), false);
  assert.match(section, /resolveEducationalNeurotransmittersForSubstance/);
  assert.match(track, /role="radiogroup"/);
  assert.match(track, /has-\[:focus-visible\]:outline-soma-focus/);
  assert.equal(track.includes("SEVERITY_FILL"), false);
  assert.equal(card.includes("NeurotransmitterPanel"), false);
  assert.equal(helper.includes("firstEducationalOrganForSignaling"), false);
  assert.equal(page.includes("/me/neurotransmitter-state"), false);
  assert.match(sheet, /t\("close"\)/);
  assert.match(sheet, /openerRef/);
  assert.match(anatomy, /function EffectsPanel/);
  assert.match(anatomy, /resolveEducationalSignaling/);
});
