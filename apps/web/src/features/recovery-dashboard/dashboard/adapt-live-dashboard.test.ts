import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { estimateCurve } from "@soma/shared-types";
import type { ApiSubstance } from "../../substances/index.js";
import type { OrganState } from "../../profile/index.js";
import type { ProfileUsage } from "../../profile/types.js";
import type { OrganId } from "@soma/shared-types";
import {
  adaptServerProfile,
  buildLiveChart,
  buildLiveDashboard,
  formatDaysAbstinent,
  LIVE_AXIS_DAYS,
  substanceProgress,
  todayPositionOnAxis,
  type SubstanceProgressResult,
} from "./adapt-live-dashboard.ts";
import { recoveryCopyFromSource, SPANISH_RECOVERY_COPY } from "./recovery-copy.ts";
import enRecovery from "../../../i18n/locales/en/recovery.json" with { type: "json" };

const ENGLISH_RECOVERY_COPY = recoveryCopyFromSource((key) => {
  const value = (enRecovery as Record<string, string>)[key];
  return value ?? key;
});

function readyFraction(progress: SubstanceProgressResult): number {
  assert.equal(progress.availability, "ready");
  assert.ok(progress.progressFraction != null);
  return progress.progressFraction;
}

const now = Date.parse("2026-10-18T12:00:00.000Z");

function curve(
  organId: OrganId,
  system: ApiSubstance["recoveryCurves"][number]["organ"]["system"],
  daysTo95Recovery: number,
  recoveryCeiling = 1,
): ApiSubstance["recoveryCurves"][number] {
  return {
    id: `${organId}-curve`,
    organId,
    substanceId: "nicotine",
    shape: "logarithmic",
    daysTo95Recovery,
    recoveryCeiling,
    confidenceLevel: "high",
    referenceSource: "test",
    organ: {
      id: organId,
      name: organId,
      system,
      shortDescription: "test",
    },
  };
}

const nicotine: ApiSubstance = {
  id: "nicotine",
  name: "Nicotine",
  category: "nicotine",
  shortDescription: "test",
  damageProfiles: [],
  recoveryCurves: [
    curve("lungs", "respiratory", 365, 0.75),
    curve("bronchi", "respiratory", 270, 0.9),
    curve("heart", "cardiovascular", 365, 0.9),
  ],
  achievements: [],
};

const cannabis: ApiSubstance = {
  id: "cannabis",
  name: "Cannabis",
  category: "cannabinoid",
  shortDescription: "test",
  damageProfiles: [],
  recoveryCurves: [curve("lungs", "respiratory", 180, 0.9)],
  achievements: [],
};

test("adaptServerProfile keeps usages without inventing dates", () => {
  const adapted = adaptServerProfile({
    user: {
      id: "u1",
      email: "a@b.c",
      displayName: "Ada",
      biologicalSex: "female",
      birthYear: 1990,
      weightKg: null,
    },
    usages: [
      {
        id: "1",
        userId: "u1",
        substanceId: "nicotine",
        yearStarted: 2018,
        lastUseDate: "2026-10-03T00:00:00.000Z",
        frequency: "daily",
        status: "abstinent",
        createdAt: "",
        updatedAt: "",
      },
    ],
  });
  assert.equal(adapted.usages.length, 1);
  assert.equal(adapted.usages[0]?.lastUseDate, "2026-10-03T00:00:00.000Z");
  assert.equal(adapted.usages[0]?.status, "abstinent");
});

test("single abstinent substance drives cards, systems and chart from computeRecovery", () => {
  const usage: ProfileUsage = {
    substanceId: "nicotine",
    yearStarted: 2018,
    lastUseDate: "2026-10-03T00:00:00.000Z",
    frequency: "daily",
    status: "abstinent",
  };
  const progress = substanceProgress(usage, nicotine, now);
  const progressFraction = readyFraction(progress);
  assert.ok(progress.daysAbstinent > 14 && progress.daysAbstinent < 16);
  assert.ok(progressFraction > 0);
  assert.ok(progressFraction < 1);

  const organStates = new Map<OrganId, OrganState>([
    [
      "lungs",
      {
        organId: "lungs",
        organName: "Lungs",
        progressFraction,
        absoluteRecovery: progressFraction * 0.75,
        daysAbstinent: progress.daysAbstinent,
        dominantSubstanceId: "nicotine",
        confidenceLevel: "high",
        dominantStatus: "abstinent",
        contributingSubstances: [
          { substanceId: "nicotine", status: "abstinent", progressFraction },
        ],
      },
    ],
  ]);

  const model = buildLiveDashboard({
    usages: [usage],
    substances: [nicotine],
    organStates,
    substanceId: null,
    now,
  });

  assert.equal(model.substances.length, 1);
  assert.equal(model.substances[0]?.id, "nicotine");
  assert.match(model.substances[0]?.abstinence ?? "", /días/);
  assert.equal(model.substances[0]?.bar, progressFraction);
  assert.ok(model.systems.some((item) => item.id === "respiratory"));
  assert.ok(model.chart.series.length >= 1);

  const lungsSeries = model.chart.series.find((item) => item.id === "respiratory");
  assert.ok(lungsSeries);
  const expectedDay30 = estimateCurve(30, {
    shape: "logarithmic",
    daysTo95Recovery: 270,
    recoveryCeiling: 0.9,
  }).curveProgress;
  // Worst of lungs(365) and bronchi(270) at day 30 is the lower progress.
  const lungs30 = estimateCurve(30, {
    shape: "logarithmic",
    daysTo95Recovery: 365,
    recoveryCeiling: 0.75,
  }).curveProgress;
  assert.equal(lungsSeries.samples[1], Math.min(lungs30, expectedDay30));
});

test("multiple substances keep separate cards and filter chart by substance", () => {
  const usages: ProfileUsage[] = [
    {
      substanceId: "nicotine",
      yearStarted: 2018,
      lastUseDate: "2026-09-18T00:00:00.000Z",
      frequency: "daily",
      status: "abstinent",
    },
    {
      substanceId: "cannabis",
      yearStarted: 2020,
      lastUseDate: "2026-08-18T00:00:00.000Z",
      frequency: "weekly",
      status: "abstinent",
    },
  ];

  const modelAll = buildLiveDashboard({
    usages,
    substances: [nicotine, cannabis],
    organStates: new Map(),
    substanceId: null,
    now,
  });
  assert.equal(modelAll.substances.length, 2);

  const onlyCannabis = buildLiveChart({
    usages,
    substances: [nicotine, cannabis],
    substanceId: "cannabis",
    now,
  });
  assert.ok(onlyCannabis.series.every((item) => item.id === "respiratory"));
  const sample = onlyCannabis.series[0]?.samples[LIVE_AXIS_DAYS.indexOf(180)];
  const expected = estimateCurve(180, {
    shape: "logarithmic",
    daysTo95Recovery: 180,
    recoveryCeiling: 0.9,
  }).curveProgress;
  assert.equal(sample, expected);
});

test("filtering by substance uses that substance contribution, not the multi-substance worst", () => {
  const usages: ProfileUsage[] = [
    {
      substanceId: "nicotine",
      yearStarted: 2018,
      lastUseDate: "2026-10-03T00:00:00.000Z",
      frequency: "daily",
      status: "abstinent",
    },
    {
      substanceId: "cannabis",
      yearStarted: 2020,
      lastUseDate: "2026-02-18T00:00:00.000Z",
      frequency: "weekly",
      status: "abstinent",
    },
  ];
  const organStates = new Map<OrganId, OrganState>([
    [
      "lungs",
      {
        organId: "lungs",
        organName: "Lungs",
        progressFraction: 0.2,
        absoluteRecovery: 0.15,
        daysAbstinent: 15,
        dominantSubstanceId: "nicotine",
        confidenceLevel: "high",
        dominantStatus: "abstinent",
        contributingSubstances: [
          { substanceId: "nicotine", status: "abstinent", progressFraction: 0.2 },
          { substanceId: "cannabis", status: "abstinent", progressFraction: 0.95 },
        ],
      },
    ],
  ]);

  const forCannabis = buildLiveDashboard({
    usages,
    substances: [nicotine, cannabis],
    organStates,
    substanceId: "cannabis",
    now,
  });
  assert.equal(forCannabis.systems.find((item) => item.id === "respiratory")?.endLabel, "95%");
  assert.equal(forCannabis.changes[0]?.endLabel, "95%");
  assert.match(forCannabis.changes[0]?.body ?? "", /cannabis/);
  assert.doesNotMatch(forCannabis.changes[0]?.body ?? "", /nicotina/);
});

test("multi-substance overlay hides Today and keeps checkpoint axis", () => {
  const usages: ProfileUsage[] = [
    {
      substanceId: "nicotine",
      yearStarted: 2018,
      lastUseDate: "2026-09-18T00:00:00.000Z",
      frequency: "daily",
      status: "abstinent",
    },
    {
      substanceId: "cannabis",
      yearStarted: 2020,
      lastUseDate: "2026-05-18T00:00:00.000Z",
      frequency: "weekly",
      status: "abstinent",
    },
  ];

  const overlay = buildLiveChart({
    usages,
    substances: [nicotine, cannabis],
    substanceId: null,
    now,
  });
  assert.equal(overlay.showToday, false);
  assert.equal(overlay.todayLabel, "");
  assert.equal(overlay.footnote, SPANISH_RECOVERY_COPY.liveFootnoteOverlay);
  assert.doesNotMatch(overlay.footnote, /«Hoy» usa los días reales/);
  assert.ok(overlay.series.length > 0);
  for (const series of overlay.series) {
    assert.equal(series.endLabel, "");
    assert.doesNotMatch(series.endLabel, /Hoy/);
    assert.match(series.referenceAtYearLabel ?? "", /^día 365 · /);
    assert.equal(series.samples.length, LIVE_AXIS_DAYS.length);
    assert.deepEqual([...LIVE_AXIS_DAYS], [0, 30, 90, 180, 365]);
  }

  const filtered = buildLiveChart({
    usages,
    substances: [nicotine, cannabis],
    substanceId: "cannabis",
    now,
  });
  assert.equal(filtered.showToday, true);
  assert.match(filtered.todayLabel, /^Hoy · .+ · Cannabis$/);
  assert.equal(filtered.footnote, SPANISH_RECOVERY_COPY.liveFootnote);
  assert.match(filtered.series[0]?.endLabel ?? "", /^Hoy · \d+ % de la curva$/);
  assert.deepEqual([...filtered.axisLabels], [...overlay.axisLabels]);
  assert.equal(filtered.series[0]?.samples.length, LIVE_AXIS_DAYS.length);
});

test("single-substance unfiltered chart still shows Today", () => {
  const chart = buildLiveChart({
    usages: [
      {
        substanceId: "nicotine",
        yearStarted: 2018,
        lastUseDate: "2026-09-06T00:00:00.000Z",
        frequency: "daily",
        status: "abstinent",
      },
    ],
    substances: [nicotine],
    substanceId: null,
    now,
  });
  assert.equal(chart.showToday, true);
  assert.match(chart.todayLabel, /^Hoy · .+ · Nicotina$/);
  assert.match(chart.series[0]?.endLabel ?? "", /^Hoy · /);
  assert.equal(chart.footnote, SPANISH_RECOVERY_COPY.liveFootnote);
});

test("teeth uses atlas integumentary label instead of generic Órgano", () => {
  const nicotineWithTeeth: ApiSubstance = {
    ...nicotine,
    recoveryCurves: [
      ...nicotine.recoveryCurves,
      curve("teeth", "integumentary", 365, 0.8),
    ],
  };
  const usage: ProfileUsage = {
    substanceId: "nicotine",
    yearStarted: 2018,
    lastUseDate: "2026-10-03T00:00:00.000Z",
    frequency: "daily",
    status: "abstinent",
  };
  const progress = substanceProgress(usage, nicotineWithTeeth, now);
  const organStates = new Map<OrganId, OrganState>([
    [
      "teeth",
      {
        organId: "teeth",
        organName: "Teeth",
        progressFraction: 0.45,
        absoluteRecovery: 0.36,
        daysAbstinent: progress.daysAbstinent,
        dominantSubstanceId: "nicotine",
        confidenceLevel: "medium",
        dominantStatus: "abstinent",
        contributingSubstances: [
          { substanceId: "nicotine", status: "abstinent", progressFraction: 0.45 },
        ],
      },
    ],
  ]);

  const model = buildLiveDashboard({
    usages: [usage],
    substances: [nicotineWithTeeth],
    organStates,
    substanceId: "nicotine",
    now,
  });

  const teethCard = model.changes.find((item) => item.id === "teeth");
  assert.ok(teethCard);
  assert.equal(teethCard.system, "Sistema tegumentario");
  assert.doesNotMatch(teethCard.system, /Órgano/);
  // integumentary stays off the tile/chart surface (SYSTEM_META null) — label only.
  assert.equal(
    model.systems.some((item) => item.id === "integumentary"),
    false,
  );
  assert.equal(
    model.chart.series.some((item) => item.id === "integumentary"),
    false,
  );
});

test("testes uses atlas reproductive label instead of generic Órgano", () => {
  const cannabisWithGonads: ApiSubstance = {
    ...cannabis,
    recoveryCurves: [
      ...cannabis.recoveryCurves,
      curve("testes", "reproductive", 180, 0.95),
    ],
  };
  const usage: ProfileUsage = {
    substanceId: "cannabis",
    yearStarted: 2020,
    lastUseDate: "2026-07-23T00:00:00.000Z",
    frequency: "weekly",
    status: "abstinent",
  };
  const organStates = new Map<OrganId, OrganState>([
    [
      "testes",
      {
        organId: "testes",
        organName: "Testes",
        progressFraction: 0.46,
        absoluteRecovery: 0.44,
        daysAbstinent: 87,
        dominantSubstanceId: "cannabis",
        confidenceLevel: "low",
        dominantStatus: "abstinent",
        contributingSubstances: [
          { substanceId: "cannabis", status: "abstinent", progressFraction: 0.46 },
        ],
      },
    ],
  ]);

  const model = buildLiveDashboard({
    usages: [usage],
    substances: [cannabisWithGonads],
    organStates,
    substanceId: "cannabis",
    now,
  });

  const testesCard = model.changes.find((item) => item.id === "testes");
  assert.ok(testesCard);
  assert.equal(testesCard.title, "Testes");
  assert.match(testesCard.body, /Testes/);
  assert.equal(testesCard.system, "Sistema reproductor");
  assert.doesNotMatch(testesCard.system, /Órgano/);
  assert.equal(
    model.systems.some((item) => item.id === "reproductive"),
    false,
  );
  assert.equal(
    model.chart.series.some((item) => item.id === "reproductive"),
    false,
  );
  assert.equal(testesCard.icon, undefined);
});

test("organ cards localize title and body from organLabel without changing catalog input", () => {
  const cannabisWithGonads: ApiSubstance = {
    ...cannabis,
    recoveryCurves: [
      ...cannabis.recoveryCurves,
      curve("testes", "reproductive", 180, 0.95),
      curve("ovaries", "reproductive", 180, 0.95),
    ],
  };
  const usage: ProfileUsage = {
    substanceId: "cannabis",
    yearStarted: 2020,
    lastUseDate: "2026-07-23T00:00:00.000Z",
    frequency: "weekly",
    status: "abstinent",
  };
  const organStates = new Map<OrganId, OrganState>([
    [
      "testes",
      {
        organId: "testes",
        organName: "Testes",
        progressFraction: 0.46,
        absoluteRecovery: 0.44,
        daysAbstinent: 87,
        dominantSubstanceId: "cannabis",
        confidenceLevel: "low",
        dominantStatus: "abstinent",
        contributingSubstances: [
          { substanceId: "cannabis", status: "abstinent", progressFraction: 0.46 },
        ],
      },
    ],
    [
      "ovaries",
      {
        organId: "ovaries",
        organName: "Ovaries",
        progressFraction: 0.4,
        absoluteRecovery: 0.38,
        daysAbstinent: 87,
        dominantSubstanceId: "cannabis",
        confidenceLevel: "low",
        dominantStatus: "abstinent",
        contributingSubstances: [
          { substanceId: "cannabis", status: "abstinent", progressFraction: 0.4 },
        ],
      },
    ],
  ]);
  const labels: Record<string, string> = {
    testes: "Testículos",
    ovaries: "Ovarios",
  };

  const localized = buildLiveDashboard({
    usages: [usage],
    substances: [cannabisWithGonads],
    organStates,
    substanceId: "cannabis",
    now,
    organLabel: (organId, fallback) => labels[organId] ?? fallback,
  });
  const testesCard = localized.changes.find((item) => item.id === "testes");
  const ovariesCard = localized.changes.find((item) => item.id === "ovaries");
  assert.ok(testesCard);
  assert.ok(ovariesCard);
  assert.equal(testesCard.title, "Testículos");
  assert.equal(ovariesCard.title, "Ovarios");
  assert.match(testesCard.body, /^Testículos:/);
  assert.match(ovariesCard.body, /^Ovarios:/);
  assert.doesNotMatch(testesCard.body, /Testes/);
  assert.doesNotMatch(ovariesCard.body, /Ovaries/);
  assert.equal(organStates.get("testes")?.organName, "Testes");
  assert.equal(organStates.get("ovaries")?.organName, "Ovaries");

  const missing = buildLiveDashboard({
    usages: [usage],
    substances: [cannabisWithGonads],
    organStates,
    substanceId: "cannabis",
    now,
    organLabel: (organId) => organId,
  });
  const fallbackCard = missing.changes.find((item) => item.id === "testes");
  assert.ok(fallbackCard);
  assert.equal(fallbackCard.title, "Testes");
  assert.match(fallbackCard.body, /Testes/);
});

test("Prisma underscore systems map to hyphen BodySystem ids", () => {
  const nervous: ApiSubstance = {
    id: "nicotine",
    name: "Nicotine",
    category: "nicotine",
    shortDescription: "test",
    damageProfiles: [],
    recoveryCurves: [
      curve("brain", "nervous_central" as ApiSubstance["recoveryCurves"][number]["organ"]["system"], 180, 0.95),
    ],
    achievements: [],
  };
  const usage: ProfileUsage = {
    substanceId: "nicotine",
    yearStarted: 2018,
    lastUseDate: "2026-04-18T00:00:00.000Z",
    frequency: "daily",
    status: "abstinent",
  };
  const progress = substanceProgress(usage, nervous, now);
  const progressFraction = readyFraction(progress);
  const organStates = new Map<OrganId, OrganState>([
    [
      "brain",
      {
        organId: "brain",
        organName: "Brain",
        progressFraction,
        absoluteRecovery: progressFraction * 0.95,
        daysAbstinent: progress.daysAbstinent,
        dominantSubstanceId: "nicotine",
        confidenceLevel: "high",
        dominantStatus: "abstinent",
        contributingSubstances: [
          {
            substanceId: "nicotine",
            status: "abstinent",
            progressFraction,
          },
        ],
      },
    ],
  ]);

  const model = buildLiveDashboard({
    usages: [usage],
    substances: [nervous],
    organStates,
    substanceId: null,
    now,
  });
  assert.ok(model.systems.some((item) => item.id === "nervous-central"));
  assert.ok(model.chart.series.some((item) => item.id === "nervous-central"));
  assert.equal(model.organSystemById.get("brain"), "nervous-central");
});

test("user without substances yields empty live model", () => {
  const model = buildLiveDashboard({
    usages: [],
    substances: [nicotine],
    organStates: new Map(),
    substanceId: null,
    now,
  });
  assert.deepEqual(model.substances, []);
  assert.deepEqual(model.systems, []);
  assert.deepEqual(model.changes, []);
  assert.deepEqual(model.chart.series, []);
});

test("active consumption reports zero progress without inventing dates", () => {
  const usage: ProfileUsage = {
    substanceId: "nicotine",
    yearStarted: 2018,
    lastUseDate: null,
    frequency: "daily",
    status: "active",
  };
  const progress = substanceProgress(usage, nicotine, now);
  assert.equal(progress.availability, "active");
  assert.equal(progress.progressFraction, 0);
  assert.equal(progress.daysAbstinent, 0);

  const model = buildLiveDashboard({
    usages: [usage],
    substances: [nicotine],
    organStates: new Map([
      [
        "heart",
        {
          organId: "heart",
          organName: "Heart",
          progressFraction: 0,
          absoluteRecovery: 0,
          daysAbstinent: 0,
          dominantSubstanceId: "nicotine",
          confidenceLevel: "high",
          dominantStatus: "active",
          contributingSubstances: [
            { substanceId: "nicotine", status: "active", progressFraction: 0 },
          ],
        },
      ],
    ]),
    substanceId: null,
    now,
  });
  assert.equal(model.substances[0]?.abstinence, "Consumo activo");
  assert.equal(model.substances[0]?.bar, 0);
  assert.match(model.substances[0]?.phase ?? "", /recuento de abstinencia/);
});

test("incomplete abstinence date stays empty instead of inventing recovery", () => {
  const usage: ProfileUsage = {
    substanceId: "nicotine",
    yearStarted: 2018,
    lastUseDate: null,
    frequency: "daily",
    status: "abstinent",
  };
  const progress = substanceProgress(usage, nicotine, now);
  assert.equal(progress.availability, "missing-date");
  assert.equal(progress.progressFraction, null);
  const model = buildLiveDashboard({
    usages: [usage],
    substances: [nicotine],
    organStates: new Map(),
    substanceId: null,
    now,
  });
  assert.equal(model.substances[0]?.abstinence, "Fecha pendiente");
  assert.match(model.substances[0]?.phase ?? "", /Añade la fecha/);
});

test("today marker stays on the canonical axis", () => {
  assert.equal(todayPositionOnAxis(0), 0);
  assert.equal(todayPositionOnAxis(365), 1);
  assert.ok(todayPositionOnAxis(30) > 0 && todayPositionOnAxis(30) < 1);
  assert.equal(formatDaysAbstinent(1), "1 día");
  assert.equal(formatDaysAbstinent(15), "15 días");
});

test("demo and live stay separated in the preview pages", () => {
  const home = readFileSync(new URL("../components/PreviewHome.tsx", import.meta.url), "utf8");
  const recovery = readFileSync(new URL("../pages/RecoveryPage.tsx", import.meta.url), "utf8");
  const hook = readFileSync(new URL("../hooks/usePreviewDashboard.ts", import.meta.url), "utf8");
  assert.match(home, /usePreviewDashboard/);
  assert.match(recovery, /usePreviewDashboard/);
  assert.match(hook, /mode: "demo"/);
  assert.match(hook, /mode: "live"/);
  assert.match(hook, /Never mixes demo figures/);
  assert.match(hook, /base === "\/app"/);
  assert.equal(home.includes("demoSubstances"), false);
  assert.equal(recovery.includes("demoSubstances"), false);
  assert.match(home, /showDemoBadge/);
  assert.match(recovery, /demo=\{dashboard\.showDemoBadge\}/);
  assert.match(hook, /showToday: true/);
  const chart = readFileSync(
    new URL("../components/EvolutionChart.tsx", import.meta.url),
    "utf8",
  );
  assert.match(chart, /chart\.showToday && todayX != null/);
  assert.match(chart, /chartCaptionLiveOverlay/);
  assert.match(chart, /t\("chartYAxis"\)/);
  assert.match(chart, /t\("chartCurveNote"\)/);
  assert.match(chart, /t\("chartOverview"\)/);
});

test("home daily summary does not repeat recovery analysis widgets", () => {
  const home = readFileSync(new URL("../components/PreviewHome.tsx", import.meta.url), "utf8");
  const recovery = readFileSync(new URL("../pages/RecoveryPage.tsx", import.meta.url), "utf8");
  assert.equal(home.includes("EvolutionChart"), false);
  assert.equal(home.includes("SystemTile"), false);
  assert.equal(home.includes("RecentChangeCard"), false);
  assert.match(home, /HeroFigure/);
  const hero = readFileSync(
    new URL("../components/HeroFigure.tsx", import.meta.url),
    "utf8",
  );
  assert.equal(hero.includes("-scale-x-100"), false);
  assert.match(home, /HeroFilaments/);
  assert.match(home, /fadeBottom/);
  assert.match(home, /lg:grid-cols-\[minmax\(0,3fr\)_minmax\(14rem,2fr\)\]/);
  assert.equal(home.includes("h-24 w-[4.75rem]"), false);
  assert.equal(home.includes("sm:h-28 sm:w-20 lg:hidden"), false);
  assert.match(
    home,
    /h-\[min\(17\.5rem,calc\(\(100vw-2rem\)\*0\.932\),calc\(100dvh-16rem\)\)\].*lg:hidden/,
  );
  assert.match(home, /absolute inset-0 z-\[1\]/);
  assert.match(home, /hidden min-h-\[20rem\] overflow-hidden lg:block/);
  assert.equal(home.includes("publishedAdvice"), false);
  assert.match(home, /showTierLabel=\{false\}/);
  assert.equal((home.match(/showTierLabel/g) ?? []).length, 1);
  assert.match(home, /pickNextLockedAchievement/);
  assert.match(home, /quantifiableAchievementProgress/);
  assert.match(home, /pickFeaturedUnlockedAchievement/);
  assert.match(home, /liveEnabled = Boolean\(user\) && base === "\/app"/);
  assert.match(recovery, /EvolutionChart/);
  assert.match(recovery, /SubstanceCard/);
});

test("recovery time cards stay visible on every tab and omit the model bar", () => {
  const recovery = readFileSync(new URL("../pages/RecoveryPage.tsx", import.meta.url), "utf8");
  const card = readFileSync(
    new URL("../components/SubstanceCard.tsx", import.meta.url),
    "utf8",
  );
  const substanceCardIndex = recovery.indexOf("<SubstanceCard");
  const tabsIndex = recovery.indexOf("<SegmentedControl");
  const chartIndex = recovery.indexOf("<EvolutionChart");
  assert.ok(substanceCardIndex > 0);
  assert.ok(tabsIndex > substanceCardIndex);
  assert.ok(chartIndex > tabsIndex);
  assert.equal(recovery.includes('tab !== "timeline"'), false);
  assert.equal(recovery.includes("substanceSelectAll"), false);
  assert.match(recovery, /tab === "substance" \? \(/);
  assert.equal(card.includes("substance.bar"), false);
  assert.match(card, /text-3xl font-semibold tabular-nums/);
  assert.match(card, /\/\\d\/\.test\(substance\.abstinence\)/);
});

test("/preview never wires live profile, achievements, or private identity", () => {
  const hook = readFileSync(
    new URL("../hooks/usePreviewDashboard.ts", import.meta.url),
    "utf8",
  );
  const menu = readFileSync(
    new URL("../components/AccountMenu.tsx", import.meta.url),
    "utf8",
  );
  const account = readFileSync(
    new URL("../pages/AccountPage.tsx", import.meta.url),
    "utf8",
  );
  const achievements = readFileSync(
    new URL("../pages/AchievementsPage.tsx", import.meta.url),
    "utf8",
  );

  assert.match(hook, /isLive = Boolean\(user\) && base === "\/app"/);
  assert.match(hook, /useLiveProfile\(isLive \? \(user\?\.id/);
  assert.match(account, /enabled: base === "\/app"/);
  assert.match(achievements, /liveEnabled = Boolean\(user\) && base === "\/app"/);
  const home = readFileSync(new URL("../components/PreviewHome.tsx", import.meta.url), "utf8");
  assert.match(home, /liveEnabled = Boolean\(user\) && base === "\/app"/);
  assert.match(menu, /user && base === "\/app"/);
  assert.match(menu, /user && base === "\/preview"/);
  assert.match(menu, /menuPreviewGuest/);
  // Preview branch must not render email/displayName from the session.
  const previewBranch = menu.slice(menu.indexOf('base === "/preview"'));
  assert.equal(previewBranch.includes("user.displayName"), false);
  assert.equal(previewBranch.includes("user.email"), false);
});

test("adapter does not redefine recovery formulas", () => {
  const source = readFileSync(new URL("./adapt-live-dashboard.ts", import.meta.url), "utf8");
  assert.match(source, /computeRecovery/);
  assert.match(source, /estimateCurve/);
  assert.equal(source.includes("function estimateCurve"), false);
  assert.equal(source.includes("daysTo95Recovery:"), true);
});

test("live organ cards do not fall back to the brain system icon", () => {
  const source = readFileSync(new URL("./adapt-live-dashboard.ts", import.meta.url), "utf8");
  assert.equal(source.includes('meta?.icon ?? "brain"'), false);

  const cannabisWithOrgans: ApiSubstance = {
    ...cannabis,
    recoveryCurves: [
      curve("testes", "reproductive", 180, 0.95),
      curve("brain-hippocampus", "nervous-central", 180, 0.9),
    ],
  };
  const usage: ProfileUsage = {
    substanceId: "cannabis",
    yearStarted: 2020,
    lastUseDate: "2026-07-23T00:00:00.000Z",
    frequency: "weekly",
    status: "abstinent",
  };
  const organStates = new Map<OrganId, OrganState>([
    [
      "testes",
      {
        organId: "testes",
        organName: "Testes",
        progressFraction: 0.4,
        absoluteRecovery: 0.38,
        daysAbstinent: 87,
        dominantSubstanceId: "cannabis",
        confidenceLevel: "low",
        dominantStatus: "abstinent",
        contributingSubstances: [
          { substanceId: "cannabis", status: "abstinent", progressFraction: 0.4 },
        ],
      },
    ],
    [
      "brain-hippocampus",
      {
        organId: "brain-hippocampus",
        organName: "Hippocampus",
        progressFraction: 0.5,
        absoluteRecovery: 0.45,
        daysAbstinent: 87,
        dominantSubstanceId: "cannabis",
        confidenceLevel: "low",
        dominantStatus: "abstinent",
        contributingSubstances: [
          { substanceId: "cannabis", status: "abstinent", progressFraction: 0.5 },
        ],
      },
    ],
  ]);
  const model = buildLiveDashboard({
    usages: [usage],
    substances: [cannabisWithOrgans],
    organStates,
    substanceId: "cannabis",
    now,
  });
  const testesCard = model.changes.find((item) => item.id === "testes");
  const hippocampusCard = model.changes.find((item) => item.id === "brain-hippocampus");
  assert.ok(testesCard);
  assert.ok(hippocampusCard);
  assert.equal(testesCard.icon, undefined);
  assert.equal(hippocampusCard.icon, undefined);
});

test("chart endLabel is today trajectory, not day-365 sample", () => {
  const usage: ProfileUsage = {
    substanceId: "nicotine",
    yearStarted: 2018,
    lastUseDate: "2026-09-06T00:00:00.000Z", // 42 days before fixture `now`
    frequency: "daily",
    status: "abstinent",
  };
  const chart = buildLiveChart({
    usages: [usage],
    substances: [nicotine],
    substanceId: null,
    now,
  });
  const cardio = chart.series.find((item) => item.id === "cardiovascular");
  assert.ok(cardio);
  const today = estimateCurve(42, {
    shape: "logarithmic",
    daysTo95Recovery: 365,
    recoveryCeiling: 0.9,
  }).curveProgress;
  const atYear = estimateCurve(365, {
    shape: "logarithmic",
    daysTo95Recovery: 365,
    recoveryCeiling: 0.9,
  }).curveProgress;
  assert.match(cardio.endLabel, /^Hoy · \d+ % de la curva$/);
  assert.match(cardio.referenceAtYearLabel ?? "", /^día 365 · \d+%/);
  assert.equal(cardio.endLabel, `Hoy · ${Math.round(today * 100)} % de la curva`);
  assert.equal(
    cardio.referenceAtYearLabel,
    `día 365 · ${Math.round(atYear * 100)}%`,
  );
  assert.notEqual(cardio.endLabel, cardio.referenceAtYearLabel);
  assert.equal(cardio.samples.length, LIVE_AXIS_DAYS.length);
  assert.equal(cardio.samples[LIVE_AXIS_DAYS.length - 1], atYear);
});

test("day 0 and >365 keep distinct today vs year labels", () => {
  const day0 = buildLiveChart({
    usages: [
      {
        substanceId: "nicotine",
        yearStarted: 2018,
        lastUseDate: new Date(now).toISOString(),
        frequency: "daily",
        status: "abstinent",
      },
    ],
    substances: [nicotine],
    substanceId: null,
    now,
  });
  const cardio0 = day0.series.find((item) => item.id === "cardiovascular");
  assert.ok(cardio0);
  assert.equal(cardio0.endLabel, "Hoy · 0 % de la curva");
  assert.equal(day0.todayPosition, 0);

  const far = buildLiveChart({
    usages: [
      {
        substanceId: "nicotine",
        yearStarted: 2015,
        lastUseDate: "2024-10-18T00:00:00.000Z", // ~730 days
        frequency: "daily",
        status: "abstinent",
      },
    ],
    substances: [nicotine],
    substanceId: null,
    now,
  });
  assert.equal(far.todayPosition, 1);
  const cardioFar = far.series.find((item) => item.id === "cardiovascular");
  assert.ok(cardioFar);
  assert.match(cardioFar.endLabel, /^Hoy · /);
  assert.match(cardioFar.referenceAtYearLabel ?? "", /^día 365 · /);
});

test("ceiling 0.6 keeps progressFraction as primary bar; absoluteRecovery lower", () => {
  const lowCeiling: ApiSubstance = {
    ...nicotine,
    id: "nicotine",
    recoveryCurves: [curve("heart", "cardiovascular", 180, 0.6)],
  };
  const usage: ProfileUsage = {
    substanceId: "nicotine",
    yearStarted: 2018,
    lastUseDate: "2025-10-18T00:00:00.000Z",
    frequency: "daily",
    status: "abstinent",
  };
  const progress = substanceProgress(usage, lowCeiling, now);
  const progressFraction = readyFraction(progress);
  assert.ok(progressFraction > 0.9);
  assert.ok((progress.absoluteRecovery ?? 1) < 0.65);
  assert.equal(progress.recoveryCeiling, 0.6);
  assert.ok(
    Math.abs((progress.absoluteRecovery ?? 0) - progressFraction * 0.6) < 1e-9,
  );

  const model = buildLiveDashboard({
    usages: [usage],
    substances: [lowCeiling],
    organStates: new Map([
      [
        "heart",
        {
          organId: "heart",
          organName: "Heart",
          progressFraction,
          absoluteRecovery: progress.absoluteRecovery ?? 0,
          daysAbstinent: progress.daysAbstinent,
          dominantSubstanceId: "nicotine",
          confidenceLevel: "high",
          dominantStatus: "abstinent",
          contributingSubstances: [
            {
              substanceId: "nicotine",
              status: "abstinent",
              progressFraction,
            },
          ],
        },
      ],
    ]),
    substanceId: null,
    now,
  });
  assert.equal(model.substances[0]?.bar, progressFraction);
  assert.match(model.substances[0]?.phase ?? "", /Techo del modelo: 60%/);
  assert.match(model.changes[0]?.body ?? "", /trayectoria estimada/);
  assert.doesNotMatch(model.changes[0]?.body ?? "", /Techo del modelo/);
  assert.equal(
    model.systems[0]?.endLabel,
    `${Math.round(progressFraction * 100)}%`,
  );
});

test("organ cards never reuse another curve’s ceiling from the same substance", () => {
  const dual: ApiSubstance = {
    ...nicotine,
    recoveryCurves: [
      curve("heart", "cardiovascular", 365, 0.6),
      curve("lungs", "respiratory", 30, 0.9),
    ],
  };
  const usage: ProfileUsage = {
    substanceId: "nicotine",
    yearStarted: 2018,
    lastUseDate: "2026-09-06T00:00:00.000Z",
    frequency: "daily",
    status: "abstinent",
  };
  const progress = substanceProgress(usage, dual, now);
  const days = progress.daysAbstinent;
  const heartToday = estimateCurve(days, {
    shape: "logarithmic",
    daysTo95Recovery: 365,
    recoveryCeiling: 0.6,
  }).curveProgress;
  const lungsToday = estimateCurve(days, {
    shape: "logarithmic",
    daysTo95Recovery: 30,
    recoveryCeiling: 0.9,
  }).curveProgress;
  assert.ok(heartToday < lungsToday);
  assert.equal(progress.recoveryCeiling, 0.6);
  assert.ok(Math.abs(readyFraction(progress) - heartToday) < 1e-9);

  const model = buildLiveDashboard({
    usages: [usage],
    substances: [dual],
    organStates: new Map([
      [
        "heart",
        {
          organId: "heart",
          organName: "Heart",
          progressFraction: heartToday,
          absoluteRecovery: heartToday * 0.6,
          daysAbstinent: days,
          dominantSubstanceId: "nicotine",
          confidenceLevel: "high",
          dominantStatus: "abstinent",
          contributingSubstances: [
            { substanceId: "nicotine", status: "abstinent", progressFraction: heartToday },
          ],
        },
      ],
      [
        "lungs",
        {
          organId: "lungs",
          organName: "Lungs",
          progressFraction: lungsToday,
          absoluteRecovery: lungsToday * 0.9,
          daysAbstinent: days,
          dominantSubstanceId: "nicotine",
          confidenceLevel: "high",
          dominantStatus: "abstinent",
          contributingSubstances: [
            { substanceId: "nicotine", status: "abstinent", progressFraction: lungsToday },
          ],
        },
      ],
    ]),
    substanceId: null,
    now,
  });

  assert.match(model.substances[0]?.phase ?? "", /Techo del modelo: 60%/);
  assert.doesNotMatch(model.substances[0]?.phase ?? "", /90%/);
  const heartCard = model.changes.find((item) => item.id === "heart");
  const lungsCard = model.changes.find((item) => item.id === "lungs");
  assert.ok(heartCard);
  assert.ok(lungsCard);
  assert.doesNotMatch(heartCard.body, /Techo del modelo/);
  assert.doesNotMatch(lungsCard.body, /Techo del modelo/);
  assert.doesNotMatch(heartCard.body, /90%/);
  assert.doesNotMatch(lungsCard.body, /60%/);
});

test("substance without curves shows no invented percentage", () => {
  const empty: ApiSubstance = { ...nicotine, recoveryCurves: [] };
  const usage: ProfileUsage = {
    substanceId: "nicotine",
    yearStarted: 2018,
    lastUseDate: "2026-09-06T00:00:00.000Z",
    frequency: "daily",
    status: "abstinent",
  };
  const progress = substanceProgress(usage, empty, now);
  assert.equal(progress.availability, "no-curves");
  assert.equal(progress.progressFraction, null);
  const model = buildLiveDashboard({
    usages: [usage],
    substances: [empty],
    organStates: new Map(),
    substanceId: null,
    now,
  });
  assert.equal(model.substances[0]?.bar, 0);
  assert.match(model.substances[0]?.phase ?? "", /no tiene curvas/);
  assert.equal(model.chart.series.length, 0);
});

test("spanish and english copy change labels without changing trajectory math", () => {
  const usage: ProfileUsage = {
    substanceId: "nicotine",
    yearStarted: 2018,
    lastUseDate: "2026-09-06T00:00:00.000Z",
    frequency: "daily",
    status: "abstinent",
  };
  const progress = substanceProgress(usage, nicotine, now);
  const progressFraction = readyFraction(progress);
  const organStates = new Map<OrganId, OrganState>([
    [
      "heart",
      {
        organId: "heart",
        organName: "Heart",
        progressFraction,
        absoluteRecovery: progress.absoluteRecovery ?? 0,
        daysAbstinent: progress.daysAbstinent,
        dominantSubstanceId: "nicotine",
        confidenceLevel: "high",
        dominantStatus: "abstinent",
        contributingSubstances: [
          { substanceId: "nicotine", status: "abstinent", progressFraction },
        ],
      },
    ],
  ]);
  const shared = { usages: [usage], substances: [nicotine], organStates, substanceId: null, now };
  const es = buildLiveDashboard({ ...shared, copy: SPANISH_RECOVERY_COPY });
  const en = buildLiveDashboard({ ...shared, copy: ENGLISH_RECOVERY_COPY });
  assert.equal(es.substances[0]?.bar, en.substances[0]?.bar);
  assert.equal(es.chart.todayPosition, en.chart.todayPosition);
  assert.match(es.chart.series[0]?.endLabel ?? "", /^Hoy · \d+ % de la curva$/);
  assert.match(en.chart.series[0]?.endLabel ?? "", /^Today · \d+% of the curve$/);
  assert.equal(es.chart.axisLabels[4], "365 días");
  assert.equal(en.chart.axisLabels[4], "365 days");
  assert.match(es.substances[0]?.phase ?? "", /trayectoria estimada/i);
  assert.match(en.substances[0]?.phase ?? "", /Estimated trajectory/i);
  assert.notEqual(es.chart.footnote, en.chart.footnote);
});

test("live API error path never imports demo series (source)", () => {
  const hook = readFileSync(
    new URL("../hooks/usePreviewDashboard.ts", import.meta.url),
    "utf8",
  );
  assert.match(hook, /error: error \?\?/);
  assert.match(hook, /showDemoBadge: false/);
  assert.equal(hook.includes("demoSeries"), true); // demo branch only
  // Error return must not assign demoSubstances
  const errorBlock = hook.slice(hook.indexOf("if (error || !liveModel)"));
  assert.equal(errorBlock.includes("demoSubstances"), false);
  assert.equal(errorBlock.includes("demoSeries"), false);
});
