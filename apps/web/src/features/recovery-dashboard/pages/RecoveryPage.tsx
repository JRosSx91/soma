import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import {
  changeSubstance,
  chartSeriesForSystem,
  recoveryTabs,
  type RecoveryTab,
} from "../pages-data.js";
import { previewFocus } from "../focus.js";
import { resolveRecoverySubstance } from "../dashboard/recovery-query.js";
import {
  pickDailyMessage,
  readDailyMessages,
} from "../dashboard/home-daily-message.js";
import { usePreviewDashboard } from "../hooks/usePreviewDashboard.js";
import { DetailSheet } from "../components/DetailSheet.js";
import { EvolutionChart } from "../components/EvolutionChart.js";
import { PageHeading } from "../components/PageHeading.js";
import { RecoveryFocusPanel } from "../components/RecoveryFocusPanel.js";
import { RecoveryHero } from "../components/RecoveryHero.js";
import { RecentChangeCard } from "../components/RecentChangeCard.js";
import { SegmentedControl } from "../components/SegmentedControl.js";
import { SubstanceCard } from "../components/SubstanceCard.js";
import { TemporalThresholdRail } from "../components/TemporalThresholdRail.js";
import { useTemporalMilestones } from "../hooks/useTemporalMilestones.js";
import { useLiveAchievements } from "../hooks/useLiveAchievements.js";
import { useAuth } from "../../auth/index.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import { anatomyExplorerHref } from "../anatomy/anatomy-explorer-query.js";
import { SystemTile } from "../components/SystemTile.js";

const atlasForDashboardSystem: Record<string, string> = {
  nervous: "nervous-central",
  cardio: "cardiovascular",
  respiratory: "respiratory",
  digestive: "digestive",
  endocrine: "endocrine",
  immune: "immune",
};

export function RecoveryPage() {
  const { t } = useTranslation("recovery");
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSubstance = searchParams.get("substance");
  const [tab, setTab] = useState<RecoveryTab>("general");
  const [substanceId, setSubstanceId] = useState<string | null>(null);
  const [systemId, setSystemId] = useState<string | null>(null);
  const [seriesId, setSeriesId] = useState("general");
  const [openId, setOpenId] = useState<string | null>(null);
  const appliedQuery = useRef(false);

  const dashboard = usePreviewDashboard(tab === "substance" ? substanceId : null);
  const live = dashboard.mode === "live";
  const { user } = useAuth();
  const base = useShellBase();
  const liveEnabled = Boolean(user) && base === "/app";
  const achievements = useLiveAchievements(liveEnabled ? (user?.id ?? null) : null);
  const temporal = useTemporalMilestones(dashboard.substances, {
    enabled: !dashboard.loading && !dashboard.error && dashboard.substances.length > 0,
    syncUnlocks: liveEnabled,
  });
  const temporalById = useMemo(
    () => new Map(temporal.states.map((state) => [state.substanceId, state])),
    [temporal.states],
  );
  const persistedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const row of achievements.rows ?? []) {
      if (row.unlocked && row.family === "temporal") ids.add(row.id);
    }
    return ids;
  }, [achievements.rows]);
  const quote = pickDailyMessage(
    readDailyMessages(t("homeDailyMessages", { returnObjects: true })),
  );

  useEffect(() => {
    if (dashboard.loading || dashboard.error) return;
    if (dashboard.substances.length === 0) {
      setSubstanceId(null);
      return;
    }
    const knownIds = dashboard.substances.map((item) => item.id);
    const fromQuery = resolveRecoverySubstance(requestedSubstance, knownIds);
    if (fromQuery) {
      setSubstanceId(fromQuery);
      if (!appliedQuery.current) {
        appliedQuery.current = true;
        setTab("substance");
      }
      return;
    }
    appliedQuery.current = true;
    if (!substanceId || !knownIds.includes(substanceId)) {
      setSubstanceId(knownIds[0] ?? null);
    }
  }, [dashboard.error, dashboard.loading, dashboard.substances, requestedSubstance, substanceId]);

  useEffect(() => {
    if (dashboard.loading || dashboard.error) return;
    if (dashboard.systems.length === 0) {
      setSystemId(null);
      return;
    }
    if (!systemId || !dashboard.systems.some((item) => item.id === systemId)) {
      setSystemId(dashboard.systems[0]?.id ?? null);
    }
  }, [dashboard.error, dashboard.loading, dashboard.systems, systemId]);

  useEffect(() => {
    if (seriesId === "general") return;
    if (!dashboard.chart.series.some((item) => item.id === seriesId)) {
      setSeriesId("general");
    }
  }, [dashboard.chart.series, seriesId]);

  const substance =
    dashboard.substances.find((item) => item.id === substanceId) ??
    dashboard.substances[0] ??
    null;
  const system =
    dashboard.systems.find((item) => item.id === systemId) ??
    dashboard.systems[0] ??
    null;
  const openChange = dashboard.changes.find((item) => item.id === openId);

  const visibleChanges = useMemo(() => {
    if (live) {
      if (tab === "system" && system) {
        return dashboard.changes.filter(
          (item) => item.icon === system.icon || item.system === system.name,
        );
      }
      return dashboard.changes;
    }

    if (tab === "substance" && substance) {
      return dashboard.changes.filter((item) => changeSubstance[item.id] === substance.id);
    }
    if (tab === "system" && system) {
      return dashboard.changes.filter((item) => item.icon === system.icon);
    }
    return dashboard.changes;
  }, [dashboard.changes, live, substance, system, tab]);

  const tabOptions = useMemo(
    () =>
      recoveryTabs.map((item) => ({
        id: item.id,
        label: t(item.labelKey),
      })),
    [t],
  );

  if (dashboard.loading) {
    return (
      <div className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-10 text-sm text-soma-ink-secondary">
        {t("loading")}
      </div>
    );
  }

  if (dashboard.error) {
    return (
      <div className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-6 text-sm text-soma-ink-secondary">
        <p>{t("loadError")}</p>
        <button
          type="button"
          onClick={dashboard.reload}
          className={`${previewFocus} mt-3 text-soma-action hover:text-soma-action-hover`}
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  if (live && dashboard.emptyUsages) {
    return (
      <div className="flex flex-col gap-4 pb-6">
        <PageHeading
          eyebrow={t("emptyEyebrow")}
          title={t("emptyTitle")}
          description={t("emptyBody")}
          demo={false}
        />
        <p className="rounded-2xl border border-dashed border-soma-line px-4 py-6 text-sm text-soma-ink-muted">
          {t("emptyHint")}
        </p>
        <Link
          to="/onboarding"
          className={`${previewFocus} text-sm text-soma-action hover:text-soma-action-hover`}
        >
          {t("goOnboarding")}
        </Link>
      </div>
    );
  }

  if (!substance) return null;

  const selectSubstance = (id: string) => {
    setSubstanceId(id);
    setSearchParams({ substance: id }, { replace: true });
  };

  const selectTab = (next: RecoveryTab) => {
    setTab(next);
    if (next === "substance" && substanceId) {
      setSearchParams({ substance: substanceId }, { replace: true });
    } else if (next !== "substance" && requestedSubstance) {
      setSearchParams({}, { replace: true });
    }
    if (next === "timeline") {
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.requestAnimationFrame(() => {
        const rail = document.getElementById("recovery-temporal-rail");
        rail?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
        rail?.focus({ preventScroll: true });
      });
    }
  };

  const showChart =
    tab === "general" ||
    (tab === "system" &&
      system &&
      (live
        ? dashboard.chart.series.some((item) => item.id === system.id)
        : Boolean(chartSeriesForSystem[system.id]))) ||
    (tab === "substance" && live && dashboard.chart.series.length > 0);

  const showPanel = tab === "general" || tab === "substance" || tab === "timeline";
  const showSystems = tab === "general" || tab === "system";

  return (
    <div className="flex min-w-0 flex-col gap-5 pb-6">
      <RecoveryHero
        eyebrow={t("emptyEyebrow")}
        title={t("emptyTitle")}
        description={live ? t("liveDescription") : t("demoDescription")}
        quote={quote}
        demo={dashboard.showDemoBadge}
      >
        <ul className={substanceGridClass(dashboard.substances.length)}>
          {dashboard.substances.map((item) => (
            <li key={item.id} className="min-w-0">
              <SubstanceCard
                substance={item}
                selected={item.id === substance.id}
                onSelect={selectSubstance}
                temporal={temporalById.get(item.id)}
              />
            </li>
          ))}
        </ul>
      </RecoveryHero>

      <SegmentedControl
        label={t("recoveryViewLabel")}
        value={tab}
        options={tabOptions}
        onChange={selectTab}
      />

      {showPanel ? (
        <RecoveryFocusPanel
          substance={substance}
          temporal={temporalById.get(substance.id)}
          persistedIds={persistedIds}
          live={live}
        >
          <TemporalThresholdRail
            substanceId={substance.id}
            temporal={temporalById.get(substance.id)}
            persistedIds={persistedIds}
            embedded
            highlighted={tab === "timeline"}
          />
        </RecoveryFocusPanel>
      ) : null}

      {tab === "system" ? (
        dashboard.systems.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-soma-line px-4 py-6 text-sm text-soma-ink-muted">
            {t("noSystems")}
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dashboard.systems.map((item) => (
              <li key={item.id} className="min-w-0">
                <SystemTile
                  system={item}
                  selected={item.id === system?.id}
                  live={live}
                  onSelect={(id) => {
                    setSystemId(id);
                    if (live) {
                      setSeriesId(id);
                    } else {
                      const series = chartSeriesForSystem[id];
                      if (series) setSeriesId(series);
                    }
                  }}
                />
              </li>
            ))}
          </ul>
        )
      ) : null}

      {showChart ? (
        <EvolutionChart
          seriesId={seriesId}
          onSeries={setSeriesId}
          chart={dashboard.chart}
          live={live}
          modelNote={live ? substance.phase : null}
        />
      ) : null}

      {tab === "system" && system && !live && !chartSeriesForSystem[system.id] ? (
        <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-3 text-sm text-soma-ink-secondary">
          {t("demoChartNoSeries", { system: system.name })}
        </p>
      ) : null}

      {tab === "substance" ? (
        live ? (
          <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-3 text-sm text-soma-ink-secondary">
            {t("liveSubstanceFilter", { name: substance.name, phase: substance.phase })}
          </p>
        ) : (
          <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-3 text-sm text-soma-ink-secondary">
            {t("demoSubstanceNoSplit", { name: substance.name, phase: substance.phase })}
          </p>
        )
      ) : null}

      {showSystems && tab === "general" ? (
        <section>
          <div className="mb-3 flex min-h-10 items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-soma-ink">{t("recoverySystemsTitle")}</h2>
              <p className="mt-0.5 text-xs text-soma-ink-muted">
                {live ? t("organsLiveHint") : t("recoverySystemsHintDemo")}
              </p>
            </div>
            <Link to={`${base}/anatomy`} className={`${previewFocus} inline-flex min-h-10 items-center gap-1 text-sm text-soma-action hover:text-soma-action-hover`}>
              {t("recoverySeeAtlas")}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          {dashboard.systems.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-soma-line px-4 py-6 text-sm text-soma-ink-muted">
              {t("noSystems")}
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dashboard.systems.map((item) => {
                const atlasId = atlasForDashboardSystem[item.id];
                return (
                  <li key={item.id} className="min-w-0">
                    <Link
                      to={atlasId ? anatomyExplorerHref(base, atlasId) : `${base}/anatomy`}
                      className={`${previewFocus} block h-full rounded-2xl`}
                    >
                      <SystemTile system={item} live={live} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "system" ? (
        <section className="min-w-0">
          <h2 className="text-base font-semibold text-soma-ink">
            {live ? t("organsTitleLive") : t("milestonesTitle")}
          </h2>
          <p className="mt-0.5 text-xs text-soma-ink-muted">
            {live ? t("organsLiveHint") : t("milestonesDemoHint")}
          </p>
          {visibleChanges.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-soma-line px-4 py-6 text-sm text-soma-ink-muted">
              {live ? t("noOrgansLive") : t("noMilestonesDemo")}
            </p>
          ) : (
            <ul className="mt-4 grid items-stretch gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleChanges.map((change) => (
                <li key={change.id} className="min-w-0">
                  <RecentChangeCard
                    change={change}
                    live={live}
                    onOpen={() => setOpenId(change.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {openChange ? (
        <DetailSheet title={openChange.title} onClose={() => setOpenId(null)}>
          <p>{openChange.system}</p>
          <p className="mt-2">{openChange.body}</p>
          {openChange.note ? <p className="mt-2">{openChange.note}</p> : null}
          {openChange.endLabel || (!live && t(`demoMoments.${openChange.id}`)) ? (
            <p className="mt-2 text-soma-ink">
              {openChange.endLabel
                ? `${live ? t("estimateOrientative") : t("estimateSrDemo")} ${openChange.endLabel}`
                : null}
              {!live
                ? `${openChange.endLabel ? " · " : ""}${t(`demoMoments.${openChange.id}`)}`
                : ""}
            </p>
          ) : null}
        </DetailSheet>
      ) : null}
    </div>
  );
}

function substanceGridClass(count: number): string {
  if (count <= 1) {
    return "grid min-w-0 items-stretch gap-2.5 sm:max-w-sm";
  }
  if (count === 2) {
    return "grid min-w-0 items-stretch gap-2.5 sm:grid-cols-2 sm:max-w-3xl";
  }
  if (count === 3) {
    return "grid min-w-0 items-stretch gap-2.5 sm:grid-cols-2 lg:grid-cols-3";
  }
  return "grid min-w-0 items-stretch gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
}
