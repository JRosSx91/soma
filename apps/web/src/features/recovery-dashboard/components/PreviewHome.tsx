import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { previewFocus } from "../focus.js";
import { usePreviewDashboard } from "../hooks/usePreviewDashboard.js";
import { AbstinencePill } from "./AbstinencePill.js";
import { DemoNotice } from "./DemoNotice.js";
import { EvolutionChart } from "./EvolutionChart.js";
import { HeroFigure } from "./HeroFigure.js";
import { HeroFilaments } from "./HeroFilaments.js";
import { RecentChangeCard } from "./RecentChangeCard.js";
import { SubstanceCard } from "./SubstanceCard.js";
import { SubstanceChip } from "./SubstanceChip.js";
import { SystemTile } from "./SystemTile.js";

export function PreviewHome() {
  const { t } = useTranslation("recovery");
  const [substanceId, setSubstanceId] = useState<string | null>(null);
  const [seriesId, setSeriesId] = useState("general");
  const dashboard = usePreviewDashboard(substanceId);
  const live = dashboard.mode === "live";

  useEffect(() => {
    if (dashboard.loading || dashboard.error) return;
    if (dashboard.substances.length === 0) {
      setSubstanceId(null);
      return;
    }
    if (!substanceId || !dashboard.substances.some((item) => item.id === substanceId)) {
      setSubstanceId(dashboard.substances[0]?.id ?? null);
    }
  }, [dashboard.error, dashboard.loading, dashboard.substances, substanceId]);

  useEffect(() => {
    if (seriesId === "general") return;
    if (!dashboard.chart.series.some((item) => item.id === seriesId)) {
      setSeriesId("general");
    }
  }, [dashboard.chart.series, seriesId]);

  const selected =
    dashboard.substances.find((item) => item.id === substanceId) ??
    dashboard.substances[0] ??
    null;
  const featuredChange = dashboard.changes[0] ?? null;

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
      <div className="relative flex flex-col gap-4">
        <header>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-soma-action">
              {t("homeEyebrow")}
            </p>
          </div>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-soma-ink sm:text-4xl">
            <span className="block">{t("homeTitleLead")}</span>
            <span className="block text-soma-action">{t("homeTitleAccent")}</span>
          </h1>
          <p className="mt-3 max-w-xl rounded-2xl border border-dashed border-soma-line px-4 py-5 text-sm text-soma-ink-secondary">
            {t("homeEmptyBody")}
          </p>
          <Link
            to="/onboarding"
            className={`${previewFocus} mt-4 inline-flex text-sm text-soma-action hover:text-soma-action-hover`}
          >
            {t("goOnboarding")}
          </Link>
        </header>
      </div>
    );
  }

  if (!selected) return null;

  return (
    <div className="relative flex flex-col gap-4 lg:gap-2 xl:grid xl:grid-cols-1 xl:grid-rows-[auto_auto_auto_auto] xl:content-start xl:gap-2">
      <HeroFilaments />
      <HeroFigure className="md:h-[22rem] md:w-[18rem] lg:h-[26rem] lg:w-[21.5rem] xl:h-[28rem] xl:w-[23rem]" />
      <header className="relative z-10">
        <div className="md:pr-[19rem] lg:pr-[22.5rem] xl:pr-[24rem]">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-[11px] font-medium uppercase tracking-[0.22em] text-soma-action">
              {t("homeEyebrow")}
            </p>
            <span className="flex shrink-0 items-center gap-2">
              {dashboard.showDemoBadge ? <DemoNotice /> : null}
              <AbstinencePill
                label={selected.pillDetail}
                className="hidden sm:inline-flex"
              />
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-soma-ink sm:text-4xl lg:text-3xl">
            <span className="block">{t("homeTitleLead")}</span>
            <span className="block text-soma-action">{t("homeTitleAccent")}</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-soma-ink-secondary lg:mt-1 lg:max-w-none lg:text-[13px] lg:leading-snug">
            {live ? t("homeLiveDescription") : t("homeDemoDescription")}
          </p>
          <AbstinencePill
            label={selected.pillDetail}
            className="mt-4 w-full justify-between sm:hidden"
          />
          <ul className="mt-4 flex gap-2 lg:hidden">
            {dashboard.substances.map((substance) => (
              <li key={substance.id}>
                <SubstanceChip
                  substance={substance}
                  selected={substance.id === selected.id}
                  onSelect={setSubstanceId}
                />
              </li>
            ))}
          </ul>
          <ul className="mt-3 hidden gap-2.5 lg:grid lg:grid-cols-3">
            {dashboard.substances.map((substance) => (
              <li key={substance.id}>
                <SubstanceCard
                  substance={substance}
                  selected={substance.id === selected.id}
                  onSelect={setSubstanceId}
                />
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="relative z-10 overflow-x-clip">
        <EvolutionChart
          seriesId={seriesId}
          onSeries={setSeriesId}
          chart={dashboard.chart}
          live={live}
        />
      </div>

      {dashboard.changes.length > 0 ? (
        <section className="hidden lg:block">
          <h2 className="text-base font-semibold text-soma-ink">
            {live ? t("homeChangesTitleLive") : t("homeChangesTitleDemo")}
          </h2>
          <p className="mt-0.5 text-xs text-soma-ink-muted">
            {live ? t("homeChangesLive") : t("homeChangesDemo")}
          </p>
          <ul className="mt-2 grid gap-2.5 lg:grid-cols-3">
            {dashboard.changes.map((change) => (
              <li key={change.id}>
                <RecentChangeCard change={change} live={live} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-soma-ink lg:text-base">
              {t("homeSystemsTitle")}
            </h2>
            <p className="mt-0.5 hidden text-xs text-soma-ink-muted lg:block">
              {live ? t("homeSystemsLive") : t("homeSystemsDemo")}
            </p>
          </div>
          {!live ? (
            <button
              type="button"
              className={`${previewFocus} shrink-0 text-sm text-soma-action hover:text-soma-action-hover`}
            >
              {t("seeAll")}
            </button>
          ) : null}
        </div>
        {dashboard.systems.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-soma-line px-4 py-6 text-sm text-soma-ink-muted">
            {t("noSystems")}
          </p>
        ) : (
          <ul className="mt-4 flex gap-3 overflow-x-auto pb-1 lg:mt-2 lg:grid lg:grid-cols-3 lg:gap-2.5 lg:overflow-visible xl:grid-cols-6">
            {dashboard.systems.map((system) => (
              <li key={system.id} className="lg:min-w-0">
                <SystemTile system={system} live={live} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {featuredChange ? (
        <section className="lg:hidden">
          <h2 className="text-lg font-semibold text-soma-ink">
            {live ? t("homeFeaturedLive") : t("homeFeaturedDemo")}
          </h2>
          <div className="mt-3">
            <RecentChangeCard change={featuredChange} featured live={live} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
