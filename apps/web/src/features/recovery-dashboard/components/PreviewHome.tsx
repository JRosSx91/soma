import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
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
  pickFeaturedUnlockedAchievement,
  pickNextLockedAchievement,
  quantifiableAchievementProgress,
} from "../dashboard/home-progress.js";
import { recoveryHref } from "../dashboard/recovery-query.js";
import { AchievementMedal } from "./AchievementMedal.js";
import { DemoNotice } from "./DemoNotice.js";
import { HeroFigure } from "./HeroFigure.js";
import { HeroFilaments } from "./HeroFilaments.js";
import { SubstanceIllustration } from "./SubstanceIllustration.js";

const primaryCta = `${previewFocus} inline-flex min-h-11 items-center justify-center rounded-xl bg-soma-action px-4 py-2.5 text-sm font-semibold text-[#081018] hover:bg-soma-action-hover`;
const textLink = `${previewFocus} inline-flex min-h-11 items-center gap-1 text-sm text-soma-action hover:text-soma-action-hover`;

export function PreviewHome() {
  const { t, i18n } = useTranslation(["recovery", "achievements", "substances"]);
  const { user } = useAuth();
  const base = useShellBase();
  const dashboard = usePreviewDashboard(null);
  const live = dashboard.mode === "live";
  /** Live unlock state only under /app — /preview stays without account medals. */
  const liveEnabled = Boolean(user) && base === "/app";
  const achievements = useLiveAchievements(liveEnabled ? (user?.id ?? null) : null);

  const trackedIds = dashboard.substances.map((item) => item.id);
  const nextMilestone = useMemo(
    () => pickNextLockedAchievement(achievements.rows, trackedIds),
    [achievements.rows, trackedIds],
  );
  const nextProgress = nextMilestone
    ? quantifiableAchievementProgress({
        unlocked: nextMilestone.unlocked,
        hidden: nextMilestone.hidden,
        progressAvailability: nextMilestone.progressAvailability,
        achievementProgress: nextMilestone.achievementProgress,
        threshold: nextMilestone.triggerRecoveryThreshold,
      })
    : null;
  const featured = useMemo(
    () => pickFeaturedUnlockedAchievement(achievements.rows),
    [achievements.rows],
  );
  const nextSubstance =
    dashboard.substances.find((item) => item.id === nextMilestone?.triggerSubstanceId) ?? null;
  const featuredDate = formatDisplayDate(featured?.unlockedAt, i18n.language);
  const single = dashboard.substances.length === 1;
  const recoveryTo = recoveryHref(base);
  const anatomyTo = `${base}/anatomy`;
  const achievementsTo = `${base}/achievements`;
  const dailyMessage = pickDailyMessage(
    readDailyMessages(t("recovery:homeDailyMessages", { returnObjects: true })),
  );

  if (dashboard.loading) {
    return (
      <div className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-10 text-sm text-soma-ink-secondary">
        {t("recovery:loading")}
      </div>
    );
  }

  if (dashboard.error) {
    return (
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
    );
  }

  if (live && dashboard.emptyUsages) {
    return (
      <div className="flex flex-col gap-4 pb-6">
        <HomeStage demo={false} message={dailyMessage}>
          <p className="rounded-2xl border border-dashed border-soma-line px-4 py-5 text-sm text-soma-ink-secondary">
            {t("recovery:homeEmptyBody")}
          </p>
          <Link to="/onboarding" className={textLink}>
            {t("recovery:goOnboarding")}
          </Link>
        </HomeStage>
      </div>
    );
  }

  if (dashboard.substances.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-col gap-4 pb-6 lg:gap-5">
      <HomeStage demo={dashboard.showDemoBadge} message={dailyMessage}>
      <section className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-5 sm:px-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-soma-action">
          {t("recovery:homeProgressTitle")}
        </p>
        {single ? (
          <p className="mt-3 text-4xl font-semibold tabular-nums tracking-tight text-soma-ink sm:text-5xl">
            {dashboard.substances[0]?.abstinence}
          </p>
        ) : (
          <ul className={homeCounterGridClass(dashboard.substances.length)}>
            {dashboard.substances.map((substance) => (
              <li
                key={substance.id}
                className="min-w-0 rounded-xl border border-soma-line bg-soma-canvas/40 px-3 py-2"
              >
                <p className="truncate text-xs text-soma-ink-secondary">{substance.name}</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums text-soma-ink">
                  {substance.abstinence}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 border-t border-soma-line pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-soma-ink-muted">
            {t("recovery:homeNextMilestone")}
          </p>
          {nextMilestone && nextProgress ? (
            <div className="mt-2">
              <p className="text-base font-semibold text-soma-ink">
                {t(`achievements:${nextMilestone.titleKey}`)}
              </p>
              {nextSubstance ? (
                <p className="mt-0.5 text-xs text-soma-ink-secondary">{nextSubstance.name}</p>
              ) : null}
              <p className="mt-2 text-sm tabular-nums text-soma-ink">
                {t("recovery:homeNextMilestoneProgress", {
                  percent: nextProgress.towardPercent,
                })}
              </p>
              <span
                className="mt-2 block h-1.5 overflow-hidden rounded-full bg-soma-line"
                aria-hidden="true"
              >
                <span
                  className="block h-full rounded-full bg-soma-action"
                  style={{ width: `${nextProgress.towardPercent}%` }}
                />
              </span>
              <p className="mt-2 text-xs leading-relaxed text-soma-ink-muted">
                {t("recovery:homeNextMilestoneHint")}
              </p>
            </div>
          ) : (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-soma-ink-secondary">{t("recovery:homeNextMilestoneEmpty")}</p>
              <Link to={achievementsTo} className={textLink}>
                {t("recovery:homeNextMilestoneSee")}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </section>
      </HomeStage>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-base font-semibold text-soma-ink">{t("recovery:homeSubstancesTitle")}</h2>
          <Link to={recoveryTo} className={textLink}>
            {t("recovery:homeSubstancesLink")}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-3 grid min-w-0 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {dashboard.substances.map((substance) => (
            <li key={substance.id} className="min-w-0">
              <HomeSubstanceCard
                substance={substance}
                since={formatDisplayDate(substance.lastUseDate, i18n.language)}
                to={recoveryHref(base, substance.id)}
              />
            </li>
          ))}
        </ul>
      </section>

      <div className="relative z-10 grid min-w-0 gap-4 lg:grid-cols-2">
        <FeaturedAchievementCard
          featured={featured}
          featuredDate={featuredDate}
          achievementsTo={achievementsTo}
        />
        <section className="flex min-w-0 flex-col rounded-2xl border border-soma-line bg-soma-surface p-4 sm:p-5">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <img
              src="/images/anatomy/body-master-anterior.png"
              alt=""
              width={640}
              height={960}
              decoding="async"
              draggable={false}
              className="h-28 w-auto shrink-0 object-contain sm:h-36"
            />
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-soma-ink">{t("recovery:homeAnatomyTitle")}</h2>
              <p className="mt-1 text-sm leading-relaxed text-soma-ink-secondary">
                {t("recovery:homeAnatomyBody")}
              </p>
            </div>
          </div>
          <Link to={anatomyTo} className={`${primaryCta} mt-4 w-full sm:w-auto`}>
            {t("recovery:homeAnatomyCta")}
          </Link>
        </section>
      </div>

      <section className="relative z-10 rounded-2xl border border-soma-line bg-soma-surface p-4 sm:p-5">
        <h2 className="text-base font-semibold text-soma-ink">{t("recovery:homeRecoveryTitle")}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-soma-ink-secondary">
          {t("recovery:homeRecoveryBody")}
        </p>
        <Link to={recoveryTo} className={`${primaryCta} mt-4`}>
          {t("recovery:homeRecoveryCta")}
        </Link>
      </section>
    </div>
  );
}

function HomeStage({
  demo,
  message,
  children,
}: {
  demo: boolean;
  message: string | null;
  children: ReactNode;
}) {
  return (
    <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(14rem,2fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        <HomeHeader demo={demo} message={message} />
        <div
          aria-hidden="true"
          className="relative isolate h-[min(26rem,calc(100dvh-14rem))] min-h-[min(16rem,calc(100dvh-14rem))] w-full min-w-0 overflow-hidden lg:hidden"
        >
          <HeroFigure className="absolute inset-0 z-[1]" fadeBottom />
        </div>
        {children}
      </div>
      <div className="relative hidden min-h-[20rem] overflow-hidden lg:block">
        <HeroFilaments className="absolute inset-0 z-0 [mask-image:linear-gradient(90deg,black_0%,black_48%,transparent_90%),linear-gradient(to_bottom,black_70%,transparent)] [mask-composite:intersect] [-webkit-mask-image:linear-gradient(90deg,black_0%,black_48%,transparent_90%),linear-gradient(to_bottom,black_70%,transparent)] [-webkit-mask-composite:source-in]" />
        <HeroFigure className="absolute inset-0 z-[1]" fadeBottom />
      </div>
    </div>
  );
}

function HomeHeader({ demo, message }: { demo: boolean; message: string | null }) {
  const { t } = useTranslation("recovery");
  return (
    <header className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-soma-ink sm:text-4xl">
          {t("homeTitleLead")}
        </h1>
        {demo ? <DemoNotice /> : null}
      </div>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-soma-ink-secondary">{t("homeSubtitle")}</p>
      {message ? (
        <figure className="mt-4 max-w-md rounded-2xl border border-soma-line bg-soma-surface/90 px-4 py-3">
          <figcaption className="text-[11px] font-medium uppercase tracking-[0.18em] text-soma-action">
            {t("homeDailyTitle")}
          </figcaption>
          <blockquote className="mt-2 text-sm leading-relaxed text-soma-ink">{message}</blockquote>
        </figure>
      ) : null}
    </header>
  );
}

function HomeSubstanceCard({
  substance,
  since,
  to,
}: {
  substance: DemoSubstance;
  since: string | null;
  to: string;
}) {
  const { t } = useTranslation("recovery");
  return (
    <Link
      to={to}
      className={`${previewFocus} flex h-full min-w-0 items-center gap-3 rounded-2xl border border-soma-line bg-soma-surface/90 px-3 py-3 hover:border-soma-line-strong hover:bg-soma-raised/60`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soma-canvas p-0.5 text-soma-action">
        <SubstanceIllustration name={substance.id} iconClassName="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-soma-ink">{substance.name}</span>
        {since ? (
          <span className="mt-0.5 block truncate text-xs text-soma-ink-muted">
            {t("homeSinceDate", { date: since })}
          </span>
        ) : null}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-soma-ink-muted" aria-hidden="true" />
    </Link>
  );
}

function FeaturedAchievementCard({
  featured,
  featuredDate,
  achievementsTo,
}: {
  featured: AchievementWithUnlockState | null;
  featuredDate: string | null;
  achievementsTo: string;
}) {
  const { t } = useTranslation(["recovery", "achievements", "substances"]);
  return (
    <section className="flex min-w-0 flex-col rounded-2xl border border-soma-line bg-soma-surface p-4 sm:p-5">
      <h2 className="text-base font-semibold text-soma-ink">{t("recovery:homeFeaturedTitle")}</h2>
      {featured ? (
        <div className="mt-3 flex min-w-0 flex-1 items-center gap-4">
          <span className="w-28 shrink-0 sm:w-32">
            <AchievementMedal
              substanceId={featured.triggerSubstanceId}
              tier={featured.tier}
              locked={false}
            />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold leading-snug text-soma-ink">
              {t(`achievements:${featured.titleKey}`)}
            </p>
            <p className="mt-1 text-sm text-soma-ink-secondary">
              {t(`substances:${featured.triggerSubstanceId}.name`, {
                defaultValue: featured.triggerSubstanceId,
              })}
            </p>
            <p className="mt-2 inline-flex rounded-xl border border-soma-line bg-soma-canvas/50 px-3 py-1.5 text-xs text-soma-ink-secondary">
              {featuredDate
                ? t("recovery:homeFeaturedUnlocked", { date: featuredDate })
                : t("recovery:homeFeaturedUnlockedUndated")}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-3 flex-1 text-sm text-soma-ink-secondary">{t("recovery:homeFeaturedEmpty")}</p>
      )}
      <Link to={achievementsTo} className={`${textLink} mt-4`}>
        {t("recovery:homeFeaturedSee")}
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

function homeCounterGridClass(count: number): string {
  if (count <= 2) {
    return "mt-3 grid min-w-0 grid-cols-2 gap-2";
  }
  if (count === 3) {
    return "mt-3 grid min-w-0 grid-cols-2 gap-2 lg:grid-cols-3";
  }
  return "mt-3 grid min-w-0 grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4";
}
