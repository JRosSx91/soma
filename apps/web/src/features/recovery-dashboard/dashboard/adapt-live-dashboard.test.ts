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
} from "./adapt-live-dashboard.ts";

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
  assert.ok(progress.daysAbstinent > 14 && progress.daysAbstinent < 16);
  assert.ok(progress.progressFraction > 0);
  assert.ok(progress.progressFraction < 1);

  const organStates = new Map<OrganId, OrganState>([
    [
      "lungs",
      {
        organId: "lungs",
        organName: "Lungs",
        progressFraction: progress.progressFraction,
        absoluteRecovery: progress.progressFraction * 0.75,
        daysAbstinent: progress.daysAbstinent,
        dominantSubstanceId: "nicotine",
        confidenceLevel: "high",
        dominantStatus: "abstinent",
        contributingSubstances: [
          { substanceId: "nicotine", status: "abstinent", progressFraction: progress.progressFraction },
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
  assert.equal(model.substances[0]?.bar, progress.progressFraction);
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
  const organStates = new Map<OrganId, OrganState>([
    [
      "brain",
      {
        organId: "brain",
        organName: "Brain",
        progressFraction: progress.progressFraction,
        absoluteRecovery: progress.progressFraction * 0.95,
        daysAbstinent: progress.daysAbstinent,
        dominantSubstanceId: "nicotine",
        confidenceLevel: "high",
        dominantStatus: "abstinent",
        contributingSubstances: [
          {
            substanceId: "nicotine",
            status: "abstinent",
            progressFraction: progress.progressFraction,
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
  assert.equal(model.substances[0]?.abstinence, "Activo");
  assert.equal(model.substances[0]?.bar, 0);
  assert.match(model.substances[0]?.phase ?? "", /Consumo activo/);
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
  assert.equal(progress.progressFraction, 0);
  const model = buildLiveDashboard({
    usages: [usage],
    substances: [nicotine],
    organStates: new Map(),
    substanceId: null,
    now,
  });
  assert.equal(model.substances[0]?.abstinence, "—");
  assert.match(model.substances[0]?.phase ?? "", /fecha/);
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
  assert.match(hook, /Never mixes demo/);
  assert.equal(home.includes("demoSubstances"), false);
  assert.equal(recovery.includes("demoSubstances"), false);
  assert.match(home, /showDemoBadge/);
  assert.match(recovery, /demo=\{dashboard\.showDemoBadge\}/);
});

test("adapter does not redefine recovery formulas", () => {
  const source = readFileSync(new URL("./adapt-live-dashboard.ts", import.meta.url), "utf8");
  assert.match(source, /computeRecovery/);
  assert.match(source, /estimateCurve/);
  assert.equal(source.includes("function estimateCurve"), false);
  assert.equal(source.includes("daysTo95Recovery:"), true);
});
