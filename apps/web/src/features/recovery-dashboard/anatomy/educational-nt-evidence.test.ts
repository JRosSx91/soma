import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  authoredEducationalNtEvidenceCatalog,
  educationalNtClaimKinds,
  educationalNtClaimSupports,
  educationalNtClinicalReviews,
  educationalNtEvidenceId,
  educationalNtEvidenceIssues,
  educationalNtEvidenceScopes,
  educationalNtProfilePhaseToken,
  educationalNtSourceStatuses,
  educationalNtWorkIdentifications,
  isEducationalNtEvidenceConsistent,
  isEducationalNtEvidencePublishable,
  projectPublishedEducationalNtEvidence,
  publishedEducationalNtEvidenceCatalog,
  resolveEducationalNtEvidence,
  type EducationalNtEvidenceRecord,
} from "./educational-nt-evidence.ts";
import { narrativePhases } from "./narrative-catalog.ts";
import { educationalNtProfiles } from "./neurotransmitter-education.ts";

function record(
  patch: Partial<EducationalNtEvidenceRecord> &
    Pick<EducationalNtEvidenceRecord, "phase" | "claimKind" | "slug">,
): EducationalNtEvidenceRecord {
  const base = {
    substanceId: "alcohol" as const,
    neurotransmitter: "gaba" as const,
    mechanismKey: "GABAA_POTENTIATION",
    reference: {
      source: "",
      identification: "absent" as const,
      status: "insufficient" as const,
    },
    claimSupport: "unverified" as const,
    clinicalReview: "not_applicable" as const,
    evidenceScope: "mechanism_only" as const,
    limitations: "",
    ...patch,
  };
  return {
    ...base,
    id: educationalNtEvidenceId(base),
  };
}

const verifiedPartial = {
  source: "Fixture Review (1999).",
  identification: "identified" as const,
  status: "verified" as const,
};

const fixtures = {
  profileMechanism: record({
    phase: null,
    claimKind: "mechanism",
    slug: "gaba-a-potentiation",
    reference: verifiedPartial,
    claimSupport: "partial",
    evidenceScope: "mechanism_only",
    limitations: "Fixture: mechanism only, not a recovery timeline.",
  }),
  acuteSafetyReviewed: record({
    phase: "acute_withdrawal",
    claimKind: "clinical_safety",
    slug: "seizure-risk",
    reference: {
      source: "Fixture Criteria (2022).",
      identification: "identified",
      status: "verified",
    },
    claimSupport: "partial",
    clinicalReview: "reviewed",
    evidenceScope: "this_phase",
    limitations: "Fixture: clinical withdrawal risk, not GABA concentration.",
  }),
  acuteSafetyPending: record({
    phase: "acute_withdrawal",
    claimKind: "clinical_safety",
    slug: "seizure-risk-pending",
    reference: {
      source: "Fixture Criteria (2022).",
      identification: "identified",
      status: "verified",
    },
    claimSupport: "partial",
    clinicalReview: "pending",
    evidenceScope: "this_phase",
  }),
  acuteSafetyReviewedUnverifiedClaim: record({
    phase: "acute_withdrawal",
    claimKind: "clinical_safety",
    slug: "reviewed-without-claim-support",
    reference: {
      source: "Fixture Criteria (2022).",
      identification: "identified",
      status: "verified",
    },
    claimSupport: "unverified",
    clinicalReview: "reviewed",
    evidenceScope: "this_phase",
  }),
  acuteSymptomUnverified: record({
    phase: "acute_withdrawal",
    claimKind: "withdrawal_symptom",
    slug: "anxiety-tremor",
    evidenceScope: "symptoms_not_receptors",
  }),
  acuteSymptomPublishable: record({
    phase: "acute_withdrawal",
    claimKind: "withdrawal_symptom",
    slug: "tremor-reported",
    reference: {
      source: "Fixture Symptom Review (2004).",
      identification: "identified",
      status: "verified",
    },
    claimSupport: "partial",
    evidenceScope: "symptoms_not_receptors",
  }),
  postAcuteAdaptation: record({
    phase: "post_acute",
    claimKind: "neuroadaptation",
    slug: "inhibitory-tone",
    reference: {
      source: "Fixture Adaptation Paper (2010).",
      identification: "identified",
      status: "verified",
    },
    claimSupport: "partial",
    evidenceScope: "not_individual_timeline",
  }),
  cocaineDat: record({
    substanceId: "cocaine",
    neurotransmitter: "dopamine",
    mechanismKey: "DAT_BLOCKADE",
    phase: null,
    claimKind: "mechanism",
    slug: "dat-blockade",
    reference: {
      source: "Fixture Stimulant Review (2016).",
      identification: "identified",
      status: "verified",
    },
    claimSupport: "supported",
    evidenceScope: "mechanism_only",
  }),
  unsupportedWithVerifiedSource: record({
    phase: null,
    claimKind: "mechanism",
    slug: "more-striatal-da",
    reference: {
      source: "Fixture Imaging Paper (2015).",
      identification: "identified",
      status: "verified",
    },
    claimSupport: "unsupported",
    evidenceScope: "mechanism_only",
    limitations: "Fixture: the work does not support this sentence.",
  }),
  unverifiedIdentifiedWork: record({
    phase: null,
    claimKind: "mechanism",
    slug: "identified-unverified",
    reference: {
      source: "Fixture Textbook, 5th ed.",
      identification: "identified",
      status: "unverified",
    },
    claimSupport: "unverified",
  }),
  verifiedCitationUnverifiedClaim: record({
    phase: "during_use",
    claimKind: "acute_effect",
    slug: "citation-verified-claim-open",
    reference: verifiedPartial,
    claimSupport: "unverified",
    evidenceScope: "this_phase",
  }),
} as const;

const authoredFixtureCatalog: readonly EducationalNtEvidenceRecord[] = [
  fixtures.profileMechanism,
  fixtures.acuteSafetyReviewed,
  fixtures.acuteSafetyPending,
  fixtures.acuteSafetyReviewedUnverifiedClaim,
  fixtures.acuteSymptomUnverified,
  fixtures.acuteSymptomPublishable,
  fixtures.postAcuteAdaptation,
  fixtures.cocaineDat,
  fixtures.unsupportedWithVerifiedSource,
  fixtures.unverifiedIdentifiedWork,
  fixtures.verifiedCitationUnverifiedClaim,
];

test("authored and published neurotransmitter evidence catalogs stay empty", () => {
  assert.deepEqual(authoredEducationalNtEvidenceCatalog, []);
  assert.deepEqual(publishedEducationalNtEvidenceCatalog, []);
  assert.deepEqual(
    projectPublishedEducationalNtEvidence(authoredEducationalNtEvidenceCatalog),
    publishedEducationalNtEvidenceCatalog,
  );
  for (const profile of educationalNtProfiles) {
    const resolved = resolveEducationalNtEvidence(
      profile.substanceId,
      profile.neurotransmitter,
      "during_use",
    );
    assert.equal(resolved.empty, true);
    assert.deepEqual(resolved.mechanismItems, []);
    assert.deepEqual(resolved.phaseItems, []);
  }
});

test("the public catalog is a pure projection of publishable authored rows", () => {
  const published = projectPublishedEducationalNtEvidence(authoredFixtureCatalog);
  assert.deepEqual(
    published.map((item) => item.slug),
    [
      "gaba-a-potentiation",
      "seizure-risk",
      "tremor-reported",
      "inhibitory-tone",
      "dat-blockade",
    ],
  );
  assert.equal(
    published.every((item) => isEducationalNtEvidencePublishable(item)),
    true,
  );
  assert.equal(
    published.some((item) => item.claimSupport === "unsupported"),
    false,
  );
  assert.equal(
    published.some((item) => item.claimSupport === "unverified"),
    false,
  );
  assert.deepEqual(authoredEducationalNtEvidenceCatalog, []);
  assert.deepEqual(publishedEducationalNtEvidenceCatalog, []);
});

test("claim ids are deterministic and unique across fixtures", () => {
  assert.equal(
    educationalNtEvidenceId({
      substanceId: "alcohol",
      neurotransmitter: "gaba",
      phase: null,
      claimKind: "mechanism",
      slug: "gaba-a-potentiation",
    }),
    `alcohol.gaba.${educationalNtProfilePhaseToken}.mechanism.gaba-a-potentiation`,
  );
  assert.equal(
    educationalNtEvidenceId(fixtures.acuteSafetyReviewed),
    "alcohol.gaba.acute_withdrawal.clinical_safety.seizure-risk",
  );
  const ids = authoredFixtureCatalog.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.notEqual(fixtures.acuteSafetyReviewed.id, fixtures.acuteSymptomPublishable.id);
});

test("references are optional and missing sources stay unverified", () => {
  const absent = fixtures.acuteSymptomUnverified;
  assert.equal(absent.reference.source, "");
  assert.equal(absent.reference.identification, "absent");
  assert.equal(absent.reference.status, "insufficient");
  assert.equal(absent.claimSupport, "unverified");
  assert.equal(isEducationalNtEvidenceConsistent(absent), true);
  assert.equal(isEducationalNtEvidencePublishable(absent), false);
});

test("identified work is independent of claim support", () => {
  assert.equal(isEducationalNtEvidenceConsistent(fixtures.unverifiedIdentifiedWork), true);
  assert.equal(fixtures.unverifiedIdentifiedWork.claimSupport, "unverified");
  assert.equal(fixtures.unverifiedIdentifiedWork.reference.identification, "identified");
  assert.equal(isEducationalNtEvidencePublishable(fixtures.unverifiedIdentifiedWork), false);
});

test("supported partial and unsupported require an identified verified source", () => {
  for (const support of ["supported", "partial", "unsupported"] as const) {
    const invalid = record({
      phase: null,
      claimKind: "mechanism",
      slug: `invalid-${support}`,
      claimSupport: support,
    });
    assert.equal(isEducationalNtEvidenceConsistent(invalid), false);
    assert.equal(isEducationalNtEvidencePublishable(invalid), false);
    assert.ok(
      educationalNtEvidenceIssues(invalid).some((issue) => issue.code.endsWith("without_verified_source")),
    );
  }
  assert.equal(isEducationalNtEvidenceConsistent(fixtures.cocaineDat), true);
  assert.equal(fixtures.cocaineDat.claimSupport, "supported");
  assert.equal(fixtures.profileMechanism.claimSupport, "partial");
});

test("a missing reference is not recorded as a false claim", () => {
  const markedFalse = record({
    phase: "normalizing",
    claimKind: "neuroadaptation",
    slug: "false-without-source",
    claimSupport: "unsupported",
  });
  const issues = educationalNtEvidenceIssues(markedFalse).map((issue) => issue.code);
  assert.equal(issues.includes("missing_reference_marked_false"), true);
  assert.equal(issues.includes("unsupported_without_verified_source"), true);
  assert.equal(isEducationalNtEvidencePublishable(markedFalse), false);
});

test("unsupported rows stay editorial and never publish", () => {
  assert.equal(isEducationalNtEvidenceConsistent(fixtures.unsupportedWithVerifiedSource), true);
  assert.equal(fixtures.unsupportedWithVerifiedSource.claimSupport, "unsupported");
  assert.equal(isEducationalNtEvidencePublishable(fixtures.unsupportedWithVerifiedSource), false);
  const resolved = resolveEducationalNtEvidence(
    "alcohol",
    "gaba",
    "during_use",
    authoredFixtureCatalog,
  );
  assert.equal(
    resolved.mechanismItems.some((item) => item.slug === "more-striatal-da"),
    false,
  );
});

test("unverified rows never publish", () => {
  assert.equal(isEducationalNtEvidencePublishable(fixtures.unverifiedIdentifiedWork), false);
  assert.equal(isEducationalNtEvidencePublishable(fixtures.acuteSymptomUnverified), false);
});

test("a verified citation without claim support does not publish", () => {
  assert.equal(fixtures.verifiedCitationUnverifiedClaim.reference.status, "verified");
  assert.equal(fixtures.verifiedCitationUnverifiedClaim.claimSupport, "unverified");
  assert.equal(isEducationalNtEvidenceConsistent(fixtures.verifiedCitationUnverifiedClaim), true);
  assert.equal(isEducationalNtEvidencePublishable(fixtures.verifiedCitationUnverifiedClaim), false);
});

test("clinical safety cannot skip clinical review", () => {
  const skipped = record({
    phase: "acute_withdrawal",
    claimKind: "clinical_safety",
    slug: "skip-review",
    clinicalReview: "not_applicable",
  });
  assert.equal(
    educationalNtEvidenceIssues(skipped).some((issue) => issue.code === "clinical_safety_not_applicable"),
    true,
  );
  assert.equal(isEducationalNtEvidencePublishable(skipped), false);
});

test("clinical safety without professional review does not publish", () => {
  assert.equal(isEducationalNtEvidenceConsistent(fixtures.acuteSafetyPending), true);
  assert.equal(fixtures.acuteSafetyPending.clinicalReview, "pending");
  assert.equal(isEducationalNtEvidencePublishable(fixtures.acuteSafetyPending), false);
});

test("clinical review does not substitute bibliographic claim support", () => {
  assert.equal(fixtures.acuteSafetyReviewedUnverifiedClaim.clinicalReview, "reviewed");
  assert.equal(fixtures.acuteSafetyReviewedUnverifiedClaim.claimSupport, "unverified");
  assert.equal(isEducationalNtEvidencePublishable(fixtures.acuteSafetyReviewedUnverifiedClaim), false);
  assert.equal(isEducationalNtEvidencePublishable(fixtures.acuteSafetyReviewed), true);
});

test("the public resolver splits mechanism rows from phase rows", () => {
  const during = resolveEducationalNtEvidence(
    "alcohol",
    "gaba",
    "during_use",
    authoredFixtureCatalog,
  );
  assert.equal(during.empty, false);
  assert.deepEqual(
    during.mechanismItems.map((item) => item.id),
    [fixtures.profileMechanism.id],
  );
  assert.deepEqual(during.phaseItems, []);
  assert.equal(
    during.mechanismItems.every((item) => item.phase === null && item.evidenceScope === "mechanism_only"),
    true,
  );

  const acute = resolveEducationalNtEvidence(
    "alcohol",
    "gaba",
    "acute_withdrawal",
    authoredFixtureCatalog,
  );
  assert.deepEqual(
    acute.mechanismItems.map((item) => item.slug),
    ["gaba-a-potentiation"],
  );
  assert.deepEqual(
    acute.phaseItems.map((item) => item.slug).sort(),
    ["seizure-risk", "tremor-reported"],
  );
  assert.equal(
    acute.phaseItems.some((item) => item.phase === null),
    false,
  );
  assert.equal(
    acute.phaseItems.some((item) => item.phase === "post_acute"),
    false,
  );
  assert.equal(
    acute.phaseItems.some((item) => item.slug === "seizure-risk-pending"),
    false,
  );

  const post = resolveEducationalNtEvidence("alcohol", "gaba", "post_acute", authoredFixtureCatalog);
  assert.deepEqual(
    post.mechanismItems.map((item) => item.slug),
    ["gaba-a-potentiation"],
  );
  assert.deepEqual(
    post.phaseItems.map((item) => item.slug),
    ["inhibitory-tone"],
  );
  assert.equal(
    post.phaseItems.some((item) => item.claimKind === "clinical_safety"),
    false,
  );
});

test("one phase can carry several public claims without collapsing them", () => {
  const acute = resolveEducationalNtEvidence(
    "alcohol",
    "gaba",
    "acute_withdrawal",
    authoredFixtureCatalog,
  );
  assert.equal(acute.phaseItems.length, 2);
  assert.equal(new Set(acute.phaseItems.map((item) => item.claimKind)).size, 2);
});

test("unknown identities resolve empty without inventing citations", () => {
  const unknown = resolveEducationalNtEvidence("unknown", "gaba", "during_use", authoredFixtureCatalog);
  assert.equal(unknown.empty, true);
  assert.deepEqual(unknown.mechanismItems, []);
  assert.deepEqual(unknown.phaseItems, []);
  const badPhase = resolveEducationalNtEvidence("alcohol", "gaba", "week-two", authoredFixtureCatalog);
  assert.equal(badPhase.empty, true);
  const emptyCatalog = resolveEducationalNtEvidence("alcohol", "gaba", "during_use", []);
  assert.equal(emptyCatalog.empty, true);
  assert.equal(emptyCatalog.mechanismItems.length, 0);
  assert.equal(emptyCatalog.phaseItems.length, 0);
});

test("the sidecar does not inherit narrative recovery or seed bibliography", () => {
  const source = readFileSync(new URL("./educational-nt-evidence.ts", import.meta.url), "utf8");
  for (const token of [
    "narrativeCatalogPairs",
    "publishedAdviceCatalog",
    "recoveryCatalogPairs",
    "prisma",
    "neurotransmitter-profiles",
    "useNeurotransmitterState",
    "/me/neurotransmitter-state",
    "daysTo95Recovery",
    "confidenceLevel",
    "isAdvicePublishable",
  ]) {
    assert.equal(source.includes(token), false, token);
  }
  assert.equal(
    source.includes("Koob") || source.includes("Stahl") || source.includes("Fredholm"),
    false,
  );
  assert.equal(source.includes("Ritz") || source.includes("Volkow"), false);
  assert.equal(narrativePhases.length, 4);
});

test("the atlas still does not present sidecar evidence or verified badges", () => {
  const page = readFileSync(new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url), "utf8");
  const card = readFileSync(
    new URL("../components/EducationalSignalingCard.tsx", import.meta.url),
    "utf8",
  );
  const education = readFileSync(new URL("./neurotransmitter-education.ts", import.meta.url), "utf8");
  assert.equal(page.includes("educational-nt-evidence"), false);
  assert.equal(page.includes("resolveEducationalNtEvidence"), false);
  assert.equal(page.includes("authoredEducationalNtEvidenceCatalog"), false);
  assert.match(page, /signalingAttribution/);
  assert.equal(card.includes("educational-nt-evidence"), false);
  assert.equal(card.includes("verified"), false);
  assert.equal(education.includes("educational-nt-evidence"), false);
});

test("contract enumerations stay aligned with the sidecar kinds", () => {
  assert.deepEqual(educationalNtClaimKinds, [
    "mechanism",
    "acute_effect",
    "neuroadaptation",
    "withdrawal_symptom",
    "clinical_safety",
  ]);
  assert.deepEqual(educationalNtClaimSupports, ["supported", "partial", "unsupported", "unverified"]);
  assert.deepEqual(educationalNtClinicalReviews, ["not_applicable", "pending", "reviewed"]);
  assert.deepEqual(educationalNtWorkIdentifications, ["identified", "absent"]);
  assert.deepEqual(educationalNtSourceStatuses, ["verified", "unverified", "pending", "insufficient"]);
  assert.deepEqual(educationalNtEvidenceScopes, [
    "mechanism_only",
    "this_phase",
    "symptoms_not_receptors",
    "not_individual_timeline",
  ]);
});
