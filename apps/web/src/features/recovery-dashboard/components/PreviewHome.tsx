import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Award, ChevronRight, Route } from "lucide-react";
import { HomeProgressIdentity, useProgress } from "../../progress/index.js";
import type { TemporalMilestoneState } from "@soma/shared-types";
import { useAuth } from "../../auth/index.js";
import type { AchievementWithUnlockState } from "../../achievements/types.js";
import type { DemoSubstance } from "../demo-data.js";
import { previewFocus } from "../focus.js";
import { usePreviewDashboard } from "../hooks/usePreviewDashboard.js";
import { useLiveAchievements } from "../hooks/useLiveAchievements.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import {
  pickDailyMessage,
  readDailyMessages,
} from "../dashboard/home-daily-message.js";
import {
  formatDisplayDate,
  pickNextLockedAchievement,
  pickRecentUnlockedAchievements,
} from "../dashboard/home-progress.js";
import { remainingProgressPercent, temporalBarFill } from "../dashboard/temporal-remaining.js";
import { recoveryHref } from "../dashboard/recovery-query.js";
import type { ShellBase } from "../shell-base.js";
import { useTemporalMilestones } from "../hooks/useTemporalMilestones.js";
import { AchievementMedal } from "./AchievementMedal.js";
import { NextTemporalMedalCard } from "./NextTemporalMedalCard.js";
import { DemoNotice } from "./DemoNotice.js";
import { HeroFigure } from "./HeroFigure.js";
import { HeroFilaments } from "./HeroFilaments.js";
import { SubstanceIllustration } from "./SubstanceIllustration.js";

const textLink = `${previewFocus} inline-flex min-h-10 items-center gap-1 text-sm text-soma-action hover:text-soma-action-hover`;
const accentColor = { color: "rgb(var(--soma-shell-accent))" };
const temporalFillColor = { backgroundColor: "rgb(var(--soma-shell-accent))" };
const panelClass = "rounded-2xl border border-soma-line-strong bg-soma-surface/80 p-3";
const atlasButton = `${previewFocus} soma-atlas-cta inline-flex min-h-10 items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-md`;

function SectionFrame({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="mb-2 flex min-h-10 items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-soma-ink">{title}</h2>
        {action}
      </div>
      <section className={`${panelClass} flex min-h-0 flex-1 flex-col`}>{children}</section>
    </div>
  );
}

export function PreviewHome() {
  const { t, i18n } = useTranslation(["recovery", "achievements", "substances"]);
  const { user } = useAuth();
  const base = useShellBase();
  const dashboard = usePreviewDashboard(null);
  const live = dashboard.mode === "live";
  /** Live unlock state only under /app — /preview stays without account medals. */
  const liveEnabled = Boolean(user) && base === "/app";
  const progression = useProgress({
    live,
    userId: live ? (user?.id ?? null) : null,
  });
  const achievements = useLiveAchievements(liveEnabled ? (user?.id ?? null) : null);

  const trackedIds = dashboard.substances.map((item) => item.id);
  const nextMilestone = useMemo(
    () => pickNextLockedAchievement(achievements.rows, trackedIds),
    [achievements.rows, trackedIds],
  );
  const recentUnlocks = useMemo(
    () => (liveEnabled ? pickRecentUnlockedAchievements(achievements.rows, 4) : []),
    [achievements.rows, liveEnabled],
  );
  const unlockedCount =
    liveEnabled && achievements.rows
      ? achievements.rows.filter((row) => row.unlocked).length
      : null;
  const nextSubstance =
    dashboard.substances.find((item) => item.id === nextMilestone?.triggerSubstanceId) ?? null;
  const recoveryTo = recoveryHref(base);
  const anatomyTo = `${base}/anatomy`;
  const achievementsTo = `${base}/achievements`;
  const dailyPool = readDailyMessages(t("recovery:homeDailyMessages", { returnObjects: true }));
  const dailyMessage = pickDailyMessage(dailyPool);
  const horizonMessage = pickDailyMessage(dailyPool, new Date(), 1);
  const temporal = useTemporalMilestones(dashboard.substances, {
    enabled: !dashboard.loading && !dashboard.error && dashboard.substances.length > 0,
    syncUnlocks: liveEnabled,
  });
  const temporalById = useMemo(() => {
    const map = new Map<string, TemporalMilestoneState>();
    for (const state of temporal.states) map.set(state.substanceId, state);
    return map;
  }, [temporal.states]);
  const featuredTemporalName =
    dashboard.substances.find((item) => item.id === temporal.featured?.substanceId)?.name ??
    (temporal.featured
      ? t(`substances:${temporal.featured.substanceId}.name`, {
          defaultValue: temporal.featured.substanceId,
        })
      : "");

  if (dashboard.loading) {
    return (
      <div className="flex flex-col gap-4 pb-6">
        <HomeLead
          demo={dashboard.showDemoBadge}
          message={dailyMessage}
          tracked={0}
          unlockedCount={unlockedCount}
          progression={progression}
        />
        <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-10 text-sm text-soma-ink-secondary">
          {t("recovery:loading")}
        </p>
      </div>
    );
  }

  if (dashboard.error) {
    return (
      <div className="flex flex-col gap-4 pb-6">
        <HomeLead
          demo={dashboard.showDemoBadge}
          message={dailyMessage}
          tracked={0}
          unlockedCount={unlockedCount}
          progression={progression}
        />
        <div className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-6 text-sm text-soma-ink-secondary">
          <p>{t("recovery:loadError")}</p>
          <button
            type="button"
            onClick={dashboard.reload}
            className={`${previewFocus} mt-3 text-soma-action hover:text-soma-action-hover`}
          >
            {t("recovery:retry")}
          </button>
        </div>
      </div>
    );
  }

  if (live && dashboard.emptyUsages) {
    return (
      <div className="flex flex-col gap-4 pb-6">
        <HomeLead
          demo={false}
          message={dailyMessage}
          tracked={0}
          unlockedCount={unlockedCount}
          progression={progression}
        />
        <p className="rounded-2xl border border-dashed border-soma-line px-4 py-5 text-sm text-soma-ink-secondary">
          {t("recovery:homeEmptyBody")}
        </p>
        <Link to="/onboarding" className={textLink}>
          {t("recovery:goOnboarding")}
        </Link>
      </div>
    );
  }

  if (dashboard.substances.length === 0) {
    return (
      <div className="flex flex-col gap-4 pb-6">
        <HomeLead
          demo={dashboard.showDemoBadge}
          message={dailyMessage}
          tracked={0}
          unlockedCount={unlockedCount}
          progression={progression}
        />
      </div>
    );
  }

  return (
    <div className="relative flex min-w-0 flex-col gap-2 pb-6">
      <div
        className="grid min-w-0 items-start gap-2 lg:grid-cols-[minmax(0,21.5rem)_minmax(0,1fr)] lg:items-stretch lg:pr-[calc(min(28rem,34%)-4.5rem)]"
      >
        <HomeLead
          demo={dashboard.showDemoBadge}
          message={dailyMessage}
          tracked={dashboard.substances.length}
          unlockedCount={unlockedCount}
          progression={progression}
        />
      </div>
      <AnatomyColumn anatomyTo={anatomyTo} />
      <SubstanceRow
        substances={dashboard.substances}
        temporalById={temporalById}
        recoveryTo={recoveryTo}
        basePath={base}
      />

      <div
        className="relative z-10 grid min-w-0 items-stretch gap-3 lg:grid-cols-3"
      >
        {temporal.featured ? (
          <SectionFrame title={t("recovery:homeNextMedal")}>
            <NextTemporalMedalCard
              featured={temporal.featured}
              substanceName={featuredTemporalName}
              achievementsTo={achievementsTo}
            />
          </SectionFrame>
        ) : (
          <TemporalEmpty achievementsTo={achievementsTo} />
        )}
        <RecommendedExploration
          nextMilestone={nextMilestone}
          nextSubstanceName={nextSubstance?.name ?? null}
          recoveryTo={recoveryTo}
          anatomyTo={anatomyTo}
        />
        <RecentAchievements
          liveEnabled={liveEnabled}
          loading={liveEnabled && achievements.loading}
          error={liveEnabled ? achievements.error : null}
          onRetry={achievements.reload}
          items={recentUnlocks}
          locale={i18n.language}
          achievementsTo={achievementsTo}
        />
      </div>

      <div
        className="relative z-10 grid min-w-0 items-stretch gap-3 lg:grid-cols-3"
      >
        <RecentActivity
          liveEnabled={liveEnabled}
          loading={liveEnabled && achievements.loading}
          items={recentUnlocks}
          locale={i18n.language}
          achievementsTo={achievementsTo}
        />
        <AdviceCard anatomyTo={anatomyTo} />
        <HorizonCard message={horizonMessage} />
      </div>
    </div>
  );
}

function AnatomyColumn({ anatomyTo }: { anatomyTo: string }) {
  const { t } = useTranslation("recovery");
  return (
    <div
      className="pointer-events-none absolute right-0 top-0 z-0 hidden h-[27rem] w-[min(28rem,34%)] lg:block"
    >
      <HeroFilaments className="pointer-events-none absolute bottom-0 left-0 top-0 -right-6 z-0 opacity-70" />
      <HeroFigure
        layout="home"
        fadeEdges={false}
        className="absolute inset-0 z-[1] h-full w-full bg-transparent"
      />
      <Link
        to={anatomyTo}
        className={`${atlasButton} pointer-events-auto absolute bottom-[14%] left-[58%] z-[2] w-max whitespace-nowrap`}
      >
        {t("homeAnatomyTitle")}
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function HomeLead({
  demo,
  message,
  tracked,
  unlockedCount,
  progression,
}: {
  demo: boolean;
  message: string | null;
  tracked: number;
  unlockedCount: number | null;
  progression: ReturnType<typeof useProgress>;
}) {
  return (
    <>
      <HomeHeader demo={demo} message={message} />
      <ExplorerSummary
        tracked={tracked}
        unlockedCount={unlockedCount}
        progression={progression}
      />
    </>
  );
}

function HomeHeader({ demo, message }: { demo: boolean; message: string | null }) {
  const { t } = useTranslation("recovery");
  return (
    <div className="flex h-full min-w-0 flex-col">
      <header>
        <div className="flex items-start justify-between gap-3">
          <h1
            className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
            style={{ color: "rgb(var(--soma-shell-accent))" }}
          >
            {t("homeTitleLead")}
          </h1>
          {demo ? <DemoNotice /> : null}
        </div>
        <p className="mt-1 text-sm text-soma-ink-secondary">{t("homeSubtitle")}</p>
      </header>
      {message ? (
        <figure className="mt-3 flex items-center gap-3 rounded-2xl border border-soma-line-strong bg-soma-surface/80 px-4 py-4">
          <span aria-hidden="true" className="font-serif text-5xl leading-none" style={accentColor}>
            “
          </span>
          <blockquote className="pt-2 text-sm leading-relaxed text-soma-ink">{message}</blockquote>
        </figure>
      ) : null}
    </div>
  );
}

function ExplorerSummary({
  tracked,
  unlockedCount,
  progression,
}: {
  tracked: number;
  unlockedCount: number | null;
  progression: ReturnType<typeof useProgress>;
}) {
  const { t } = useTranslation("recovery");
  return (
    <section className={`${panelClass} h-full`}>
      <div className="grid h-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-[auto_minmax(0,1fr)_11.25rem] lg:items-center lg:gap-3">
        <HomeProgressIdentity
          live={progression.live}
          state={progression.state}
          progress={progression.progress}
          updatingTitle={progression.updatingTitle}
          reload={progression.reload}
        />
        <ul className="flex min-w-0 flex-col gap-2.5 border-t border-soma-line-strong pt-3 lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0">
          <ExplorerStat icon={Route} label={t("homeExplorerTracked")} value={String(tracked)} />
          <ExplorerStat
            icon={Award}
            label={t("homeExplorerMedals")}
            value={unlockedCount == null ? t("homeExplorerMedalsNone") : String(unlockedCount)}
          />
        </ul>
      </div>
    </section>
  );
}

function ExplorerStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Award;
  label: string;
  value: string;
}) {
  return (
    <li className="flex min-w-0 items-center gap-2">
      <Icon className="h-8 w-8 shrink-0 rounded-full border border-soma-reward/40 p-1.5 text-soma-reward" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-[11px] leading-tight text-soma-ink-muted">{label}</span>
        <span className="mt-0.5 block text-sm font-semibold leading-snug text-soma-ink">{value}</span>
      </span>
    </li>
  );
}

function SubstanceRow({
  substances,
  temporalById,
  recoveryTo,
  basePath,
}: {
  substances: readonly DemoSubstance[];
  temporalById: ReadonlyMap<string, TemporalMilestoneState>;
  recoveryTo: string;
  basePath: ShellBase;
}) {
  const { t } = useTranslation("recovery");
  return (
    <div
      className="pointer-events-none relative z-10 lg:pr-[calc(min(28rem,34%)+0.75rem)]"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-soma-ink">{t("homeRecoveryTitle")}</h2>
        <Link to={recoveryTo} className={`${textLink} pointer-events-auto`}>
          {t("homeSubstancesLink")}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <ul className="pointer-events-auto grid grid-cols-[repeat(auto-fit,minmax(min(100%,13.5rem),1fr))] gap-3">
        {substances.map((substance) => (
          <li key={substance.id} className="min-w-0">
              <HomeSubstanceCard
                substance={substance}
                temporal={temporalById.get(substance.id)}
                to={recoveryHref(basePath, substance.id)}
              />
            </li>
          ))}
      </ul>
    </div>
  );
}

function TemporalEmpty({ achievementsTo }: { achievementsTo: string }) {
  const { t } = useTranslation("recovery");
  return (
    <SectionFrame title={t("homeNextMedal")}>
      <p className="text-sm leading-relaxed text-soma-ink-secondary">{t("homeNextMedalEmpty")}</p>
      <Link to={achievementsTo} className={`${textLink} mt-auto pt-3`}>
        {t("homeNextMedalSee")}
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </SectionFrame>
  );
}

function RecommendedExploration({
  nextMilestone,
  nextSubstanceName,
  recoveryTo,
  anatomyTo,
}: {
  nextMilestone: AchievementWithUnlockState | null;
  nextSubstanceName: string | null;
  recoveryTo: string;
  anatomyTo: string;
}) {
  const { t } = useTranslation(["recovery", "achievements"]);
  const to = nextMilestone ? recoveryTo : anatomyTo;
  return (
    <SectionFrame title={t("recovery:homeExploreTitle")}>
      <div className="flex flex-1 flex-col items-center text-center">
        <img
          src="/images/anatomy/brain.png"
          alt=""
          width={128}
          height={128}
          decoding="async"
          draggable={false}
          className="h-16 w-16 object-contain"
        />
        {nextMilestone ? (
          <div className="mt-3 min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-soma-shell-accent">
              {t("recovery:homeDiscoveryTitle")}
            </p>
            <p className="mt-1 text-sm font-semibold leading-snug text-soma-ink">
              {t(`achievements:${nextMilestone.titleKey}`)}
            </p>
            {nextSubstanceName ? (
              <p className="mt-0.5 text-xs text-soma-ink-secondary">{nextSubstanceName}</p>
            ) : null}
            <p className="mt-1 text-xs leading-relaxed text-soma-ink-muted">
              {t("recovery:homeDiscoveryHint")}
            </p>
          </div>
        ) : (
          <div className="mt-3 min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-soma-shell-accent">
              {t("recovery:homeAdviceEyebrow")}
            </p>
            <p className="mt-1 text-sm font-semibold text-soma-ink">{t("recovery:homeAnatomyTitle")}</p>
            <p className="mt-1 text-xs leading-relaxed text-soma-ink-secondary">
              {t("recovery:homeExploreFallback")}
            </p>
          </div>
        )}
      </div>
      <Link to={to} className={`${textLink} mt-auto self-center pt-3`}>
        {nextMilestone ? t("recovery:homeDiscoveryCta") : t("recovery:homeAnatomyTitle")}
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </SectionFrame>
  );
}

function RecentAchievements({
  liveEnabled,
  loading,
  error,
  onRetry,
  items,
  locale,
  achievementsTo,
}: {
  liveEnabled: boolean;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  items: readonly AchievementWithUnlockState[];
  locale: string;
  achievementsTo: string;
}) {
  const { t } = useTranslation(["recovery", "achievements", "substances"]);
  return (
    <SectionFrame
      title={t("recovery:homeRecentTitle")}
      action={
        <Link to={achievementsTo} className={textLink}>
          {t("recovery:homeRecentSee")}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      }
    >
      {loading ? (
        <p className="mt-3 text-sm text-soma-ink-secondary">{t("recovery:homeRecentLoading")}</p>
      ) : error ? (
        <div className="mt-3">
          <p className="text-sm text-soma-ink-secondary">{t("recovery:homeRecentError")}</p>
          <button
            type="button"
            onClick={onRetry}
            className={`${previewFocus} mt-2 text-sm text-soma-shell-accent hover:text-soma-action`}
          >
            {t("recovery:retry")}
          </button>
        </div>
      ) : items.length > 0 ? (
        <ul className="mt-3 grid flex-1 grid-cols-2 content-center gap-2 sm:grid-cols-4">
          {items.map((item) => {
            const unlocked = formatDisplayDate(item.unlockedAt, locale);
            return (
              <li
                key={item.id}
                className="min-w-0 rounded-xl border border-soma-line/50 bg-soma-canvas/45 px-1.5 py-2 text-center"
              >
                <span className="mx-auto block w-16">
                  <AchievementMedal
                    substanceId={item.triggerSubstanceId}
                    tier={item.tier}
                    family={item.family === "temporal" ? "temporal" : "curve"}
                    locked={false}
                    size="compact"
                    showTierLabel={false}
                  />
                </span>
                <p className="mt-1.5 line-clamp-3 text-xs font-medium leading-snug text-soma-ink">
                  {t(`achievements:${item.titleKey}`)}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-soma-ink-muted">
                  {unlocked ?? t("recovery:homeRecentUndated")}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="flex flex-1 items-center text-sm leading-relaxed text-soma-ink-secondary">
          {liveEnabled ? t("recovery:homeRecentEmptyLive") : t("recovery:homeRecentEmptyDemo")}
        </p>
      )}
    </SectionFrame>
  );
}

function RecentActivity({
  liveEnabled,
  loading,
  items,
  locale,
  achievementsTo,
}: {
  liveEnabled: boolean;
  loading: boolean;
  items: readonly AchievementWithUnlockState[];
  locale: string;
  achievementsTo: string;
}) {
  const { t } = useTranslation(["recovery", "achievements"]);
  return (
    <SectionFrame
      title={t("recovery:homeActivityTitle")}
      action={
        <Link to={achievementsTo} className={textLink}>
          {t("recovery:homeActivitySee")}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      }
    >
      {loading ? (
        <p className="mt-3 text-sm text-soma-ink-secondary">{t("recovery:homeRecentLoading")}</p>
      ) : items.length > 0 ? (
        <ul className="mt-1 flex flex-col divide-y divide-soma-line">
          {items.map((item) => (
            <li key={item.id} className="flex min-w-0 items-center gap-2 py-2.5">
              <span className="w-10 shrink-0">
                <AchievementMedal
                  substanceId={item.triggerSubstanceId}
                  tier={item.tier}
                  family={item.family === "temporal" ? "temporal" : "curve"}
                  locked={false}
                  size="compact"
                  showTierLabel={false}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] text-soma-ink-muted">
                  {t("recovery:homeActivityUnlock")}
                </span>
                <span className="block truncate text-sm text-soma-ink">
                  {t(`achievements:${item.titleKey}`)}
                </span>
              </span>
              <time className="shrink-0 text-[11px] tabular-nums text-soma-ink-muted">
                {formatDisplayDate(item.unlockedAt, locale) ?? t("recovery:homeRecentUndated")}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-relaxed text-soma-ink-secondary">
          {liveEnabled ? t("recovery:homeActivityEmptyLive") : t("recovery:homeActivityEmptyDemo")}
        </p>
      )}
    </SectionFrame>
  );
}

function AdviceCard({ anatomyTo }: { anatomyTo: string }) {
  const { t } = useTranslation("recovery");
  return (
    <SectionFrame title={t("homeAdviceTitle")}>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
        <img
          src="/images/anatomy/brain.png"
          alt=""
          width={96}
          height={96}
          decoding="async"
          draggable={false}
          className="h-14 w-14 object-contain"
        />
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em]" style={accentColor}>
          {t("homeAdviceEyebrow")}
        </p>
        <p className="mt-1 text-sm font-semibold text-soma-ink">{t("homeAnatomyTitle")}</p>
        <p className="mt-1 text-xs leading-relaxed text-soma-ink-secondary">{t("homeAnatomyBody")}</p>
      </div>
      <Link to={anatomyTo} className={`${textLink} mt-auto self-center pt-3`}>
        {t("homeAdviceRead")}
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </SectionFrame>
  );
}

function HorizonCard({ message }: { message: string | null }) {
  const { t } = useTranslation("recovery");
  return (
    <section className="relative flex h-full min-h-[11rem] overflow-hidden rounded-2xl border border-soma-line-strong">
      <img
        src="/images/decoration/nature-1.png"
        alt=""
        width={1024}
        height={576}
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-[72%_center]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--soma-shell-rail)_/_0.82)_0%,rgb(var(--soma-shell-rail)_/_0.28)_58%,transparent_100%)]"
      />
      <div className="relative z-10 flex max-w-[16rem] flex-col items-start px-4 pt-4">
        <span aria-hidden="true" className="font-serif text-5xl leading-none" style={accentColor}>
          “
        </span>
        <p className="text-sm font-medium leading-relaxed text-soma-ink">{message ?? t("homeQuote")}</p>
        <span className="mt-3 h-0.5 w-10 rounded-full" style={temporalFillColor} />
      </div>
    </section>
  );
}

function HomeSubstanceCard({
  substance,
  temporal,
  to,
}: {
  substance: DemoSubstance;
  temporal: TemporalMilestoneState | undefined;
  to: string;
}) {
  const { t } = useTranslation(["recovery", "achievements"]);
  const next = temporal?.status === "upcoming" ? temporal.next : null;
  const fill = next ? temporalBarFill(remainingProgressPercent(next.progress)) : null;

  return (
    <Link
      to={to}
      className={`${previewFocus} flex min-w-0 flex-col rounded-2xl border border-soma-line-strong bg-soma-canvas/50 px-3 py-3 text-left hover:bg-soma-raised/50`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-soma-canvas text-soma-shell-accent">
          <SubstanceIllustration name={substance.id} iconClassName="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-soma-ink">{substance.name}</span>
          <span className="mt-0.5 block text-xl font-semibold tabular-nums tracking-tight text-soma-ink">
            {substance.abstinence}
          </span>
        </span>
      </span>
      {fill ? (
        <span
          className="relative mt-2 block h-2 w-full overflow-hidden rounded-full bg-soma-line"
          aria-hidden="true"
        >
          <span
            data-temporal-progress={fill}
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: fill, ...temporalFillColor }}
          />
        </span>
      ) : null}
      {next ? (
        <span className="mt-3 flex w-full min-w-0 items-center gap-2 text-left">
          <span className="w-12 shrink-0">
            <AchievementMedal
              substanceId={substance.id}
              tier={next.tier}
              family="temporal"
              locked
              size="compact"
              showTierLabel={false}
            />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] text-soma-ink-muted">{t("recovery:homeNextMilestone")}</span>
            <span className="block text-base font-semibold tabular-nums text-soma-ink">
              {t("recovery:homeNextMedalThreshold", { count: next.thresholdDays })}
            </span>
            <span className="block truncate text-xs text-soma-ink-secondary">
              {t(`achievements:${next.titleKey}`)}
            </span>
          </span>
        </span>
      ) : temporal?.status === "complete" ? (
        <span className="mt-2 text-[11px] leading-snug text-soma-ink-muted">
          {t("recovery:recoveryNextMedalComplete")}
        </span>
      ) : null}
    </Link>
  );
}
