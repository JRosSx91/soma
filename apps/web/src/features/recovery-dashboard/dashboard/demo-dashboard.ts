import {
  demoChanges,
  demoSeries,
  demoSystems,
  type DemoChange,
  type DemoSeries,
  type DemoSystem,
} from "../demo-data.js";
import { chartSeriesForSystem } from "../pages-data.js";
import type { RecoveryDashboardCopy } from "./recovery-copy.js";
import {
  formatLabeledPercent,
  formatTrajectoryPercent,
} from "./recovery-semantics.js";

/**
 * Last axis sample of a demo series. Legend and system tiles that share
 * this magnitude must read it from here — not from a separate “Hoy” label.
 */
export function axisEndProgress(samples: readonly number[]): number {
  const value = samples[samples.length - 1];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/**
 * Demo chart for `/preview`. Three mock substances have different day
 * counts, so there is no shared “today” marker and no combined %.
 * Legend figures are the day-365 sample of each series.
 */
export function buildDemoChart(copy: RecoveryDashboardCopy): {
  axisLabels: readonly string[];
  todayPosition: number;
  todayLabel: string;
  showToday: boolean;
  series: readonly DemoSeries[];
  footnote: string;
} {
  return {
    axisLabels: copy.axisLabels,
    todayPosition: 0,
    todayLabel: "",
    showToday: false,
    series: demoSeries.map((item) => {
      const yearProgress = axisEndProgress(item.samples);
      return {
        ...item,
        endLabel: "",
        referenceAtYearLabel: formatLabeledPercent(copy.day365, yearProgress),
      };
    }),
    footnote: copy.demoFootnote,
  };
}

/** System tiles: only series that exist on the chart reuse that series’ end sample. */
export function demoDashboardSystems(): readonly DemoSystem[] {
  return demoSystems.map((system) => {
    const seriesId = chartSeriesForSystem[system.id];
    const series = seriesId
      ? demoSeries.find((item) => item.id === seriesId)
      : undefined;
    if (!series) {
      return { ...system, endLabel: "" };
    }
    return {
      ...system,
      endLabel: formatTrajectoryPercent(axisEndProgress(series.samples)),
    };
  });
}

/** Narrative demo milestones. They are not curve checkpoints, so no %. */
export function demoDashboardChanges(): readonly DemoChange[] {
  return demoChanges.map((item) => ({ ...item, endLabel: "" }));
}
