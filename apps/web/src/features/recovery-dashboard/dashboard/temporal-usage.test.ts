import assert from "node:assert/strict";
import { test } from "node:test";
import {
  dashboardUsageFingerprint,
  parseDashboardLastUse,
  usagesFromDashboardSubstances,
} from "./temporal-usage.ts";

test("dashboard usages keep active, missing, and invalid last-use distinct", () => {
  const usages = usagesFromDashboardSubstances([
    {
      id: "cannabis",
      name: "Cannabis",
      abstinence: "x",
      pillDetail: "x",
      phase: "x",
      bar: 0,
      usageStatus: "active",
      lastUseDate: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "nicotine",
      name: "Nicotine",
      abstinence: "x",
      pillDetail: "x",
      phase: "x",
      bar: 0,
      usageStatus: "abstinent",
      lastUseDate: null,
    },
    {
      id: "alcohol",
      name: "Alcohol",
      abstinence: "x",
      pillDetail: "x",
      phase: "x",
      bar: 0,
      usageStatus: "abstinent",
      lastUseDate: "not-a-date",
    },
  ]);
  assert.equal(usages[0]?.status, "active");
  assert.equal(usages[1]?.lastUseDate, null);
  assert.equal(Number.isNaN(usages[2]?.lastUseDate?.getTime()), true);
  assert.equal(Number.isNaN(parseDashboardLastUse("bogus")?.getTime()), true);
});

test("usage fingerprint changes when last-use or consumption status change", () => {
  const row = {
    id: "cannabis",
    name: "Cannabis",
    abstinence: "x",
    pillDetail: "x",
    phase: "x",
    bar: 0,
    usageStatus: "abstinent" as const,
    lastUseDate: "2026-01-01T00:00:00.000Z",
  };
  const original = dashboardUsageFingerprint([row]);
  const corrected = dashboardUsageFingerprint([
    { ...row, lastUseDate: "2026-01-20T00:00:00.000Z" },
  ]);
  const relapsed = dashboardUsageFingerprint([{ ...row, usageStatus: "active" }]);
  assert.notEqual(original, corrected);
  assert.notEqual(original, relapsed);
});
