import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  recoveryCatalogPairs,
  recoverySubstances,
  resolveEducationalRecovery,
  selectRecoverySubstance,
} from "./recovery-catalog.ts";

const seedSource = readFileSync(
  new URL("../../../../../../apps/api/prisma/seed/recovery-curves.ts", import.meta.url),
  "utf8",
);

function seedCurves(): Array<{
  organId: string;
  substanceId: string;
  shape: string;
  daysTo95Recovery: number;
  recoveryCeiling: number;
  confidenceLevel: string;
  referenceSource: string;
}> {
  const start = seedSource.indexOf("export const RECOVERY_CURVES = [");
  const end = seedSource.indexOf("] satisfies");
  assert.ok(start >= 0 && end > start);
  const body = seedSource
    .slice(start + "export const RECOVERY_CURVES = ".length, end + 1)
    .replace(/as const/g, "");
  return eval(body) as ReturnType<typeof seedCurves>;
}

test("catalog mirrors every seeded recovery curve value exactly once", () => {
  const seeded = seedCurves();
  const catalogued = recoveryCatalogPairs();
  assert.equal(catalogued.length, 56);
  assert.equal(seeded.length, 56);

  const seedKey = (item: {
    organId: string;
    substanceId: string;
  }) => `${item.organId}|${item.substanceId}`;

  assert.deepEqual(
    [...catalogued.map(seedKey)].sort(),
    [...seeded.map(seedKey)].sort(),
  );
  assert.equal(new Set(catalogued.map(seedKey)).size, catalogued.length);

  for (const curve of seeded) {
    const match = catalogued.find(
      (item) => item.organId === curve.organId && item.substanceId === curve.substanceId,
    );
    assert.ok(match, seedKey(curve));
    assert.equal(match.shape, curve.shape);
    assert.equal(match.daysTo95Recovery, curve.daysTo95Recovery);
    assert.equal(match.recoveryCeiling, curve.recoveryCeiling);
    assert.equal(match.confidenceLevel, curve.confidenceLevel);
    assert.equal(match.referenceSource, curve.referenceSource);
  }
});

test("respiratory recovery pairs remain available without regression", () => {
  assert.deepEqual(recoverySubstances("lungs").sort(), ["cannabis", "cocaine", "nicotine"]);
  assert.deepEqual(recoverySubstances("bronchi").sort(), ["cannabis", "cocaine", "nicotine"]);
  assert.deepEqual(recoverySubstances("nasal-mucosa").sort(), [
    "cannabis",
    "cocaine",
    "nicotine",
  ]);

  const lungsNicotine = resolveEducationalRecovery("lungs", "nicotine");
  assert.ok(lungsNicotine);
  assert.equal(lungsNicotine.daysTo95Recovery, 365);
  assert.equal(lungsNicotine.ceilingPercentLabel, "75%");
  assert.equal(lungsNicotine.personalized, false);
});

test("undefined combinations resolve to nothing", () => {
  assert.equal(resolveEducationalRecovery("stomach", "nicotine"), null);
  assert.equal(resolveEducationalRecovery("kidneys", "alcohol"), null);
  assert.equal(resolveEducationalRecovery("spleen", "nicotine"), null);
  assert.equal(recoverySubstances("stomach").includes("nicotine"), false);
});

test("changing organ keeps a shared substance and otherwise picks the first available", () => {
  assert.equal(selectRecoverySubstance("nicotine", "lungs"), "nicotine");
  assert.equal(selectRecoverySubstance("caffeine", "heart"), "caffeine");
  assert.equal(selectRecoverySubstance("alcohol", "heart"), "alcohol");
  assert.equal(selectRecoverySubstance(null, "liver"), "alcohol");
  assert.equal(selectRecoverySubstance("nicotine", "liver"), "alcohol");
});

test("educational recovery does not invent personal progress fields", () => {
  const resolved = resolveEducationalRecovery("liver", "alcohol");
  assert.ok(resolved);
  assert.equal(resolved.personalized, false);
  assert.equal(Object.hasOwn(resolved, "curveProgress"), false);
  assert.equal(Object.hasOwn(resolved, "daysAbstinent"), false);
  assert.equal(Object.hasOwn(resolved, "maxSeverity"), false);
  assert.equal(resolved.shapeLabel, "logarítmica");
  assert.equal(resolved.confidenceLabel, "alta");
});

test("the explorer recovery panel does not compute personal recovery", () => {
  const page = readFileSync(new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url), "utf8");
  const adapter = readFileSync(new URL("./recovery-catalog.ts", import.meta.url), "utf8");
  for (const token of [
    "estimateCurve",
    "computeRecovery",
    "curveProgress",
    "demo-data",
    "lastUseDate",
    "daysAbstinent",
    "maxSeverity",
  ]) {
    assert.equal(page.includes(token), false, token);
    assert.equal(adapter.includes(token), false, token);
  }
});

test("the adapter imports the generated seed snapshot instead of inlining curves", () => {
  const adapter = readFileSync(new URL("./recovery-catalog.ts", import.meta.url), "utf8");
  assert.match(adapter, /recovery-curves\.generated/);
  assert.equal(adapter.includes("daysTo95Recovery: 90"), false);
  assert.equal(adapter.includes("Lieber (2004)"), false);
});
