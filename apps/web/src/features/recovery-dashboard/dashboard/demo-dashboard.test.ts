import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { demoSeries } from "../demo-data.ts";
import { chartSeriesForSystem } from "../pages-data.ts";
import {
  axisEndProgress,
  buildDemoChart,
  demoDashboardChanges,
  demoDashboardSystems,
} from "./demo-dashboard.ts";
import { recoveryCopyFromSource, SPANISH_RECOVERY_COPY } from "./recovery-copy.ts";
import { formatLabeledPercent, formatTrajectoryPercent } from "./recovery-semantics.ts";
import enRecovery from "../../../i18n/locales/en/recovery.json" with { type: "json" };

test("demo legend percents are the last sample of each series", () => {
  const chart = buildDemoChart(SPANISH_RECOVERY_COPY);
  assert.equal(chart.series.length, demoSeries.length);
  for (const series of chart.series) {
    const source = demoSeries.find((item) => item.id === series.id);
    assert.ok(source);
    const expected = axisEndProgress(source.samples);
    assert.equal(series.samples, source.samples);
    assert.equal(series.endLabel, "");
    assert.equal(
      series.referenceAtYearLabel,
      formatLabeledPercent(SPANISH_RECOVERY_COPY.day365, expected),
    );
  }
  assert.equal(
    chart.series.find((item) => item.id === "nervous")?.referenceAtYearLabel,
    "día 365 · 68%",
  );
  assert.equal(
    chart.series.find((item) => item.id === "cardiovascular")?.referenceAtYearLabel,
    "día 365 · 72%",
  );
});

test("demo chart has no shared Today marker and no global recovery series", () => {
  const chart = buildDemoChart(SPANISH_RECOVERY_COPY);
  assert.equal(chart.showToday, false);
  assert.equal(chart.todayLabel, "");
  assert.equal(chart.todayPosition, 0);
  assert.equal(
    chart.series.some((item) => item.id === "general"),
    false,
  );
  const joined = `${chart.todayLabel} ${chart.series.map((item) => item.endLabel).join(" ")}`;
  assert.doesNotMatch(joined, /Hoy/);
  assert.match(chart.footnote, /hoy.*compartido/i);
  assert.doesNotMatch(chart.footnote, /salud recuperada/i);
});

test("demo milestones omit percents that are not curve checkpoints", () => {
  const changes = demoDashboardChanges();
  assert.equal(changes.length, 3);
  for (const change of changes) {
    assert.equal(change.endLabel, "");
    assert.doesNotMatch(change.body, /%/);
  }
});

test("demo system tiles reuse the chart series end sample or stay empty", () => {
  const systems = demoDashboardSystems();
  const chart = buildDemoChart(SPANISH_RECOVERY_COPY);
  for (const system of systems) {
    const seriesId = chartSeriesForSystem[system.id];
    if (!seriesId) {
      assert.equal(system.endLabel, "");
      continue;
    }
    const series = chart.series.find((item) => item.id === seriesId);
    assert.ok(series);
    const expected = formatTrajectoryPercent(axisEndProgress(series.samples));
    assert.equal(system.endLabel, expected);
  }
  assert.equal(systems.find((item) => item.id === "nervous")?.endLabel, "68%");
  assert.equal(systems.find((item) => item.id === "digestive")?.endLabel, "");
});

test("demo ES/EN copy names curve progress and overlay, not an average", () => {
  const en = recoveryCopyFromSource(
    (key) => (enRecovery as Record<string, string>)[key] ?? key,
  );
  const esChart = buildDemoChart(SPANISH_RECOVERY_COPY);
  const enChart = buildDemoChart(en);
  assert.equal(esChart.showToday, enChart.showToday);
  assert.deepEqual(
    esChart.series.map((item) => item.id),
    enChart.series.map((item) => item.id),
  );
  assert.equal(esRecoveryOverview().includes("promedio"), false);
  assert.equal(enRecoveryOverview().toLowerCase().includes("average"), false);
  assert.match(esRecoveryOverview(), /Mostrar todas las curvas/);
  assert.match(enRecoveryOverview(), /Show all curves/);
  assert.match(esRecoveryYAxis(), /Avance de cada curva/);
  assert.match(enRecoveryYAxis(), /Progress along each curve/);
});

test("live overlay and mixed-organ rules stay in the adapter", () => {
  const adapter = readFileSync(
    new URL("./adapt-live-dashboard.ts", import.meta.url),
    "utf8",
  );
  assert.match(adapter, /showToday = overlaySubstanceCount === 1/);
  assert.match(adapter, /kind === "mixed"/);
  assert.match(adapter, /hideCombined/);
  assert.match(adapter, /worstCurveProgressAtDay/);
  assert.equal(adapter.includes("estimateCurve"), true);
});

test("preview hook wires demo builders and does not hardcode a shared Today", () => {
  const hook = readFileSync(
    new URL("../hooks/usePreviewDashboard.ts", import.meta.url),
    "utf8",
  );
  assert.match(hook, /buildDemoChart/);
  assert.match(hook, /demoDashboardSystems/);
  assert.match(hook, /demoDashboardChanges/);
  assert.equal(hook.includes("showToday: true"), false);
  assert.equal(hook.includes("demoTodayPosition"), false);
});

function esRecoveryOverview(): string {
  return JSON.parse(
    readFileSync(new URL("../../../i18n/locales/es/recovery.json", import.meta.url), "utf8"),
  ).chartOverview;
}

function enRecoveryOverview(): string {
  return (enRecovery as { chartOverview: string }).chartOverview;
}

function esRecoveryYAxis(): string {
  return JSON.parse(
    readFileSync(new URL("../../../i18n/locales/es/recovery.json", import.meta.url), "utf8"),
  ).chartYAxis;
}

function enRecoveryYAxis(): string {
  return (enRecovery as { chartYAxis: string }).chartYAxis;
}
