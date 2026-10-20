import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  adviceCategories,
  adviceI18nPublicationContract,
  isAdvicePublishable,
  matchApplicableAdvice,
  publishedAdviceCatalog,
  resolveEducationalAdvice,
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
    assert.deepEqual(publishedIds(organId, "alcohol", "acute_withdrawal"), [
      fixtures.publishableGeneralSafety.id,
    ]);
  }
});

test("i18n publication checks are deferred until UI integration", () => {
  assert.deepEqual([...adviceI18nPublicationContract.keys], ["titleKey", "bodyKey"]);
  assert.deepEqual([...adviceI18nPublicationContract.locales], ["en", "es"]);
  assert.equal(adviceI18nPublicationContract.enforcedWhen, "ui-integration");
  const source = readFileSync(new URL("./advice-catalog.ts", import.meta.url), "utf8");
  assert.match(source, /same substance and phase choices as/);
  assert.match(source, /Selectors are not implemented here/);
});

test("discriminated scope types keep mandatory arrays non-empty", () => {
  const checks = {
    organIdsNonEmpty: true,
    substanceIdsNonEmpty: true,
    phasesNonEmpty: true,
    generalHasNoOrganIds: true,
    organRequiresOrganIds: true,
  } satisfies AdviceCatalogTypeChecks;

  const general: SubstancePhaseAdviceItem = fixtures.publishableGeneralSafety;
  const organ: OrganAdviceItem = fixtures.organSelfCareHeartCaffeineUse;
  assert.equal("organIds" in general, false);
  assert.equal(organ.organIds.length > 0, true);
  assert.equal(general.substanceIds.length > 0, true);
  assert.equal(general.phases.length > 0, true);
  assert.equal(checks.organIdsNonEmpty, true);
});
