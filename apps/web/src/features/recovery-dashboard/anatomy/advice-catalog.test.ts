import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  adviceAlertSurfaces,
  adviceCategories,
  adviceI18nPublicationContract,
  assemblePublishedAdviceCatalog,
  hasCompletePublicAdviceCopy,
  isAdvicePublishable,
  isAdviceReadyForPublishedCatalog,
  matchApplicableAdvice,
  partitionAdviceSurfaces,
  publishedAdviceCandidates,
  publishedAdviceCatalog,
  publishedAdviceCopyBundles,
  resolveAdviceAlertSurface,
  resolveEducationalAdvice,
  resolvePersistentSafetyAdvice,
  type AdviceCatalogTypeChecks,
  type EducationalAdviceItem,
  type OrganAdviceItem,
  type SubstancePhaseAdviceItem,
} from "./advice-catalog.ts";
import { recoveryCatalogPairs } from "./recovery-catalog.ts";
import { narrativeCatalogPairs } from "./narrative-catalog.ts";

/**
 * Synthetic fixtures for resolver tests. They are not clinical advice
 * and must not be copied into the published catalog.
 */
const fixtures = {
  generalSafetyAlcoholAcute: {
    id: "fixture.safety.alcohol.acute-withdrawal",
    category: "safety",
    scope: "substance_phase",
    substanceIds: ["alcohol"],
    phases: ["acute_withdrawal"],
    titleKey: "fixture.advice.safety.alcohol.acute.title",
    bodyKey: "fixture.advice.safety.alcohol.acute.body",
    reference: { source: "Fixture citation (1999).", status: "unverified" },
    editorialStatus: "pending_clinical_review",
    personalized: false,
  },
  generalSeekHelpAlcoholAcute: {
    id: "fixture.seek-help.alcohol.acute-withdrawal",
    category: "seek_help",
    scope: "substance_phase",
    substanceIds: ["alcohol"],
    phases: ["acute_withdrawal"],
    titleKey: "fixture.advice.seek_help.alcohol.acute.title",
    bodyKey: "fixture.advice.seek_help.alcohol.acute.body",
    reference: { source: "", status: "insufficient" },
    editorialStatus: "draft",
    personalized: false,
  },
  organSelfCareLiverAlcoholUse: {
    id: "fixture.self-care.liver.alcohol.during-use",
    category: "self_care",
    scope: "organ",
    substanceIds: ["alcohol"],
    phases: ["during_use"],
    organIds: ["liver"],
    titleKey: "fixture.advice.self_care.liver.alcohol.use.title",
    bodyKey: "fixture.advice.self_care.liver.alcohol.use.body",
    reference: {
      source: "Fixture et al. (2012). [NEEDS-VERIFICATION]",
      status: "pending",
    },
    editorialStatus: "draft",
    personalized: false,
  },
  organSelfCareHeartCaffeineUse: {
    id: "fixture.self-care.heart.caffeine.during-use",
    category: "self_care",
    scope: "organ",
    substanceIds: ["caffeine"],
    phases: ["during_use"],
    organIds: ["heart"],
    titleKey: "fixture.advice.self_care.heart.caffeine.use.title",
    bodyKey: "fixture.advice.self_care.heart.caffeine.use.body",
    reference: { source: "Verified fixture source.", status: "verified" },
    editorialStatus: "clinically_reviewed",
    personalized: false,
  },
  duplicateSafety: {
    id: "fixture.safety.alcohol.acute-withdrawal",
    category: "safety",
    scope: "substance_phase",
    substanceIds: ["alcohol"],
    phases: ["acute_withdrawal"],
    titleKey: "fixture.advice.safety.duplicate.title",
    bodyKey: "fixture.advice.safety.duplicate.body",
    reference: { source: "Duplicate fixture.", status: "unverified" },
    editorialStatus: "draft",
    personalized: false,
  },
  publishableGeneralSafety: {
    id: "fixture.safety.alcohol.acute-withdrawal.publishable",
    category: "safety",
    scope: "substance_phase",
    substanceIds: ["alcohol"],
    phases: ["acute_withdrawal"],
    titleKey: "fixture.advice.safety.alcohol.acute.publishable.title",
    bodyKey: "fixture.advice.safety.alcohol.acute.publishable.body",
    reference: { source: "Fixture verified citation.", status: "verified" },
    editorialStatus: "clinically_reviewed",
    personalized: false,
  },
  reviewedUnverified: {
    id: "fixture.safety.alcohol.acute-withdrawal.reviewed-unverified",
    category: "safety",
    scope: "substance_phase",
    substanceIds: ["alcohol"],
    phases: ["acute_withdrawal"],
    titleKey: "fixture.advice.safety.reviewed-unverified.title",
    bodyKey: "fixture.advice.safety.reviewed-unverified.body",
    reference: { source: "Fixture citation (1999).", status: "unverified" },
    editorialStatus: "clinically_reviewed",
    personalized: false,
  },
  verifiedPendingReview: {
    id: "fixture.safety.alcohol.acute-withdrawal.verified-pending-review",
    category: "safety",
    scope: "substance_phase",
    substanceIds: ["alcohol"],
    phases: ["acute_withdrawal"],
    titleKey: "fixture.advice.safety.verified-pending-review.title",
    bodyKey: "fixture.advice.safety.verified-pending-review.body",
    reference: { source: "Fixture verified citation.", status: "verified" },
    editorialStatus: "pending_clinical_review",
    personalized: false,
  },
  draftWithVerifiedReference: {
    id: "fixture.safety.alcohol.acute-withdrawal.draft-verified",
    category: "safety",
    scope: "substance_phase",
    substanceIds: ["alcohol"],
    phases: ["acute_withdrawal"],
    titleKey: "fixture.advice.safety.draft-verified.title",
    bodyKey: "fixture.advice.safety.draft-verified.body",
    reference: { source: "Fixture verified citation.", status: "verified" },
    editorialStatus: "draft",
    personalized: false,
  },
  publishableOrganLiverAlcoholAcute: {
    id: "fixture.self-care.liver.alcohol.acute-withdrawal.publishable",
    category: "self_care",
    scope: "organ",
    substanceIds: ["alcohol"],
    phases: ["acute_withdrawal"],
    organIds: ["liver"],
    titleKey: "fixture.advice.self-care.liver.alcohol.acute.publishable.title",
    bodyKey: "fixture.advice.self-care.liver.alcohol.acute.publishable.body",
    reference: { source: "Fixture verified organ citation.", status: "verified" },
    editorialStatus: "clinically_reviewed",
    personalized: false,
    alertSurface: "contextual",
  },
  publishableSeekHelpContextual: {
    id: "fixture.seek-help.alcohol.acute-withdrawal.publishable",
    category: "seek_help",
    scope: "substance_phase",
    substanceIds: ["alcohol"],
    phases: ["acute_withdrawal"],
    titleKey: "fixture.advice.seek-help.alcohol.acute.publishable.title",
    bodyKey: "fixture.advice.seek-help.alcohol.acute.publishable.body",
    reference: { source: "Fixture verified seek-help citation.", status: "verified" },
    editorialStatus: "clinically_reviewed",
    personalized: false,
    alertSurface: "contextual",
  },
  persistentPublishable: {
    id: "fixture.safety.alcohol.persistent.publishable",
    category: "safety",
    scope: "substance_phase",
    substanceIds: ["alcohol"],
    phases: ["during_use"],
    titleKey: "fixture.advice.safety.alcohol.persistent.publishable.title",
    bodyKey: "fixture.advice.safety.alcohol.persistent.publishable.body",
    reference: { source: "Fixture verified persistent citation.", status: "verified" },
    editorialStatus: "clinically_reviewed",
    personalized: false,
    alertSurface: "persistent_safety",
  },
  persistentPending: {
    id: "fixture.safety.alcohol.persistent.pending",
    category: "safety",
    scope: "substance_phase",
    substanceIds: ["alcohol"],
    phases: ["during_use", "acute_withdrawal", "post_acute", "normalizing"],
    titleKey: "fixture.advice.safety.alcohol.persistent.pending.title",
    bodyKey: "fixture.advice.safety.alcohol.persistent.pending.body",
    reference: { source: "Fixture pending persistent citation.", status: "pending" },
    editorialStatus: "pending_clinical_review",
    personalized: false,
    alertSurface: "persistent_safety",
  },
} as const satisfies Record<string, EducationalAdviceItem>;

const catalog: readonly EducationalAdviceItem[] = [
  fixtures.generalSafetyAlcoholAcute,
  fixtures.duplicateSafety,
  fixtures.generalSeekHelpAlcoholAcute,
  fixtures.organSelfCareLiverAlcoholUse,
  fixtures.organSelfCareHeartCaffeineUse,
];

const publicationCatalog: readonly EducationalAdviceItem[] = [
  ...catalog,
  fixtures.publishableGeneralSafety,
  fixtures.reviewedUnverified,
  fixtures.verifiedPendingReview,
  fixtures.draftWithVerifiedReference,
  fixtures.publishableOrganLiverAlcoholAcute,
  fixtures.publishableSeekHelpContextual,
  fixtures.persistentPublishable,
  fixtures.persistentPending,
];

function applicableIds(
  organId: string,
  substanceId: string,
  phase: string,
  source: readonly EducationalAdviceItem[] = catalog,
): string[] {
  return matchApplicableAdvice(organId, substanceId, phase, source).items.map((item) => item.id);
}

function publishedIds(
  organId: string,
  substanceId: string,
  phase: string,
  source: readonly EducationalAdviceItem[] = publicationCatalog,
): string[] {
  return resolveEducationalAdvice(organId, substanceId, phase, source).items.map((item) => item.id);
}

test("the published advice catalog contains no authored recommendations", () => {
  assert.deepEqual(publishedAdviceCatalog, []);
  const published = resolveEducationalAdvice("liver", "alcohol", "acute_withdrawal");
  assert.equal(published.empty, true);
  assert.deepEqual(published.items, []);
  const applicable = matchApplicableAdvice("liver", "alcohol", "acute_withdrawal");
  assert.equal(applicable.empty, true);
});

test("empty is not an advice category", () => {
  assert.equal((adviceCategories as readonly string[]).includes("empty"), false);
});

test("general safety does not depend on the selected organ", () => {
  for (const organId of ["liver", "brain-vta", "testes", "unknown-organ"]) {
    const result = matchApplicableAdvice(organId, "alcohol", "acute_withdrawal", catalog);
    assert.equal(result.empty, false, organId);
    assert.equal(
      applicableIds(organId, "alcohol", "acute_withdrawal").includes(
        fixtures.generalSafetyAlcoholAcute.id,
      ),
      true,
      organId,
    );
  }
});

test("organ-specific items appear only with an explicit organ association", () => {
  assert.deepEqual(applicableIds("liver", "alcohol", "during_use"), [
    fixtures.organSelfCareLiverAlcoholUse.id,
  ]);

  const heartUse = matchApplicableAdvice("heart", "alcohol", "during_use", catalog);
  assert.equal(heartUse.empty, true);
  assert.deepEqual(heartUse.items, []);
});

test("general and organ-specific items can coexist without replacing each other", () => {
  const mixedCatalog: EducationalAdviceItem[] = [
    fixtures.generalSafetyAlcoholAcute,
    {
      ...fixtures.organSelfCareLiverAlcoholUse,
      phases: ["acute_withdrawal"],
      id: "fixture.self-care.liver.alcohol.acute-withdrawal",
    },
  ];
  const result = matchApplicableAdvice("liver", "alcohol", "acute_withdrawal", mixedCatalog);
  assert.deepEqual(
    result.items.map((item) => item.id),
    [fixtures.generalSafetyAlcoholAcute.id, "fixture.self-care.liver.alcohol.acute-withdrawal"],
  );
  assert.equal(
    result.items.some((item) => item.scope === "substance_phase"),
    true,
  );
  assert.equal(
    result.items.some((item) => item.scope === "organ"),
    true,
  );
});

test("duplicate ids are returned once, in catalog order", () => {
  const result = matchApplicableAdvice("liver", "alcohol", "acute_withdrawal", catalog);
  const safetyHits = result.items.filter(
    (item) => item.id === fixtures.generalSafetyAlcoholAcute.id,
  );
  assert.equal(safetyHits.length, 1);
  assert.equal(safetyHits[0]?.titleKey, fixtures.generalSafetyAlcoholAcute.titleKey);
});

test("unmatched queries resolve to an explicit empty result", () => {
  const result = matchApplicableAdvice("liver", "caffeine", "during_use", catalog);
  assert.equal(result.empty, true);
  assert.deepEqual(result.items, []);
  assert.equal(result.organId, "liver");
  assert.equal(result.substanceId, "caffeine");
  assert.equal(result.phase, "during_use");
});

test("the resolver does not read narratives, curves, or achievements", () => {
  const source = readFileSync(new URL("./advice-catalog.ts", import.meta.url), "utf8");
  for (const token of [
    "resolveEducationalNarrative",
    "resolveEducationalRecovery",
    "recovery-curves",
    "achievement-catalog",
    "organ-narrative",
    "neurotransmitter-phases",
    "neurotransmitter-education",
    "daysTo95Recovery",
    "recoveryCeiling",
    "educationalEffectsSubstances",
  ]) {
    assert.equal(source.includes(token), false, token);
  }
  assert.equal(narrativeCatalogPairs().length > 0, true);
  assert.equal(recoveryCatalogPairs().length > 0, true);
  assert.deepEqual(publishedAdviceCatalog, []);
});

test("reference and editorial statuses stay independent and are not inferred", () => {
  const liver = matchApplicableAdvice("liver", "alcohol", "during_use", catalog).items[0];
  assert.ok(liver);
  assert.equal(liver.reference.status, "pending");
  assert.equal(liver.editorialStatus, "draft");
  assert.equal(isAdvicePublishable(liver), false);

  const heart = matchApplicableAdvice("heart", "caffeine", "during_use", catalog).items[0];
  assert.ok(heart);
  assert.equal(heart.reference.status, "verified");
  assert.equal(heart.editorialStatus, "clinically_reviewed");
  assert.equal(isAdvicePublishable(heart), true);

  const seek = matchApplicableAdvice("liver", "alcohol", "acute_withdrawal", catalog).items.find(
    (item) => item.category === "seek_help",
  );
  assert.ok(seek);
  assert.equal(seek.reference.status, "insufficient");
  assert.equal(seek.reference.source, "");
  assert.equal(isAdvicePublishable(seek), false);

  const authorYear = matchApplicableAdvice(
    "brain-vta",
    "alcohol",
    "acute_withdrawal",
    catalog,
  ).items.find((item) => item.id === fixtures.generalSafetyAlcoholAcute.id);
  assert.ok(authorYear);
  assert.equal(authorYear.reference.status, "unverified");
  assert.match(authorYear.reference.source, /\(1999\)/);
  assert.equal(isAdvicePublishable(authorYear), false);
});

test("unknown identifiers yield an empty result", () => {
  assert.equal(matchApplicableAdvice("not-an-organ", "alcohol", "during_use", catalog).empty, true);
  assert.equal(matchApplicableAdvice("liver", "not-a-substance", "during_use", catalog).empty, true);
  assert.equal(matchApplicableAdvice("liver", "alcohol", "not-a-phase", catalog).empty, true);
  assert.equal(matchApplicableAdvice("", "alcohol", "during_use", catalog).empty, true);
  assert.equal(matchApplicableAdvice(null, "", "acute_withdrawal", catalog).empty, true);
  assert.equal(matchApplicableAdvice(undefined, "   ", "acute_withdrawal", catalog).empty, true);
});

test("resolution is deterministic and does not mutate the catalog", () => {
  const snapshot = catalog.map((item) => item.id);
  const first = matchApplicableAdvice("liver", "alcohol", "acute_withdrawal", catalog);
  const second = matchApplicableAdvice("liver", "alcohol", "acute_withdrawal", catalog);
  assert.deepEqual(
    first.items.map((item) => item.id),
    second.items.map((item) => item.id),
  );
  assert.deepEqual(
    catalog.map((item) => item.id),
    snapshot,
  );
  assert.equal(
    first.items.every((item) => item.personalized === false),
    true,
  );
});

test("clinically reviewed items with a verified reference are publishable", () => {
  assert.equal(isAdvicePublishable(fixtures.organSelfCareHeartCaffeineUse), true);
  assert.equal(isAdvicePublishable(fixtures.publishableGeneralSafety), true);
  assert.deepEqual(publishedIds("heart", "caffeine", "during_use"), [
    fixtures.organSelfCareHeartCaffeineUse.id,
  ]);
});

test("clinically reviewed items with an unverified reference are not published", () => {
  assert.equal(isAdvicePublishable(fixtures.reviewedUnverified), false);
  assert.equal(
    publishedIds("liver", "alcohol", "acute_withdrawal").includes(fixtures.reviewedUnverified.id),
    false,
  );
});

test("verified references pending clinical review are not published", () => {
  assert.equal(isAdvicePublishable(fixtures.verifiedPendingReview), false);
  assert.equal(
    publishedIds("liver", "alcohol", "acute_withdrawal").includes(
      fixtures.verifiedPendingReview.id,
    ),
    false,
  );
});

test("drafts are excluded from publication even with a verified reference", () => {
  assert.equal(isAdvicePublishable(fixtures.draftWithVerifiedReference), false);
  assert.equal(
    publishedIds("liver", "alcohol", "acute_withdrawal").includes(
      fixtures.draftWithVerifiedReference.id,
    ),
    false,
  );
  assert.equal(
    applicableIds("liver", "alcohol", "acute_withdrawal", publicationCatalog).includes(
      fixtures.draftWithVerifiedReference.id,
    ),
    true,
  );
});

test("publishable general safety is visible on any organ", () => {
  for (const organId of ["liver", "brain-vta", "testes", "unknown-organ"]) {
    const result = resolveEducationalAdvice(
      organId,
      "alcohol",
      "acute_withdrawal",
      publicationCatalog,
    );
    assert.equal(result.empty, false, organId);
    assert.equal(
      publishedIds(organId, "alcohol", "acute_withdrawal").includes(
        fixtures.publishableGeneralSafety.id,
      ),
      true,
      organId,
    );
  }
});

test("i18n publication checks are enforced at catalog assembly, not in resolvers", () => {
  assert.deepEqual([...adviceI18nPublicationContract.keys], ["titleKey", "bodyKey"]);
  assert.deepEqual([...adviceI18nPublicationContract.locales], ["en", "es"]);
  assert.equal(adviceI18nPublicationContract.fallback, null);
  assert.equal(adviceI18nPublicationContract.enforcedWhen, "published-catalog-assembly");
  const source = readFileSync(new URL("./advice-catalog.ts", import.meta.url), "utf8");
  assert.match(source, /same substance and phase choices as/);
  assert.match(source, /Selectors are not implemented here/);
  assert.equal(source.includes("advice-drafts"), false);
});

test("discriminated scope types keep mandatory arrays non-empty", () => {
  const checks = {
    organIdsNonEmpty: true,
    substanceIdsNonEmpty: true,
    phasesNonEmpty: true,
    generalHasNoOrganIds: true,
    organRequiresOrganIds: true,
    persistentRequiresSubstancePhase: true,
    organAlertSurfaceIsContextual: true,
  } satisfies AdviceCatalogTypeChecks;

  const general: SubstancePhaseAdviceItem = fixtures.publishableGeneralSafety;
  const organ: OrganAdviceItem = fixtures.organSelfCareHeartCaffeineUse;
  assert.equal("organIds" in general, false);
  assert.equal(organ.organIds.length > 0, true);
  assert.equal(general.substanceIds.length > 0, true);
  assert.equal(general.phases.length > 0, true);
  assert.equal(checks.organIdsNonEmpty, true);
});

test("publishable general advice is visible without an organ selection", () => {
  for (const organId of [null, undefined, "", "   "] as const) {
    const result = resolveEducationalAdvice(
      organId,
      "alcohol",
      "acute_withdrawal",
      publicationCatalog,
    );
    assert.equal(result.organId, null, String(organId));
    assert.equal(result.empty, false, String(organId));
    assert.equal(result.items.some((item) => item.id === fixtures.publishableGeneralSafety.id), true);
    assert.equal(
      result.items.some((item) => item.scope === "organ"),
      false,
      String(organId),
    );
  }
});

test("organ-scoped advice is hidden when no organ is selected", () => {
  const withoutOrgan = resolveEducationalAdvice(null, "caffeine", "during_use", publicationCatalog);
  assert.equal(withoutOrgan.empty, true);
  assert.equal(
    withoutOrgan.items.some((item) => item.id === fixtures.organSelfCareHeartCaffeineUse.id),
    false,
  );

  const applicable = matchApplicableAdvice(null, "alcohol", "during_use", catalog);
  assert.equal(
    applicable.items.some((item) => item.id === fixtures.organSelfCareLiverAlcoholUse.id),
    false,
  );
});

test("general and organ-scoped publishable advice coexist when an organ is selected", () => {
  const result = resolveEducationalAdvice(
    "liver",
    "alcohol",
    "acute_withdrawal",
    publicationCatalog,
  );
  const ids = result.items.map((item) => item.id);
  assert.equal(ids.includes(fixtures.publishableGeneralSafety.id), true);
  assert.equal(ids.includes(fixtures.publishableOrganLiverAlcoholAcute.id), true);
  assert.equal(
    result.items.some((item) => item.scope === "substance_phase"),
    true,
  );
  assert.equal(
    result.items.some((item) => item.scope === "organ"),
    true,
  );
});

test("contextual resolution requires a substance and a narrative phase", () => {
  assert.equal(
    resolveEducationalAdvice("liver", "", "acute_withdrawal", publicationCatalog).empty,
    true,
  );
  assert.equal(
    resolveEducationalAdvice(null, "alcohol", "", publicationCatalog).empty,
    true,
  );
  assert.equal(
    resolveEducationalAdvice("liver", "alcohol", "day_3", publicationCatalog).empty,
    true,
  );
});

test("publishable persistent safety is visible for any phase and organ", () => {
  for (const phase of ["during_use", "acute_withdrawal", "post_acute", "normalizing"] as const) {
    const persistent = resolvePersistentSafetyAdvice("alcohol", publicationCatalog);
    assert.equal(persistent.empty, false, phase);
    assert.deepEqual(
      persistent.items.map((item) => item.id),
      [fixtures.persistentPublishable.id],
    );
  }

  const withOrgan = resolvePersistentSafetyAdvice("alcohol", publicationCatalog);
  const withoutOrgan = resolvePersistentSafetyAdvice("alcohol", publicationCatalog);
  assert.deepEqual(
    withOrgan.items.map((item) => item.id),
    withoutOrgan.items.map((item) => item.id),
  );
  assert.equal(withOrgan.items[0]?.phases.includes("acute_withdrawal"), false);
});

test("pending persistent safety never appears in public resolvers", () => {
  const persistent = resolvePersistentSafetyAdvice("alcohol", publicationCatalog);
  assert.equal(
    persistent.items.some((item) => item.id === fixtures.persistentPending.id),
    false,
  );
  const contextual = resolveEducationalAdvice(
    "liver",
    "alcohol",
    "during_use",
    publicationCatalog,
  );
  assert.equal(
    contextual.items.some((item) => item.id === fixtures.persistentPending.id),
    false,
  );
});

test("seek_help and safety stay contextual unless alertSurface is persistent", () => {
  const persistent = resolvePersistentSafetyAdvice("alcohol", publicationCatalog);
  const persistentIds = persistent.items.map((item) => item.id);
  assert.equal(persistentIds.includes(fixtures.publishableSeekHelpContextual.id), false);
  assert.equal(persistentIds.includes(fixtures.publishableGeneralSafety.id), false);
  assert.equal(resolveAdviceAlertSurface(fixtures.publishableSeekHelpContextual), "contextual");
  assert.equal(resolveAdviceAlertSurface(fixtures.publishableGeneralSafety), "contextual");
  assert.equal(fixtures.publishableSeekHelpContextual.category, "seek_help");
  assert.equal(fixtures.publishableGeneralSafety.category, "safety");
});

test("partitionAdviceSurfaces drops contextual copies of persistent ids", () => {
  const persistent = resolvePersistentSafetyAdvice("alcohol", publicationCatalog);
  const contextual = resolveEducationalAdvice(
    "liver",
    "alcohol",
    "during_use",
    publicationCatalog,
  );
  assert.equal(
    contextual.items.some((item) => item.id === fixtures.persistentPublishable.id),
    true,
  );
  const partitioned = partitionAdviceSurfaces(persistent.items, contextual.items);
  assert.deepEqual(
    partitioned.persistent.map((item) => item.id),
    [fixtures.persistentPublishable.id],
  );
  assert.equal(
    partitioned.contextual.some((item) => item.id === fixtures.persistentPublishable.id),
    false,
  );
  const combined = [...partitioned.persistent, ...partitioned.contextual].map((item) => item.id);
  assert.equal(new Set(combined).size, combined.length);
});

test("the real published catalog yields no contextual or persistent advice", () => {
  assert.deepEqual(publishedAdviceCatalog, []);
  assert.equal(resolveEducationalAdvice(null, "alcohol", "acute_withdrawal").empty, true);
  assert.equal(resolvePersistentSafetyAdvice("alcohol").empty, true);
  assert.deepEqual(resolvePersistentSafetyAdvice("alcohol").items, []);
});

test("items without alertSurface remain contextual and compatible", () => {
  assert.equal("alertSurface" in fixtures.publishableGeneralSafety, false);
  assert.equal(resolveAdviceAlertSurface(fixtures.publishableGeneralSafety), "contextual");
  assert.equal(
    resolvePersistentSafetyAdvice("alcohol", [fixtures.publishableGeneralSafety]).empty,
    true,
  );
  assert.deepEqual([...adviceAlertSurfaces], ["contextual", "persistent_safety"]);
});

test("persistent safety requires a substance id", () => {
  assert.equal(resolvePersistentSafetyAdvice("", publicationCatalog).empty, true);
  assert.equal(resolvePersistentSafetyAdvice("   ", publicationCatalog).empty, true);
  assert.equal(resolvePersistentSafetyAdvice("nicotine", publicationCatalog).empty, true);
});

function publicCopy(entries: {
  en: Record<string, string>;
  es: Record<string, string>;
}) {
  function nest(map: Record<string, string>): unknown {
    const root: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(map)) {
      const parts = key.split(".");
      let current = root;
      for (const part of parts.slice(0, -1)) {
        const next = current[part];
        if (!next || typeof next !== "object") current[part] = {};
        current = current[part] as Record<string, unknown>;
      }
      current[parts[parts.length - 1] ?? ""] = value;
    }
    return root;
  }
  return { en: nest(entries.en), es: nest(entries.es) };
}

const completePublicCopy = publicCopy({
  en: {
    [fixtures.publishableGeneralSafety.titleKey]: "Alcohol withdrawal safety",
    [fixtures.publishableGeneralSafety.bodyKey]: "Seek medical advice before stopping suddenly.",
    [fixtures.persistentPublishable.titleKey]: "Persistent alcohol safety",
    [fixtures.persistentPublishable.bodyKey]: "This notice stays visible across educational phases.",
  },
  es: {
    [fixtures.publishableGeneralSafety.titleKey]: "Seguridad en la abstinencia de alcohol",
    [fixtures.publishableGeneralSafety.bodyKey]: "Consulta antes de interrumpir el consumo de forma brusca.",
    [fixtures.persistentPublishable.titleKey]: "Seguridad persistente del alcohol",
    [fixtures.persistentPublishable.bodyKey]: "Este aviso permanece visible en las fases educativas.",
  },
});

test("complete ES/EN copy plus clinical gates is ready for the published catalog", () => {
  assert.equal(isAdvicePublishable(fixtures.publishableGeneralSafety), true);
  assert.equal(hasCompletePublicAdviceCopy(fixtures.publishableGeneralSafety, completePublicCopy), true);
  assert.equal(
    isAdviceReadyForPublishedCatalog(fixtures.publishableGeneralSafety, completePublicCopy),
    true,
  );
  const assembled = assemblePublishedAdviceCatalog(
    [fixtures.publishableGeneralSafety],
    completePublicCopy,
  );
  assert.deepEqual(
    assembled.map((item) => item.id),
    [fixtures.publishableGeneralSafety.id],
  );
});

test("missing title or body in either public locale is not ready for publication", () => {
  const missingTitleEs = publicCopy({
    en: {
      [fixtures.publishableGeneralSafety.titleKey]: "Alcohol withdrawal safety",
      [fixtures.publishableGeneralSafety.bodyKey]: "Seek medical advice before stopping suddenly.",
    },
    es: {
      [fixtures.publishableGeneralSafety.bodyKey]: "Consulta antes de interrumpir el consumo de forma brusca.",
    },
  });
  const missingBodyEn = publicCopy({
    en: {
      [fixtures.publishableGeneralSafety.titleKey]: "Alcohol withdrawal safety",
    },
    es: {
      [fixtures.publishableGeneralSafety.titleKey]: "Seguridad en la abstinencia de alcohol",
      [fixtures.publishableGeneralSafety.bodyKey]: "Consulta antes de interrumpir el consumo de forma brusca.",
    },
  });
  assert.equal(isAdvicePublishable(fixtures.publishableGeneralSafety), true);
  assert.equal(isAdviceReadyForPublishedCatalog(fixtures.publishableGeneralSafety, missingTitleEs), false);
  assert.equal(isAdviceReadyForPublishedCatalog(fixtures.publishableGeneralSafety, missingBodyEn), false);
  assert.deepEqual(
    assemblePublishedAdviceCatalog([fixtures.publishableGeneralSafety], missingTitleEs),
    [],
  );
});

test("empty or unresolved public copy keys are not ready for publication", () => {
  const emptyValues = publicCopy({
    en: {
      [fixtures.publishableGeneralSafety.titleKey]: "   ",
      [fixtures.publishableGeneralSafety.bodyKey]: "Seek medical advice before stopping suddenly.",
    },
    es: {
      [fixtures.publishableGeneralSafety.titleKey]: "Seguridad en la abstinencia de alcohol",
      [fixtures.publishableGeneralSafety.bodyKey]: "Consulta antes de interrumpir el consumo de forma brusca.",
    },
  });
  const unresolved = publicCopy({
    en: {
      [fixtures.publishableGeneralSafety.titleKey]: fixtures.publishableGeneralSafety.titleKey,
      [fixtures.publishableGeneralSafety.bodyKey]: "Seek medical advice before stopping suddenly.",
    },
    es: {
      [fixtures.publishableGeneralSafety.titleKey]: "Seguridad en la abstinencia de alcohol",
      [fixtures.publishableGeneralSafety.bodyKey]: "Consulta antes de interrumpir el consumo de forma brusca.",
    },
  });
  assert.equal(isAdviceReadyForPublishedCatalog(fixtures.publishableGeneralSafety, emptyValues), false);
  assert.equal(isAdviceReadyForPublishedCatalog(fixtures.publishableGeneralSafety, unresolved), false);
  assert.equal(
    isAdviceReadyForPublishedCatalog(fixtures.publishableGeneralSafety, { en: {}, es: {} }),
    false,
  );
});

test("pending items with complete public copy are still not publishable", () => {
  assert.equal(hasCompletePublicAdviceCopy(fixtures.verifiedPendingReview, completePublicCopy), false);
  const pendingCopy = publicCopy({
    en: {
      [fixtures.verifiedPendingReview.titleKey]: "Pending title",
      [fixtures.verifiedPendingReview.bodyKey]: "Pending body",
    },
    es: {
      [fixtures.verifiedPendingReview.titleKey]: "Título pendiente",
      [fixtures.verifiedPendingReview.bodyKey]: "Cuerpo pendiente",
    },
  });
  assert.equal(hasCompletePublicAdviceCopy(fixtures.verifiedPendingReview, pendingCopy), true);
  assert.equal(isAdvicePublishable(fixtures.verifiedPendingReview), false);
  assert.equal(isAdviceReadyForPublishedCatalog(fixtures.verifiedPendingReview, pendingCopy), false);
  assert.deepEqual(assemblePublishedAdviceCatalog([fixtures.verifiedPendingReview], pendingCopy), []);
});

test("persistent safety without public copy does not enter the published catalog", () => {
  assert.equal(isAdvicePublishable(fixtures.persistentPublishable), true);
  assert.equal(
    isAdviceReadyForPublishedCatalog(fixtures.persistentPublishable, { en: {}, es: {} }),
    false,
  );
  assert.deepEqual(
    assemblePublishedAdviceCatalog([fixtures.persistentPublishable], { en: {}, es: {} }),
    [],
  );
  const assembled = assemblePublishedAdviceCatalog(
    [fixtures.persistentPublishable],
    completePublicCopy,
  );
  assert.deepEqual(
    assembled.map((item) => item.id),
    [fixtures.persistentPublishable.id],
  );
});

test("the real published catalog stays empty and is assembled, not inferred", () => {
  assert.deepEqual(publishedAdviceCandidates, []);
  assert.deepEqual(publishedAdviceCopyBundles, { en: {}, es: {} });
  assert.deepEqual(publishedAdviceCatalog, []);
  assert.deepEqual(
    assemblePublishedAdviceCatalog(publishedAdviceCandidates, publishedAdviceCopyBundles),
    [],
  );
});

test("an organ-scoped persistent_safety payload is discarded at runtime", () => {
  const invalidOrganPersistent = {
    ...fixtures.organSelfCareHeartCaffeineUse,
    alertSurface: "persistent_safety",
  } as EducationalAdviceItem;
  const persistent = resolvePersistentSafetyAdvice("caffeine", [invalidOrganPersistent]);
  assert.equal(persistent.empty, true);
  assert.deepEqual(persistent.items, []);
  assert.equal(resolveAdviceAlertSurface(invalidOrganPersistent), "contextual");
});
