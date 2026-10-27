import {
  demoChanges,
  demoSeries,
  demoSystems,
  type DemoChange,
  type DemoSeries,
  type DemoSubstance,
  type DemoSystem,
} from "../demo-data.js";
import { chartSeriesForSystem } from "../pages-data.js";
import { formatDaysAbstinent } from "./adapt-live-dashboard.js";
import {
  fillRecoveryTemplate,
  type RecoveryDashboardCopy,
} from "./recovery-copy.js";
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

/** Visible DEMO substance copy. Elapsed days stay numeric; labels follow UI language. */
export function presentDemoSubstances(
  substances: readonly DemoSubstance[],
  copy: RecoveryDashboardCopy,
  labels: {
    name: (id: string) => string;
    phase: (id: string) => string;
  },
): DemoSubstance[] {
  return substances.map((item) => {
    const name = labels.name(item.id);
    const abstinence =
      item.elapsedDays == null
        ? item.abstinence
        : formatDaysAbstinent(item.elapsedDays, copy);
    return {
      ...item,
      name,
      abstinence,
      pillDetail: fillRecoveryTemplate(copy.pillAbstinent, {
        days: abstinence,
        name,
      }),
      phase: labels.phase(item.id),
    };
  });
}

export function presentDemoSystems(nameFor: (id: string) => string): DemoSystem[] {
  return demoDashboardSystems().map((system) => ({
    ...system,
    name: nameFor(system.id),
  }));
}

export function presentDemoChanges(labels: {
  system: (id: string) => string;
  title: (id: string) => string;
  body: (id: string) => string;
  status: string;
}): DemoChange[] {
  return demoDashboardChanges().map((item) => ({
    ...item,
    system: labels.system(item.id),
    title: labels.title(item.id),
    body: labels.body(item.id),
    status: labels.status,
  }));
}

export function presentDemoChart(
  copy: RecoveryDashboardCopy,
  labelFor: (id: string) => string,
) {
  const chart = buildDemoChart(copy);
  return {
    ...chart,
    series: chart.series.map((item) => ({
      ...item,
      label: labelFor(item.id),
    })),
  };
}
