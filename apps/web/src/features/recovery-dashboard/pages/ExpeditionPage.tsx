import { useLayoutEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Award,
  BookOpen,
  ChevronRight,
  Compass,
  Mountain,
} from "lucide-react";
import type { MissionCatalogItem } from "@soma/shared-types";
import { useAuth } from "../../auth/index.js";
import { useProgress } from "../../progress/index.js";
import { useMissions } from "../../missions/useMissions.js";
import {
  missionArtNeedsFrame,
  missionCopyPath,
  missionIllustrationSrc,
  pickFeaturedMissions,
} from "../../missions/missions-view.js";
import { SpecialCategoryConsentCard } from "../../profile/components/SpecialCategoryConsentCard.js";
import { achievementCatalog } from "../achievement-catalog.generated.js";
import { countProgressStats, type LiveRow } from "../dashboard/achievements-view.js";
import { useLiveAchievements } from "../hooks/useLiveAchievements.js";
import { usePreviewDashboard } from "../hooks/usePreviewDashboard.js";
import { useTemporalMilestones } from "../hooks/useTemporalMilestones.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import { previewFocus } from "../focus.js";
import { EduPlateImg } from "../components/EduPlateImg.js";
import { RecoveryHero } from "../components/RecoveryHero.js";
import { SegmentedControl } from "../components/SegmentedControl.js";
import { ExpeditionMap } from "../expedition/ExpeditionMap.js";
import {
  STAGE_EMBLEM_PX,
  STAGE_EMBLEM_SIZES,
  nodeMark,
} from "../expedition/expedition-marks.js";
import {
  buildExpeditionBoard,
  formatRatio,
  isExpeditionRouteId,
  type ExpeditionGoal,
  type ExpeditionNode,
  type ExpeditionNodeId,
  type ExpeditionRouteId,
  type ExpeditionStat,
} from "../expedition/expedition-model.js";

const HERO_IMAGE = "/images/decoration/nature-10.png";
const HERO_IMAGE_CLASS =
  "object-[62%_42%] motion-reduce:transition-none";
const HERO_OVERLAY =
  "linear-gradient(90deg, rgb(var(--soma-shell-rail) / 0.78) 0%, rgb(var(--soma-shell-rail) / 0.38) 36%, rgb(var(--soma-shell-rail) / 0.12) 62%, transparent 82%), linear-gradient(180deg, rgb(var(--soma-shell-rail) / 0.28) 0%, transparent 58%)";
const panelClass =
  "min-w-0 rounded-2xl border border-soma-line bg-soma-surface/90 p-4 sm:p-5";
const accentColor = { color: "rgb(var(--soma-shell-accent))" };
const FEATURED_LIMIT = 3;

function nodeCopyKey(id: ExpeditionNodeId): string | null {
  if (id === "neurotransmitters") return "nodeNeurotransmitters";
  if (id === "orientation") return "nodeOrientation";
  if (id === "substances") return "nodeSubstances";
  if (id === "processes") return "nodeProcesses";
  if (id === "recovery") return "nodeRecovery";
  return null;
}

export function ExpeditionPage() {
  const { t } = useTranslation([
    "expedition",
    "missions",
    "progress",
    "recovery",
    "substances",
  ]);
  const base = useShellBase();
  const { user, loading: authLoading } = useAuth();
  const demo = base === "/preview";
  const live = base === "/app" && Boolean(user);
  const dashboard = usePreviewDashboard(null);
  const progression = useProgress({
    live,
    userId: live ? (user?.id ?? null) : null,
  });
  const catalog = useMissions({
    live,
    userId: live ? (user?.id ?? null) : null,
  });
  const liveEnabled = Boolean(user) && base === "/app";
  const achievements = useLiveAchievements(liveEnabled ? (user?.id ?? null) : null);
  const temporal = useTemporalMilestones(dashboard.substances, {
    enabled: !dashboard.loading && !dashboard.error && dashboard.substances.length > 0,
    syncUnlocks: liveEnabled,
  });
  const [route, setRoute] = useState<ExpeditionRouteId>("knowledge");
  const [selectedId, setSelectedId] = useState<ExpeditionNodeId>("neurotransmitters");
  const [mapRevealKey, setMapRevealKey] = useState(0);

  const liveById = useMemo(() => {
    const map = new Map<string, LiveRow>();
    for (const row of achievements.rows ?? []) map.set(row.id, row);
    return map;
  }, [achievements.rows]);
  const temporalBySubstance = useMemo(
    () => new Map(temporal.states.map((state) => [state.substanceId, state])),
    [temporal.states],
  );
  const showingLiveMedals = liveEnabled && achievements.rows !== null;
  const medalStats = showingLiveMedals
    ? countProgressStats(
        achievementCatalog,
        liveById,
        temporalBySubstance,
        true,
      )
    : null;

  const board = useMemo(
    () =>
      buildExpeditionBoard({
        base,
        route,
        missions: catalog.missions,
        progress: progression.progress,
        substanceIds: dashboard.substances.map((item) => item.id),
        temporalStates: temporal.states,
        unlockedMedals: medalStats?.unlocked ?? null,
        reachableMedals: medalStats?.collectionTotal ?? null,
      }),
    [
      base,
      route,
      catalog.missions,
      progression.progress,
      dashboard.substances,
      temporal.states,
      medalStats,
    ],
  );

  useLayoutEffect(() => {
    if (!board.nodes.some((node) => node.id === selectedId)) {
      setSelectedId(board.recommendedNodeId);
    }
  }, [board.nodes, board.recommendedNodeId, selectedId]);

  const selected =
    board.nodes.find((node) => node.id === selectedId) ?? board.nodes[0] ?? null;
  const featured = useMemo(
    () => pickFeaturedMissions(catalog.missions ?? [], FEATURED_LIMIT),
    [catalog.missions],
  );

  const loading =
    (base === "/app" && authLoading) ||
    dashboard.loading ||
    catalog.state === "loading" ||
    (live && progression.state === "loading" && !progression.progress);
  const loadFailed =
    dashboard.error != null ||
    catalog.state === "error" ||
    (live && progression.state === "error");

  function reloadAll() {
    dashboard.reload();
    catalog.reload();
    progression.reload();
    if (liveEnabled) achievements.reload();
  }

  function handleRoute(next: string) {
    if (!isExpeditionRouteId(next)) return;
    setRoute(next);
    setMapRevealKey((key) => key + 1);
  }

  function handleSelect(id: ExpeditionNodeId) {
    setSelectedId(id);
    setMapRevealKey((key) => key + 1);
  }

  function focusRecommended() {
    setSelectedId(board.recommendedNodeId);
    setMapRevealKey((key) => key + 1);
    document.getElementById("expedition-map")?.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  return (
    <div className="flex min-w-0 flex-col gap-5 pb-8">
      <RecoveryHero
        eyebrow={t("expedition:pageEyebrow")}
        title={t("expedition:pageTitle")}
        description={t("expedition:pageDescription")}
        quote={t("expedition:pageQuote")}
        demo={demo}
        imageSrc={HERO_IMAGE}
        imageClassName={HERO_IMAGE_CLASS}
        overlay={HERO_OVERLAY}
        compactPanorama
        fetchPriority="high"
        imageWidth={2172}
        imageHeight={724}
      >
        {!loading && !loadFailed ? (
          <div className="pt-4 lg:pt-6">
            <IndicatorStrip stats={board.stats} demo={demo} />
          </div>
        ) : null}
      </RecoveryHero>

      {loading ? (
        <p className={`${panelClass} text-sm text-soma-ink-secondary`}>
          {t("expedition:loading")}
        </p>
      ) : null}

      {loadFailed ? (
        <div className={panelClass}>
          <p className="text-sm text-soma-ink-secondary">{t("expedition:loadError")}</p>
          <button
            type="button"
            onClick={reloadAll}
            className={`${previewFocus} mt-3 min-h-11 rounded-full bg-soma-action px-4 text-sm font-semibold text-[#081018]`}
          >
            {t("expedition:retry")}
          </button>
        </div>
      ) : null}

      {!loading && !loadFailed ? (
        <>
          {dashboard.needsSpecialCategoryConsent ? (
            <SpecialCategoryConsentCard onGranted={() => dashboard.reload()} />
          ) : null}

          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <SegmentedControl
              label={t("expedition:routeLabel")}
              value={route}
              options={[
                { id: "knowledge", label: t("expedition:knowledgeRoute") },
                { id: "perseverance", label: t("expedition:perseveranceRoute") },
              ]}
              onChange={handleRoute}
            />
            <button
              type="button"
              onClick={focusRecommended}
              className={`${previewFocus} inline-flex min-h-11 items-center justify-center rounded-full border border-soma-line bg-soma-surface px-4 text-sm font-semibold text-soma-ink`}
            >
              {t("expedition:seeMyRoute")}
            </button>
          </div>
          <p className="text-xs text-soma-ink-muted">
            {route === "knowledge"
              ? t("expedition:knowledgeRouteHint")
              : t("expedition:perseveranceRouteHint")}
          </p>
          <p className="text-xs text-soma-ink-secondary">{t("expedition:journeyIntro")}</p>

          <section id="expedition-map">
            <ExpeditionMap
              route={route}
              nodes={board.nodes}
              selectedId={selected?.id ?? "neurotransmitters"}
              revealKey={mapRevealKey}
              onSelect={handleSelect}
            />
            {selected ? <SelectedStage node={selected} /> : null}
          </section>

          <div className="grid min-w-0 items-stretch gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(16rem,22rem)]">
            <FeaturedMissions missions={featured} missionsTo={`${base}/missions`} />
            <NextGoalCard goal={board.goal} route={route} />
          </div>
        </>
      ) : null}
    </div>
  );
}

function IndicatorStrip({
  stats,
  demo,
}: {
  stats: readonly ExpeditionStat[];
  demo: boolean;
}) {
  const { t } = useTranslation(["expedition", "progress"]);
  const icons = {
    level: Compass,
    knowledge: BookOpen,
    perseverance: Mountain,
    medals: Award,
  } as const;

  return (
    <section className={`${panelClass} px-3 py-3 sm:px-4`} aria-label={t("expedition:statsRegion")}>
      <ul className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-3 xl:grid-cols-4 xl:divide-x xl:divide-soma-line">
        {stats.map((stat) => {
          const Icon = icons[stat.id];
          const ratio = formatRatio(stat.completed, stat.total);
          let value = ratio ? t("expedition:ratio", { completed: stat.completed, total: stat.total }) : "—";
          let hint: string | null = null;
          if (stat.id === "level") {
            if (stat.level == null) {
              value = "—";
            } else {
              value = t("expedition:levelLine", {
                level: stat.level,
                title: t(`progress:titles.${stat.titleId ?? "walker"}`),
              });
              hint =
                stat.xpIntoLevel != null && stat.xpForNextLevel != null
                  ? t("progress:xpProgress", {
                      into: stat.xpIntoLevel,
                      needed: stat.xpForNextLevel,
                    })
                  : null;
            }
          }
          if (stat.id === "medals" && ratio == null) {
            hint = t("expedition:statMedalsUnavailable");
          }
          const label =
            stat.id === "level"
              ? t("expedition:statLevel")
              : stat.id === "knowledge"
                ? t("expedition:statKnowledge")
                : stat.id === "perseverance"
                  ? t("expedition:statPerseverance")
                  : t("expedition:statMedals");
          return (
            <li
              key={stat.id}
              className="grid min-w-0 grid-rows-[2rem_1.25rem_2.5rem_0.25rem_1.35rem] items-start gap-1 xl:px-3 first:xl:pl-0 last:xl:pr-0"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-soma-line bg-soma-raised">
                <Icon className="h-3.5 w-3.5" style={accentColor} aria-hidden="true" />
              </span>
              <p className="truncate text-[11px] leading-tight text-soma-ink-muted">{label}</p>
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-soma-ink">{value}</p>
              <div className="h-1 overflow-hidden rounded-full bg-soma-raised" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-soma-action motion-reduce:transition-none"
                  style={{ width: `${stat.percent ?? 0}%` }}
                />
              </div>
              <p className="truncate text-[11px] leading-tight text-soma-ink-secondary">
                {hint ?? "\u00a0"}
              </p>
            </li>
          );
        })}
      </ul>
      {demo ? (
        <p className="mt-2 text-[11px] leading-snug text-soma-ink-muted" role="note">
          {t("expedition:demoNote")}
        </p>
      ) : null}
    </section>
  );
}

function SelectedStage({ node }: { node: ExpeditionNode }) {
  const { t } = useTranslation(["expedition", "substances", "missions"]);
  const copyKey = nodeCopyKey(node.id);
  const title = copyKey
    ? t(`expedition:${copyKey}`)
    : t(`substances:${node.substanceId ?? node.id}.name`, {
        defaultValue: node.id,
      });
  const description = copyKey
    ? t(`expedition:${copyKey}Desc`)
    : t(`substances:${node.substanceId ?? node.id}.shortDescription`, {
        defaultValue: "",
      });
  const statusKey =
    node.status === "complete"
        ? "statusComplete"
        : node.status === "in_progress"
          ? "statusInProgress"
          : node.status === "available"
            ? "statusAvailable"
            : node.status === "upcoming"
              ? "statusUpcoming"
              : node.status === "active_use"
                ? "statusActiveUse"
                : "statusWaiting";
  const ratio =
    node.completed != null && node.total != null
      ? t("expedition:ratio", { completed: node.completed, total: node.total })
      : null;
  const percent =
    node.completed != null && node.total != null && node.total > 0
      ? Math.round((node.completed * 100) / node.total)
      : null;
  const mark = nodeMark(node.id);
  const progressLabel =
    node.route === "perseverance"
      ? t("expedition:selectedTemporalProgress")
      : t("expedition:selectedCatalogProgress");

  return (
    <section
      className={`${panelClass} mt-3`}
      aria-labelledby="expedition-selected-heading"
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <span
          className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-soma-line bg-soma-raised"
          style={{ width: STAGE_EMBLEM_PX, height: STAGE_EMBLEM_PX }}
          aria-hidden="true"
        >
          {mark ? (
            <img
              src={mark.src}
              srcSet={mark.srcSet}
              sizes={STAGE_EMBLEM_SIZES}
              alt=""
              width={192}
              height={192}
              decoding="async"
              draggable={false}
              className="h-full w-full object-cover"
            />
          ) : (
            <Mountain className="h-6 w-6" style={accentColor} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em]" style={accentColor}>
            {t("expedition:selectedTitle")}
          </p>
          <h2 id="expedition-selected-heading" className="text-base font-semibold leading-tight text-soma-ink sm:text-lg">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 line-clamp-2 text-sm leading-snug text-soma-ink-secondary">
              {description}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-soma-ink">{t(`expedition:${statusKey}`)}</p>
          {node.status === "upcoming" ? (
            <p className="mt-1 text-sm text-soma-ink-muted">{t("expedition:emptyMissions")}</p>
          ) : null}
        </div>
        <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:w-44">
          {ratio ? (
            <div>
              <p className="text-[11px] text-soma-ink-muted">{progressLabel}</p>
              <p className="text-sm font-semibold tabular-nums text-soma-ink">{ratio}</p>
              {percent != null ? (
                <div
                  className="mt-1 h-1 overflow-hidden rounded-full bg-soma-raised"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent}
                  aria-label={progressLabel}
                >
                  <div
                    className="h-full rounded-full bg-soma-action motion-reduce:transition-none"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
          <Link
            to={node.href}
            className={`${previewFocus} inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-full bg-soma-action px-4 text-sm font-semibold text-[#081018]`}
          >
            {t("expedition:openStage")}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedMissions({
  missions,
  missionsTo,
}: {
  missions: readonly MissionCatalogItem[];
  missionsTo: string;
}) {
  const { t } = useTranslation(["expedition", "missions"]);
  return (
    <section className={panelClass} aria-labelledby="expedition-featured">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="expedition-featured" className="text-lg font-semibold text-soma-ink">
            {t("expedition:featuredTitle")}
          </h2>
          <p className="mt-1 text-sm text-soma-ink-secondary">{t("expedition:featuredSubtitle")}</p>
        </div>
        <Link
          to={missionsTo}
          className={`${previewFocus} shrink-0 text-sm text-soma-action hover:text-soma-action-hover`}
        >
          {t("expedition:seeAllMissions")}
        </Link>
      </div>
      {missions.length === 0 ? (
        <p className="mt-4 text-sm text-soma-ink-secondary">{t("expedition:featuredEmpty")}</p>
      ) : (
        <ul className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
          {missions.map((mission) => {
            const art = missionIllustrationSrc(mission.sheetId);
            const framed = missionArtNeedsFrame(mission.sheetId);
            return (
              <li key={mission.id} className="min-w-0">
                <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-soma-line bg-soma-raised/40">
                  <div className="relative flex h-28 w-full items-center justify-center overflow-hidden bg-[#101820]">
                    {art ? (
                      <EduPlateImg
                        src={art}
                        alt=""
                        width={framed ? 499 : 640}
                        height={framed ? 660 : 360}
                        sizes="(min-width: 640px) 12rem, 90vw"
                        className={`max-h-full ${framed ? "object-contain" : "h-full w-full object-cover"}`}
                      />
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em]" style={accentColor}>
                      {t(`missions:categories.${mission.categoryId}`)}
                    </p>
                    <h3 className="text-sm font-semibold leading-snug text-soma-ink">
                      {t(`missions:${missionCopyPath(mission.titleKey)}`)}
                    </h3>
                    <Link
                      to={missionsTo}
                      className={`${previewFocus} mt-auto inline-flex min-h-11 items-center justify-center gap-1 rounded-full bg-soma-action px-3 text-sm font-semibold text-[#081018]`}
                    >
                      {mission.state === "completed"
                        ? t("missions:openMission")
                        : t("missions:startMission")}
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function NextGoalCard({
  goal,
  route,
}: {
  goal: ExpeditionGoal;
  route: ExpeditionRouteId;
}) {
  const { t } = useTranslation(["expedition", "missions", "recovery", "substances"]);
  let body: string;
  let hint: string | null = t("expedition:nextGoalMissionsHint");
  let href: string | null = null;
  if (goal.kind === "mission_category") {
    body = t("expedition:nextGoalMissions", {
      remaining: goal.remaining,
      category: t(`missions:categories.${goal.categoryId}`),
    });
    href = goal.href;
  } else if (goal.kind === "temporal") {
    body = t("expedition:nextGoalTemporal", {
      substance: t(`substances:${goal.substanceId}.name`, {
        defaultValue: goal.substanceId,
      }),
      count: goal.thresholdDays,
    });
    hint = t("recovery:homeNextMedalHint");
    href = goal.href;
  } else if (goal.reason === "complete") {
    body = t("expedition:nextGoalEmptyComplete");
    hint = null;
  } else if (goal.reason === "waiting") {
    body = t("expedition:nextGoalEmptyWaiting");
    hint = null;
  } else if (goal.reason === "active_use") {
    body = t("expedition:nextGoalEmptyActive");
    hint = null;
  } else {
    body = t("expedition:nextGoalEmptyNone");
    hint = null;
  }

  return (
    <section className={panelClass} aria-labelledby="expedition-goal">
      <h2 id="expedition-goal" className="text-lg font-semibold text-soma-ink">
        {t("expedition:nextGoalTitle")}
      </h2>
      <p className="mt-3 text-sm font-medium text-soma-ink">{body}</p>
      {hint && route === "knowledge" ? (
        <p className="mt-2 text-sm text-soma-ink-secondary">{hint}</p>
      ) : null}
      {hint && route === "perseverance" && goal.kind === "temporal" ? (
        <p className="mt-2 text-sm text-soma-ink-secondary">{hint}</p>
      ) : null}
      {href ? (
        <Link
          to={href}
          className={`${previewFocus} mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-soma-action hover:text-soma-action-hover`}
        >
          {t("expedition:openStage")}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </section>
  );
}
