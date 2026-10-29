import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  CircleDot,
  Compass,
  FlaskConical,
  Map,
  Search,
  Waypoints,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  isMissionId,
  MISSION_CATEGORY_IDS,
  optionLabelKey,
  type MissionCatalogItem,
  type MissionCategoryId,
} from "@soma/shared-types";
import { useAuth } from "../../auth/index.js";
import {
  useMissions,
  type MissionAnswerRecord,
} from "../../missions/useMissions.js";
import {
  categoryProgress,
  countCompletedMissions,
  filterMissionCatalog,
  FUTURE_MISSION_CATEGORY_IDS,
  missionArtNeedsFrame,
  missionCopyPath,
  missionIllustrationSrc,
  pickFeaturedMissions,
  searchMissions,
  sortMissionCatalog,
  type MissionCatalogFilter,
  type MissionSortMode,
} from "../../missions/missions-view.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import { previewFocus } from "../focus.js";
import { DetailSheet } from "../components/DetailSheet.js";
import { RecoveryHero } from "../components/RecoveryHero.js";
import { SegmentedControl } from "../components/SegmentedControl.js";
import { exploreEduHref } from "../explore/explore-edu-query.js";

const MISSIONS_HERO_IMAGE = "/images/decoration/nature-7.png";
const MISSIONS_HERO_IMAGE_CLASS =
  "object-[16%_40%] sm:object-[center_42%] motion-reduce:transition-none";
const MISSIONS_HERO_OVERLAY =
  "linear-gradient(90deg, rgb(var(--soma-shell-rail) / 0.88) 0%, rgb(var(--soma-shell-rail) / 0.42) 34%, rgb(var(--soma-shell-rail) / 0.12) 58%, transparent 78%)";

const panelClass =
  "min-w-0 rounded-2xl border border-soma-line bg-soma-surface/90 p-4 sm:p-5";
const accentColor = { color: "rgb(var(--soma-shell-accent))" };

const CATEGORY_ICON = {
  neurotransmitters: Brain,
  processes: Waypoints,
  substances: FlaskConical,
  orientation: Compass,
} as const;

export function MissionsPage() {
  const { t } = useTranslation("missions");
  const base = useShellBase();
  const { user, loading: authLoading } = useAuth();
  const demo = base === "/preview";
  const live = base === "/app" && Boolean(user);
  const catalog = useMissions({
    live,
    userId: live ? (user?.id ?? null) : null,
  });
  const [filter, setFilter] = useState<MissionCatalogFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<MissionSortMode>("catalog");
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const rows = catalog.missions;
  const openMission = rows?.find((row) => row.id === openId) ?? null;

  useEffect(() => {
    setSelectedOptionId(null);
  }, [openId]);

  const summary = useMemo(() => countCompletedMissions(rows ?? []), [rows]);
  const featured = useMemo(() => pickFeaturedMissions(rows ?? []), [rows]);
  const titleOf = (row: MissionCatalogItem) => t(missionCopyPath(row.titleKey));
  const haystack = (row: MissionCatalogItem) =>
    `${t(missionCopyPath(row.titleKey))} ${t(missionCopyPath(row.summaryKey))}`;

  const visible = useMemo(() => {
    const filtered = filterMissionCatalog(rows ?? [], filter);
    const found = searchMissions(filtered, query, haystack);
    return sortMissionCatalog(found, sort, titleOf);
  }, [rows, filter, query, sort, t]);

  const filterOptions = useMemo(
    () => [
      { id: "all" as const, label: t("filterAll") },
      ...MISSION_CATEGORY_IDS.map((id) => ({ id, label: t(`categories.${id}`) })),
      { id: "completed" as const, label: t("filterCompleted") },
    ],
    [t],
  );

  const lastForOpen =
    catalog.lastAnswer && openMission && catalog.lastAnswer.missionId === openMission.id
      ? catalog.lastAnswer
      : null;

  async function handleSubmit() {
    if (!openMission || !selectedOptionId) return;
    try {
      await catalog.submitAnswer(openMission.id, selectedOptionId);
    } catch {
      /* submitError is set on the hook */
    }
  }

  const loading = (base === "/app" && authLoading) || catalog.state === "loading";
  const loadFailed = catalog.state === "error";

  return (
    <div className="flex min-w-0 flex-col gap-6 pb-8">
      <RecoveryHero
        eyebrow={t("pageEyebrow")}
        title={t("pageTitle")}
        description={t("pageDescription")}
        quote={t("pageQuote")}
        demo={demo}
        imageSrc={MISSIONS_HERO_IMAGE}
        imageClassName={MISSIONS_HERO_IMAGE_CLASS}
        overlay={MISSIONS_HERO_OVERLAY}
        panorama
        fetchPriority="high"
        imageWidth={2142}
        imageHeight={734}
      />

      {loading ? (
        <p className={`${panelClass} text-sm text-soma-ink-secondary`}>{t("loading")}</p>
      ) : null}

      {loadFailed ? (
        <div className={panelClass}>
          <p className="text-sm text-soma-ink-secondary">{t("loadError")}</p>
          <button
            type="button"
            onClick={() => catalog.reload()}
            className={`${previewFocus} mt-3 min-h-11 rounded-full bg-soma-action px-4 text-sm font-semibold text-[#081018]`}
          >
            {t("retry")}
          </button>
        </div>
      ) : null}

      {!loading && !loadFailed ? (
        <>
          <ProgressBoard summary={summary} demo={demo} />

          <p className="text-xs leading-relaxed text-soma-ink-muted">{t("disclaimer")}</p>

          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <SegmentedControl
              label={t("filterLabel")}
              value={filter}
              options={filterOptions}
              onChange={setFilter}
            />
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">{t("searchLabel")}</span>
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-soma-ink-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className={`${previewFocus} min-h-11 w-full rounded-full border border-soma-line bg-soma-surface py-2 pr-3 pl-9 text-sm text-soma-ink placeholder:text-soma-ink-muted`}
                />
              </label>
              <label className="shrink-0">
                <span className="sr-only">{t("sortLabel")}</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as MissionSortMode)}
                  className={`${previewFocus} min-h-11 rounded-full border border-soma-line bg-soma-surface px-3 text-sm text-soma-ink`}
                >
                  <option value="catalog">{t("sortCatalog")}</option>
                  <option value="title">{t("sortTitle")}</option>
                  <option value="completed">{t("sortCompleted")}</option>
                </select>
              </label>
            </div>
          </div>

          <section className="min-w-0" aria-labelledby="missions-featured">
            <h2 id="missions-featured" className="text-lg font-semibold text-soma-ink">
              {t("featuredTitle")}
            </h2>
            <p className="mt-1 text-sm text-soma-ink-secondary">{t("featuredSubtitle")}</p>
            <ul className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {featured.map((mission) => (
                <li key={mission.id} className="min-w-0">
                  <FeaturedCard mission={mission} onOpen={setOpenId} />
                </li>
              ))}
            </ul>
          </section>

          <section className="min-w-0" aria-labelledby="missions-categories">
            <h2 id="missions-categories" className="text-lg font-semibold text-soma-ink">
              {t("categoryProgressTitle")}
            </h2>
            <p className="mt-1 text-sm text-soma-ink-secondary">{t("categoryProgressSubtitle")}</p>
            <ul className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {MISSION_CATEGORY_IDS.map((categoryId) => (
                <li key={categoryId} className="min-w-0">
                  <CategoryProgressCard
                    categoryId={categoryId}
                    stats={categoryProgress(rows ?? [], categoryId)}
                    onExplore={() => setFilter(categoryId)}
                  />
                </li>
              ))}
            </ul>
          </section>

          <section className="min-w-0" aria-labelledby="missions-all">
            <h2 id="missions-all" className="text-lg font-semibold text-soma-ink">
              {t("allTitle")}
            </h2>
            <p className="mt-1 text-sm text-soma-ink-secondary">{t("allSubtitle")}</p>
            {visible.length === 0 ? (
              <p className={`${panelClass} mt-4 text-sm text-soma-ink-secondary`}>{t("emptyCatalog")}</p>
            ) : (
              <ul className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((mission) => (
                  <li key={mission.id} className="min-w-0">
                    <CatalogCard mission={mission} onOpen={setOpenId} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}

      {openMission ? (
        <MissionSheet
          mission={openMission}
          live={live}
          submitting={catalog.submittingMissionId === openMission.id}
          submitError={catalog.submitError}
          lastAnswer={lastForOpen}
          selectedOptionId={selectedOptionId}
          onSelectOption={setSelectedOptionId}
          onSubmit={() => void handleSubmit()}
          onClose={() => setOpenId(null)}
        />
      ) : null}
    </div>
  );
}

function ProgressBoard({
  summary,
  demo,
}: {
  summary: ReturnType<typeof countCompletedMissions>;
  demo: boolean;
}) {
  const { t } = useTranslation("missions");
  const items = [
    {
      id: "progress",
      icon: Compass,
      label: t("statProgress"),
      value: `${summary.completed} / ${summary.total}`,
      hint: `${summary.percent}%`,
      bar: summary.percent,
    },
    {
      id: "completed",
      icon: BookOpen,
      label: t("statCompleted"),
      value: String(summary.completed),
      hint: null,
      bar: null,
    },
    {
      id: "available",
      icon: CircleDot,
      label: t("statAvailable"),
      value: String(summary.available),
      hint: null,
      bar: null,
    },
    {
      id: "discover",
      icon: Map,
      label: t("statDiscover"),
      value: String(summary.discoverable),
      hint: t("statDiscoverHint"),
      bar: null,
    },
  ] as const;

  return (
    <section
      className="min-w-0 rounded-2xl border border-soma-line bg-soma-surface/90 px-4 py-3 sm:px-5 sm:py-3.5"
      aria-label={t("statProgress")}
    >
      <ul className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-4 xl:divide-x xl:divide-soma-line">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className="min-w-0 xl:px-3 first:xl:pl-0 last:xl:pr-0">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-soma-line bg-soma-raised">
                  <Icon className="h-3.5 w-3.5" style={accentColor} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] leading-tight text-soma-ink-muted">{item.label}</p>
                  <p className="text-base font-semibold leading-tight text-soma-ink">
                    {item.value}
                    {item.hint ? (
                      <span className="ml-1.5 text-xs font-medium text-soma-ink-secondary">
                        {item.hint}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
              {item.bar != null ? (
                <div
                  className="mt-2 h-1 overflow-hidden rounded-full bg-soma-raised"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full bg-soma-action motion-reduce:transition-none"
                    style={{ width: `${item.bar}%` }}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {demo ? (
        <p className="mt-2 text-[11px] leading-snug text-soma-ink-muted" role="note">
          {t("previewXpNote")}
        </p>
      ) : null}
    </section>
  );
}

function FeaturedCard({
  mission,
  onOpen,
}: {
  mission: MissionCatalogItem;
  onOpen: (id: string) => void;
}) {
  const { t } = useTranslation("missions");
  const art = missionIllustrationSrc(mission.sheetId);
  const completed = mission.state === "completed";
  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-soma-line bg-soma-surface motion-safe:transition-colors motion-safe:duration-200 motion-reduce:transition-none hover:border-soma-line-strong">
      <MissionArt
        src={art}
        title={t(missionCopyPath(mission.titleKey))}
        tall
        framed={missionArtNeedsFrame(mission.sheetId)}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em]" style={accentColor}>
          {t(`categories.${mission.categoryId}`)}
        </p>
        <h3 className="text-base font-semibold leading-snug text-soma-ink">
          {t(missionCopyPath(mission.titleKey))}
        </h3>
        <p className="text-sm leading-relaxed text-soma-ink-secondary">
          {t(missionCopyPath(mission.summaryKey))}
        </p>
        <button
          type="button"
          onClick={() => onOpen(mission.id)}
          className={`${previewFocus} mt-auto inline-flex min-h-11 items-center justify-center gap-1 rounded-full bg-soma-action px-4 text-sm font-semibold text-[#081018]`}
        >
          {completed ? t("openMission") : t("startMission")}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

function CategoryProgressCard({
  categoryId,
  stats,
  onExplore,
}: {
  categoryId: MissionCategoryId;
  stats: ReturnType<typeof categoryProgress>;
  onExplore: () => void;
}) {
  const { t } = useTranslation("missions");
  const Icon = CATEGORY_ICON[categoryId];
  const upcoming = stats.upcoming || FUTURE_MISSION_CATEGORY_IDS.includes(categoryId);
  const body = (
    <>
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
          upcoming
            ? "border border-dashed border-soma-line bg-soma-raised/40"
            : "border border-soma-line-strong bg-soma-raised"
        }`}
      >
        <Icon
          className={upcoming ? "h-5 w-5 text-soma-ink-muted" : "h-5 w-5"}
          style={upcoming ? undefined : accentColor}
          aria-hidden="true"
        />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className={`block text-sm font-semibold ${upcoming ? "text-soma-ink-secondary" : "text-soma-ink"}`}>
          {t(`categories.${categoryId}`)}
        </span>
        {upcoming ? (
          <span className="mt-1 block text-xs text-soma-ink-muted">{t("comingSoon")}</span>
        ) : (
          <>
            <span className="mt-1 block text-xs text-soma-ink-secondary">
              {stats.completed} / {stats.total}
            </span>
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-soma-raised" aria-hidden="true">
              <span
                className="block h-full rounded-full bg-soma-action"
                style={{ width: `${stats.percent}%` }}
              />
            </span>
          </>
        )}
      </span>
      {upcoming ? null : <ChevronRight className="h-4 w-4 shrink-0 text-soma-ink-muted" aria-hidden="true" />}
    </>
  );

  if (upcoming) {
    return (
      <div className="flex min-h-11 min-w-0 items-center gap-3.5 rounded-2xl border border-dashed border-soma-line bg-soma-surface/50 px-4 py-3.5">
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onExplore}
      className={`${previewFocus} flex min-h-11 w-full min-w-0 items-center gap-3.5 rounded-2xl border border-soma-line bg-soma-surface px-4 py-3.5 text-left hover:border-soma-line-strong`}
    >
      {body}
    </button>
  );
}

function CatalogCard({
  mission,
  onOpen,
}: {
  mission: MissionCatalogItem;
  onOpen: (id: string) => void;
}) {
  const { t } = useTranslation("missions");
  const art = missionIllustrationSrc(mission.sheetId);
  const completed = mission.state === "completed";
  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-soma-line bg-soma-surface">
      <div className="relative">
        <MissionArt
          src={art}
          title={t(missionCopyPath(mission.titleKey))}
          framed={missionArtNeedsFrame(mission.sheetId)}
        />
        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            completed
              ? "bg-soma-raised text-soma-ink"
              : "border border-soma-line bg-soma-surface/90 text-soma-ink-secondary"
          }`}
        >
          {completed ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
          {completed ? t("statusCompleted") : t("statusAvailable")}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-soma-ink-muted">
          {t(`categories.${mission.categoryId}`)}
        </p>
        <h3 className="text-base font-semibold leading-snug text-soma-ink">
          {t(missionCopyPath(mission.titleKey))}
        </h3>
        <p className="text-sm leading-relaxed text-soma-ink-secondary">
          {t(missionCopyPath(mission.summaryKey))}
        </p>
        <button
          type="button"
          onClick={() => onOpen(mission.id)}
          className={`${previewFocus} mt-auto inline-flex min-h-11 items-center justify-center gap-1 rounded-full bg-soma-action px-4 text-sm font-semibold text-[#081018]`}
        >
          {t("openMission")}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

function MissionArt({
  src,
  title,
  tall = false,
  framed = false,
}: {
  src: string | null;
  title: string;
  tall?: boolean;
  framed?: boolean;
}) {
  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden bg-[#101820] ${
        tall ? "h-40 sm:h-44" : "h-32 sm:h-36"
      }`}
    >
      {src && framed ? (
        <>
          <img
            src={src}
            alt=""
            aria-hidden="true"
            width={640}
            height={360}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-40"
          />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-[#101820]/25" aria-hidden="true" />
        </>
      ) : null}
      {src ? (
        <img
          src={src}
          alt=""
          width={framed ? 499 : 640}
          height={framed ? 660 : 360}
          loading="lazy"
          decoding="async"
          draggable={false}
          className={`relative z-10 h-full object-contain ${framed ? "w-auto max-w-[46%]" : "w-full"}`}
        />
      ) : (
        <span className="sr-only">{title}</span>
      )}
    </div>
  );
}

function MissionSheet({
  mission,
  live,
  submitting,
  submitError,
  lastAnswer,
  selectedOptionId,
  onSelectOption,
  onSubmit,
  onClose,
}: {
  mission: MissionCatalogItem;
  live: boolean;
  submitting: boolean;
  submitError: string | null;
  lastAnswer: MissionAnswerRecord | null;
  selectedOptionId: string | null;
  onSelectOption: (id: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation("missions");
  const base = useShellBase();
  const sheetHref = exploreEduHref(base, mission.sheetId);
  const completed = mission.state === "completed";
  const result = lastAnswer?.result ?? null;
  const showXp = live && result != null && result.xpGranted > 0;
  const promptId = `mission-prompt-${mission.id}`;

  return (
    <DetailSheet title={t(missionCopyPath(mission.titleKey))} onClose={onClose}>
      <div className="flex min-w-0 flex-col gap-4">
        <p className="text-sm leading-relaxed text-soma-ink-secondary">
          {t(missionCopyPath(mission.summaryKey))}
        </p>
        {sheetHref ? (
          <Link
            to={sheetHref}
            className={`${previewFocus} inline-flex min-h-11 items-center gap-2 text-sm text-soma-action hover:text-soma-action-hover`}
          >
            <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t("readSheet")}
          </Link>
        ) : (
          <p className="text-sm text-soma-ink-muted" role="status">
            {t("sheetUnavailable")}
          </p>
        )}

        {completed ? (
          <p
            className="flex items-center gap-2 rounded-xl border border-soma-action/35 bg-soma-raised/50 px-3 py-2 text-sm font-medium text-soma-ink motion-safe:transition-opacity motion-safe:duration-200 motion-reduce:transition-none"
            role="status"
          >
            <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t("alreadyCompleted")}
          </p>
        ) : null}

        <fieldset className="min-w-0" disabled={submitting}>
          <legend id={promptId} className="mb-3 text-sm font-semibold text-soma-ink">
            {t(missionCopyPath(mission.promptKey))}
          </legend>
          <div role="radiogroup" aria-labelledby={promptId} className="flex min-w-0 flex-col gap-2">
            {mission.options.map((option) => {
              const selected = selectedOptionId === option.id;
              const optionKey = isMissionId(mission.id)
                ? optionLabelKey(mission.id, option.id)
                : `items.${mission.id}.options.${option.id}`;
              return (
                <label
                  key={option.id}
                  className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm leading-snug motion-safe:transition-colors motion-safe:duration-150 motion-reduce:transition-none ${
                    selected
                      ? "border-soma-action bg-soma-raised text-soma-ink"
                      : "border-soma-line text-soma-ink-secondary hover:bg-soma-raised/60"
                  }`}
                >
                  <input
                    type="radio"
                    name={`mission-answer-${mission.id}`}
                    value={option.id}
                    checked={selected}
                    onChange={() => onSelectOption(option.id)}
                    className={`${previewFocus} mt-0.5`}
                  />
                  <span className="min-w-0">{t(missionCopyPath(optionKey))}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {!completed ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || !selectedOptionId}
            className={`${previewFocus} inline-flex min-h-11 items-center justify-center rounded-full bg-soma-action px-4 text-sm font-semibold text-[#081018] disabled:opacity-60`}
          >
            {submitting ? t("submitting") : result && !result.correct ? t("tryAgain") : t("sendAnswer")}
          </button>
        ) : null}

        {result && lastAnswer ? (
          <div
            className={`rounded-xl border p-3 motion-safe:transition-opacity motion-safe:duration-200 motion-reduce:transition-none ${
              result.correct
                ? "border-soma-action/35 bg-soma-raised/50"
                : "border-soma-line bg-soma-raised/30"
            }`}
            aria-live="polite"
            role="status"
          >
            <p className="flex items-center gap-2 text-sm font-medium text-soma-ink">
              {result.correct ? <Check className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
              {result.correct ? t("answerCorrect") : t("answerIncorrect")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-soma-ink-secondary">
              {t(missionCopyPath(result.explainKey))}
            </p>
            {showXp ? (
              <p className="mt-2 text-sm font-medium text-soma-ink">
                {t("xpGranted", { count: result.xpGranted })}
              </p>
            ) : null}
          </div>
        ) : null}

        {submitError ? (
          <div className="rounded-xl border border-soma-line p-3" role="alert">
            <p className="text-sm text-soma-ink-secondary">{t("submitError")}</p>
            <button
              type="button"
              onClick={onSubmit}
              className={`${previewFocus} mt-2 min-h-11 text-sm text-soma-action`}
            >
              {t("retrySubmit")}
            </button>
          </div>
        ) : null}
      </div>
    </DetailSheet>
  );
}
