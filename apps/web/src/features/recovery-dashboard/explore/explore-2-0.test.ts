import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { atlasSystems } from "../anatomy/atlas-config.ts";
import { educationalNtProfiles } from "../anatomy/neurotransmitter-education.ts";
import enExplore from "../../../i18n/locales/en/explore.json" with { type: "json" };
import esExplore from "../../../i18n/locales/es/explore.json" with { type: "json" };
import enNt from "../../../i18n/locales/en/neurotransmitters.json" with { type: "json" };
import esNt from "../../../i18n/locales/es/neurotransmitters.json" with { type: "json" };
import {
  exploreNeurotransmitters,
  featuredExploreNeurotransmitters,
  substancesForEducationalNeurotransmitter,
} from "./explore-neurotransmitters.ts";
import { featuredExploreSystemIds } from "./explore-systems.ts";

const page = readFileSync(new URL("../pages/ExplorePage.tsx", import.meta.url), "utf8");
const index = readFileSync(
  new URL("../components/ExploreNeurotransmitterIndex.tsx", import.meta.url),
  "utf8",
);
const card = readFileSync(
  new URL("../components/ExploreNeurotransmitterCard.tsx", import.meta.url),
  "utf8",
);

test("explorer 2.0 composition uses the 2.0 hero, chips and existing sheets", () => {
  assert.match(page, /RecoveryHero/);
  assert.match(page, /nature-4\.png/);
  assert.equal(page.includes("nature-1.png"), false);
  assert.equal(page.includes("nature-2.png"), false);
  assert.equal(page.includes("nature-3.png"), false);
  assert.match(page, /ExploreNeurotransmitterIndex/);
  assert.match(page, /ExploreNeurotransmitters/);
  assert.match(page, /DetailSheet/);
  assert.match(page, /exploreScopes/);
  assert.match(page, /anatomyExplorerHrefForOrgan/);
  assert.match(page, /SubstanceIllustration/);
  assert.match(page, /plates\.anterior/);
});

test("explorer 2.0 does not ship mockup-only missions, xp or invented systems", () => {
  for (const source of [page, index, JSON.stringify(esExplore), JSON.stringify(enExplore)]) {
    assert.equal(source.includes("+50"), false);
    assert.equal(/\bXP\b/.test(source), false);
    assert.equal(source.includes("filters.processes"), false);
    assert.equal(source.includes("filters.missions"), false);
    assert.equal(source.includes("Comenzar"), false);
  }
  assert.equal(atlasSystems.length, 12);
  assert.deepEqual([...featuredExploreSystemIds], atlasSystems.slice(0, 5).map((item) => item.id));
  assert.equal(
    atlasSystems.some((system) => system.id === "endocannabinoid"),
    false,
  );
  assert.equal(page.includes("Sistema endocannabinoide"), false);
  assert.match(page, /systemsSeeAll/);
  assert.match(page, /missionsOpen/);
  assert.match(page, /\$\{base\}\/missions/);
  assert.match(page, /processesPreparing/);
  assert.match(page, /exploreMissionsArt/);
  assert.match(page, /lg:h-44/);
  assert.equal(page.includes("sm:flex-row"), false);
  assert.match(page, /items-stretch/);
  assert.equal(index.includes("grid-cols-5"), false);
  assert.equal(index.includes("truncate"), false);
  assert.equal(index.includes("line-clamp"), false);
  assert.equal(esExplore.missionsOpen.includes("misiones"), true);
  assert.equal(enExplore.missionsOpen.toLowerCase().includes("missions"), true);
});

test("explorer 2.0 lists nine educational transmitters without soma 1.0 bars", () => {
  assert.deepEqual([...featuredExploreNeurotransmitters], [
    "dopamine",
    "serotonin",
    "gaba",
    "glutamate",
    "acetylcholine",
  ]);
  assert.equal(exploreNeurotransmitters.length, 9);
  assert.deepEqual([...exploreNeurotransmitters], [
    "dopamine",
    "serotonin",
    "gaba",
    "glutamate",
    "acetylcholine",
    "norepinephrine",
    "endocannabinoid",
    "endorphin",
    "adenosine",
  ]);
  for (const id of exploreNeurotransmitters) {
    assert.ok(esNt[id]?.name);
    assert.ok(enNt[id]?.name);
    assert.notEqual(esNt[id].name, id);
  }
  assert.deepEqual(substancesForEducationalNeurotransmitter("endorphin"), []);
  assert.ok(substancesForEducationalNeurotransmitter("dopamine").includes("alcohol"));
  assert.equal(educationalNtProfiles.length, 14);
  assert.equal(page.includes("SEVERITY_FILL"), false);
  assert.equal(page.includes("NeurotransmitterPanel"), false);
  assert.equal(card.includes("SEVERITY_FILL"), false);
  assert.equal(card.includes("h-3 w-3"), true);
  assert.equal(index.includes("exploreNeurotransmitterArt"), true);
  assert.equal(index.includes("object-contain"), true);
  assert.equal(index.includes("object-cover"), false);
  assert.equal(page.includes("/me/neurotransmitter-state"), false);
  assert.equal(page.includes("abstinenceDays"), false);
});

test("explorer filter copy is paired and excludes organs as a fake catalog chip", () => {
  assert.deepEqual(Object.keys(esExplore.filters), Object.keys(enExplore.filters));
  assert.equal(esExplore.filters.all, "Todas");
  assert.equal(enExplore.filters.all, "All");
  assert.equal("organs" in esExplore.filters, false);
  assert.equal("processes" in esExplore.filters, false);
  assert.equal(esExplore.ntIndexEmpty.includes("Todavía"), true);
  assert.equal(enExplore.ntIndexEmpty.toLowerCase().includes("not yet"), true);
  assert.equal(esExplore.ntIndexSheetNotice.toLowerCase().includes("%"), false);
  assert.equal(enExplore.ntIndexSheetNotice.toLowerCase().includes("percent"), true);
});
