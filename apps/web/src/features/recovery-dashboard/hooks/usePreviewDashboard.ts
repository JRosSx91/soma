import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/index.js";
import { useOrganStates } from "../../profile/index.js";
import type { UserProfile } from "../../profile/types.js";
import { useSubstances } from "../../substances/index.js";
import {
  demoSubstances,
  type DemoChange,
  type DemoSeries,
  type DemoSubstance,
  type DemoSystem,
} from "../demo-data.js";
import {
  adaptServerProfile,
  buildLiveDashboard,
  type LiveChartModel,
} from "../dashboard/adapt-live-dashboard.js";
import {
  buildDemoChart,
  demoDashboardChanges,
  demoDashboardSystems,
} from "../dashboard/demo-dashboard.js";
import {
  recoveryCopyFromSource,
  type RecoveryDashboardCopy,
} from "../dashboard/recovery-copy.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import { withSessionLastUseDates } from "../dashboard/temporal-usage.js";
import { useLiveProfile } from "./useLiveProfile.js";

export type DashboardMode = "demo" | "live";

export interface DashboardChartView {
  axisLabels: readonly string[];
  todayPosition: number;
  todayLabel: string;
  showToday: boolean;
  series: readonly DemoSeries[];
  footnote: string;
}

export interface PreviewDashboardView {
  mode: DashboardMode;
  /** True while auth restore or live profile/catalog is still loading. */
  loading: boolean;
  /** Live API error. Never falls back to demo figures when set. */
  error: string | null;
  reload: () => void;
  substances: readonly DemoSubstance[];
  systems: readonly DemoSystem[];
  changes: readonly DemoChange[];
  chart: DashboardChartView;
  emptyUsages: boolean;
  showDemoBadge: boolean;
}

const EMPTY_PROFILE: UserProfile = {
  displayName: "",
  biologicalSex: "male",
  birthYear: 1990,
  usages: [],
};

function liveChartToView(chart: LiveChartModel): DashboardChartView {
  return {
    axisLabels: chart.axisLabels,
    todayPosition: chart.todayPosition,
    todayLabel: chart.todayLabel,
    showToday: chart.showToday,
    series: chart.series,
    footnote: chart.footnote,
  };
}

function emptyLiveChart(copy: RecoveryDashboardCopy): DashboardChartView {
  return {
    axisLabels: copy.axisLabels,
    todayPosition: 0,
    todayLabel: copy.today,
    showToday: false,
    series: [],
    footnote: "",
  };
}

/**
 * Preview Inicio / Recuperación data source.
 *
 * - `/preview` → always demo snapshot (even if a session exists).
 * - `/app` + signed in → profile + Soma 1.0 organ/recovery engine.
 * Never mixes demo figures into a live metric.
 *
 * Copy is resolved from the current i18n language. Changing language
 * rebuilds labels only; profile, catalog and organ math are not refetched.
 */
export function usePreviewDashboard(substanceId: string | null = null): PreviewDashboardView {
  const { t, i18n } = useTranslation("recovery");
  const [demoClock] = useState(() => Date.now());
  const demoSubstancesWithClock = useMemo(
    () => withSessionLastUseDates(demoSubstances, demoClock),
    [demoClock],
  );
  const copy = useMemo(
    () => recoveryCopyFromSource((key) => t(key)),
    [t, i18n.language],
  );
  const { user, loading: authLoading } = useAuth();
  const base = useShellBase();
  const sessionPending = authLoading;
  /** Live private data only under the authenticated app shell. */
  const isLive = Boolean(user) && base === "/app";
  const liveProfile = useLiveProfile(isLive ? (user?.id ?? null) : null);
  const { data: substances, loading: substancesLoading, error: substancesError } =
    useSubstances();

  const adaptedProfile = useMemo(() => {
    if (!liveProfile.profile) return EMPTY_PROFILE;
    return adaptServerProfile(liveProfile.profile);
  }, [liveProfile.profile]);

  const { states: organStates, loading: organLoading, error: organError } =
    useOrganStates(adaptedProfile);
  const loading =
    sessionPending ||
    (isLive && (liveProfile.loading || substancesLoading || organLoading));

  const error = isLive
    ? liveProfile.error ??
      (substancesError ? substancesError.message : null) ??
      (organError ? organError.message : null)
    : null;

  const liveModel = useMemo(() => {
    if (!isLive || !liveProfile.profile || !substances || error) return null;
    return buildLiveDashboard({
      usages: adaptedProfile.usages,
      substances,
      organStates,
      substanceId,
      copy,
      organLabel: (organId, fallback) =>
        i18n.t(organId, { ns: "organs", defaultValue: fallback }),
    });
  }, [
    adaptedProfile.usages,
    copy,
    error,
    i18n,
    i18n.language,
    isLive,
    liveProfile.profile,
    organStates,
    substanceId,
    substances,
  ]);

  if (!isLive) {
    return {
      mode: "demo",
      loading: sessionPending,
      error: null,
      reload: liveProfile.reload,
      substances: demoSubstancesWithClock,
      systems: demoDashboardSystems(),
      changes: demoDashboardChanges(),
      chart: buildDemoChart(copy),
      emptyUsages: false,
      showDemoBadge: true,
    };
  }

  if (loading) {
    return {
      mode: "live",
      loading: true,
      error: null,
      reload: liveProfile.reload,
      substances: [],
      systems: [],
      changes: [],
      chart: emptyLiveChart(copy),
      emptyUsages: false,
      showDemoBadge: false,
    };
  }

  if (error || !liveModel) {
    return {
      mode: "live",
      loading: false,
      error: error ?? copy.loadErrorLive,
      reload: liveProfile.reload,
      substances: [],
      systems: [],
      changes: [],
      chart: emptyLiveChart(copy),
      emptyUsages: false,
      showDemoBadge: false,
    };
  }

  const emptyUsages = adaptedProfile.usages.length === 0;

  return {
    mode: "live",
    loading: false,
    error: null,
    reload: liveProfile.reload,
    substances: liveModel.substances,
    systems: liveModel.systems,
    changes: liveModel.changes,
    chart: liveChartToView(liveModel.chart),
    emptyUsages,
    showDemoBadge: false,
  };
}
