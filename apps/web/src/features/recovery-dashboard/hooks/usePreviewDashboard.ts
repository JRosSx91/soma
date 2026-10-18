import { useMemo } from "react";
import { useAuth } from "../../auth/index.js";
import { useOrganStates } from "../../profile/index.js";
import type { UserProfile } from "../../profile/types.js";
import { useSubstances } from "../../substances/index.js";
import {
  demoChanges,
  demoSeries,
  demoSubstances,
  demoSystems,
  demoAxisLabels,
  demoTodayLabel,
  demoTodayPosition,
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
import { useLiveProfile } from "./useLiveProfile.js";

export type DashboardMode = "demo" | "live";

export interface DashboardChartView {
  axisLabels: readonly string[];
  todayPosition: number;
  todayLabel: string;
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

function demoChart(): DashboardChartView {
  return {
    axisLabels: demoAxisLabels,
    todayPosition: demoTodayPosition,
    todayLabel: demoTodayLabel,
    series: demoSeries,
    footnote:
      "Valores de demostración. El eje repite la composición del mockup y no es una escala clínica.",
  };
}

function liveChartToView(chart: LiveChartModel): DashboardChartView {
  return {
    axisLabels: chart.axisLabels,
    todayPosition: chart.todayPosition,
    todayLabel: chart.todayLabel,
    series: chart.series,
    footnote: chart.footnote,
  };
}

/**
 * Preview Inicio / Recuperación data source.
 *
 * - Signed out → demo snapshot (public design review).
 * - Signed in → profile + Soma 1.0 organ/recovery engine.
 * Never mixes demo figures into a live metric.
 */
export function usePreviewDashboard(substanceId: string | null = null): PreviewDashboardView {
  const { user, loading: authLoading } = useAuth();
  const sessionPending = authLoading;
  const liveProfile = useLiveProfile(user?.id ?? null);
  const { data: substances, loading: substancesLoading, error: substancesError } =
    useSubstances();

  const adaptedProfile = useMemo(() => {
    if (!liveProfile.profile) return EMPTY_PROFILE;
    return adaptServerProfile(liveProfile.profile);
  }, [liveProfile.profile]);

  const { states: organStates, loading: organLoading, error: organError } =
    useOrganStates(adaptedProfile);

  const isLive = Boolean(user);
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
    });
  }, [
    adaptedProfile.usages,
    error,
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
      substances: demoSubstances,
      systems: demoSystems,
      changes: demoChanges,
      chart: demoChart(),
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
      chart: {
        axisLabels: LIVE_AXIS_PLACEHOLDER,
        todayPosition: 0,
        todayLabel: "Hoy",
        series: [],
        footnote: "",
      },
      emptyUsages: false,
      showDemoBadge: false,
    };
  }

  if (error || !liveModel) {
    return {
      mode: "live",
      loading: false,
      error: error ?? "No se han podido cargar tus datos de recuperación.",
      reload: liveProfile.reload,
      substances: [],
      systems: [],
      changes: [],
      chart: {
        axisLabels: LIVE_AXIS_PLACEHOLDER,
        todayPosition: 0,
        todayLabel: "Hoy",
        series: [],
        footnote: "",
      },
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

const LIVE_AXIS_PLACEHOLDER = ["Inicio", "1 mes", "3 meses", "6 meses", "1 año"] as const;
