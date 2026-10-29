import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { atlasSystems } from "../anatomy/atlas-config.ts";
import { atlasSystemIdForOrgan } from "../anatomy/anatomy-explorer-query.ts";
import { exploreEduRelatedSheet, exploreEduSheetIds } from "./explore-edu.ts";
import {
  EXPLORE_EDU_ANATOMY_MAX_DESTINATIONS,
  exploreEduAnatomyDestinations,
  exploreEduAnatomyHref,
  exploreEduAnatomyLinks,
  exploreEduSheetForOrgan,
  exploreEduSheetForSystem,
  isExploreEduAnatomyDestinationValid,
} from "./explore-edu-anatomy.ts";
import enExploreEdu from "../../../i18n/locales/en/explore-edu.json" with { type: "json" };
import esExploreEdu from "../../../i18n/locales/es/explore-edu.json" with { type: "json" };

const article = readFileSync(
  new URL("../components/ExploreEducationalArticle.tsx", import.meta.url),
  "utf8",
);
const recovery = readFileSync(new URL("../anatomy/recovery-catalog.ts", import.meta.url), "utf8");
const relatedSnapshot = {
  dopamine: "receptors",
  receptors: "dopamine",
  serotonin: "receptors",
  gaba: "receptors",
  glutamate: "receptors",
  norepinephrine: "dopamine",
  acetylcholine: "receptors",
  endocannabinoid: "receptors",
  endorphin: "receptors",
  adenosine: "receptors",
  tolerance: "neuroadaptation",
  dependence: "tolerance",
  neuroadaptation: "receptors",
  metabolism: "tolerance",
} as const;

test("authorized educational anatomy destinations exist on the atlas catalog", () => {
  const listed = Object.values(exploreEduAnatomyDestinations).flat();
  assert.equal(listed.length, 6);
  for (const destination of listed) {
    assert.equal(isExploreEduAnatomyDestinationValid(destination), true);
    assert.ok(
      atlasSystems.some((system) => system.id === destination.systemId),
      destination.systemId,
    );
    if (destination.kind === "organ") {
      assert.equal(atlasSystemIdForOrgan(destination.organId), destination.systemId);
    }
  }
});

test("each educational sheet has at most three anatomy destinations and only authorized links", () => {
  assert.deepEqual(Object.keys(exploreEduAnatomyDestinations).sort(), [
    "dopamine",
    "glutamate",
    "metabolism",
    "neuroadaptation",
  ]);
  assert.deepEqual(
    exploreEduAnatomyDestinations.dopamine.map((item) => item.organId),
    ["brain-vta", "brain-nucleus-accumbens", "brain-prefrontal-cortex"],
  );
  assert.deepEqual(exploreEduAnatomyDestinations.glutamate, [
    { kind: "organ", organId: "brain-hippocampus", systemId: "nervous-central" },
  ]);
  assert.deepEqual(exploreEduAnatomyDestinations.metabolism, [
    { kind: "organ", organId: "liver", systemId: "hepatic" },
  ]);
  assert.deepEqual(exploreEduAnatomyDestinations.neuroadaptation, [
    { kind: "system", systemId: "nervous-central" },
  ]);
  for (const sheetId of exploreEduSheetIds) {
    const destinations = exploreEduAnatomyLinks(sheetId);
    assert.ok(destinations.length <= EXPLORE_EDU_ANATOMY_MAX_DESTINATIONS, sheetId);
  }
  assert.deepEqual(exploreEduAnatomyLinks("serotonin"), []);
  assert.deepEqual(exploreEduAnatomyLinks("receptors"), []);
  assert.deepEqual(exploreEduAnatomyLinks("tolerance"), []);
});

test("anatomy hrefs use organ and system helpers without inventing query pairs", () => {
  assert.equal(
    exploreEduAnatomyHref("/preview", exploreEduAnatomyDestinations.dopamine[0]),
    "/preview/anatomy?system=nervous-central&organ=brain-vta",
  );
  assert.equal(
    exploreEduAnatomyHref("/app", exploreEduAnatomyDestinations.glutamate[0]),
    "/app/anatomy?system=nervous-central&organ=brain-hippocampus",
  );
  assert.equal(
    exploreEduAnatomyHref("/preview", exploreEduAnatomyDestinations.metabolism[0]),
    "/preview/anatomy?system=hepatic&organ=liver",
  );
  assert.equal(
    exploreEduAnatomyHref("/app", exploreEduAnatomyDestinations.neuroadaptation[0]),
    "/app/anatomy?system=nervous-central",
  );
  assert.equal(
    exploreEduAnatomyHref("/preview", {
      kind: "organ",
      organId: "liver",
      systemId: "digestive",
    }),
    null,
  );
  assert.equal(
    exploreEduAnatomyHref("/preview", { kind: "system", systemId: "not-a-system" }),
    null,
  );
});

test("anatomy related section is visible in spanish and english and uses real links", () => {
  assert.equal(esExploreEdu.anatomyLinksTitle.includes("explorador anatómico"), true);
  assert.equal(enExploreEdu.anatomyLinksTitle.includes("anatomical explorer"), true);
  assert.notEqual(esExploreEdu.anatomyLinksTitle, enExploreEdu.anatomyLinksTitle);
  assert.equal(article.includes("exploreEduAnatomyLinksVisible"), false);
  assert.match(article, /<Link/);
  assert.match(article, /anatomyExplorerHrefForOrgan|exploreEduAnatomyHref/);
  assert.match(article, /data-edu-anatomy-links/);
  assert.equal(article.includes("DetailSheet"), false);
  const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");
  assert.match(app, /const soma2Pages/);
  assert.match(app, /path="\/preview"/);
  assert.match(app, /path="\/app"/);
  assert.match(app, /\{soma2Pages\}/);
});

test("inverse anatomy destinations map uniquely to authorized educational sheets", () => {
  assert.equal(exploreEduSheetForOrgan("brain-vta"), "dopamine");
  assert.equal(exploreEduSheetForOrgan("brain-nucleus-accumbens"), "dopamine");
  assert.equal(exploreEduSheetForOrgan("brain-prefrontal-cortex"), "dopamine");
  assert.equal(exploreEduSheetForOrgan("brain-hippocampus"), "glutamate");
  assert.equal(exploreEduSheetForOrgan("liver"), "metabolism");
  assert.equal(exploreEduSheetForSystem("nervous-central"), "neuroadaptation");
  assert.equal(exploreEduSheetForOrgan("brain-amygdala"), null);
  assert.equal(exploreEduSheetForOrgan("heart"), null);
  assert.equal(exploreEduSheetForSystem("hepatic"), null);
  assert.equal(exploreEduSheetForSystem("respiratory"), null);
  const seen = new Map<string, string>();
  for (const [sheetId, destinations] of Object.entries(exploreEduAnatomyDestinations)) {
    for (const destination of destinations) {
      const key =
        destination.kind === "organ"
          ? `organ:${destination.organId}`
          : `system:${destination.systemId}`;
      assert.equal(seen.has(key), false, key);
      seen.set(key, sheetId);
    }
  }
  assert.equal(seen.size, 6);
  assert.equal(esExploreEdu.anatomyToArticle.dopamine.includes("dopamina"), true);
  assert.equal(enExploreEdu.anatomyToArticle.dopamine.includes("dopamine"), true);
  assert.notEqual(esExploreEdu.anatomyToArticle.dopamine, enExploreEdu.anatomyToArticle.dopamine);
});

test("the one-to-one educational graph and recovery models stay unchanged", () => {
  assert.deepEqual({ ...exploreEduRelatedSheet }, relatedSnapshot);
  assert.match(article, /exploreEduRelatedSheet\[sheetId\]/);
  assert.match(recovery, /recovery-curves\.generated/);
  assert.equal(recovery.includes("exploreEduAnatomy"), false);
  assert.equal(esExploreEdu.sheets.dopamine.sections.what.paragraphs[0].includes("neurotransmisor"), true);
  assert.equal(enExploreEdu.sheets.dopamine.sections.what.paragraphs[0].includes("neurotransmitter"), true);
});
