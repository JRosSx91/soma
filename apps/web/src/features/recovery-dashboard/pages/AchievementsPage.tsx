import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { useAuth } from "../../auth/index.js";
import {
  achievementCatalog,
  achievementHiddenCopy,
} from "../achievement-catalog.generated.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import { previewFocus } from "../focus.js";
import { AchievementGalleryCard } from "../components/AchievementGalleryCard.js";
import { AchievementMedal } from "../components/AchievementMedal.js";
import { AchievementSummaryStrip } from "../components/AchievementSummaryStrip.js";
import { DetailSheet } from "../components/DetailSheet.js";
import { RecoveryHero } from "../components/RecoveryHero.js";
import {
  pickDailyMessage,
  readDailyMessages,
} from "../dashboard/home-daily-message.js";
import {
  formatDisplayDate,
  pickNextLockedAchievement,
  pickRecentUnlockedAchievements,
} from "../dashboard/home-progress.js";
import {
  catalogFamilyCounts,
  catalogSharePercent,
  countProgressStats,
  describeAchievement,
  filterCatalog,
  pickAchievementHighlights,
  sortCatalog,
  type CatalogItem,
  type FamilyFilter,
  type LiveRow,
  type SortMode,
  type StatusFilter,
  type SubstanceFilter,
  type TierFilter,
} from "../dashboard/achievements-view.js";
import { useLiveAchievements } from "../hooks/useLiveAchievements.js";
import { usePreviewDashboard } from "../hooks/usePreviewDashboard.js";
import { useTemporalMilestones } from "../hooks/useTemporalMilestones.js";
import type { TemporalMilestoneState } from "@soma/shared-types";

const ACHIEVEMENTS_HERO_IMAGE = "/images/decoration/nature-3.png";
const ACHIEVEMENTS_HERO_OVERLAY =
  "linear-gradient(90deg, rgb(var(--soma-shell-rail) / 0.48) 0%, rgb(var(--soma-shell-rail) / 0.16) 30%, transparent 58%)";

const familyIds: FamilyFilter[] = ["all", "temporal", "curve"];
const tierIds: TierFilter[] = ["all", "bronze", "silver", "gold", "platinum"];
const statusIds: StatusFilter[] = [
  "all",
  "unlocked",
  "in_progress",
  "locked",
  "indeterminate",
];

export function AchievementsPage() {
  const { t, i18n } = useTranslation(["achievements", "recovery"]);
  const base = useShellBase();
  const { user, loading: authLoading } = useAuth();
  const sessionPending = authLoading;
  const liveEnabled = Boolean(user) && base === "/app";
  const live = useLiveAchievements(liveEnabled ? (user?.id ?? null) : null);
  const dashboard = usePreviewDashboard(null);
  const temporal = useTemporalMilestones(dashboard.substances, {
    enabled: !dashboard.loading && !dashboard.error && dashboard.substances.length > 0,
    syncUnlocks: liveEnabled,
  });
  const [family, setFamily] = useState<FamilyFilter>("all");
  const [substance, setSubstance] = useState<SubstanceFilter>("all");
  const [tier, setTier] = useState<TierFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("catalog");
  const [openId, setOpenId] = useState<string | null>(null);

  const liveById = useMemo(() => {
    const map = new Map<string, LiveRow>();
    for (const row of live.rows ?? []) map.set(row.id, row);
    return map;
  }, [live.rows]);
  const temporalBySubstance = useMemo(
    () => new Map(temporal.states.map((state) => [state.substanceId, state])),
    [temporal.states],
  );

  const showingLive = liveEnabled && live.rows !== null;
  const awaitingAccount = sessionPending || (liveEnabled && live.loading);
  const catalogOnly = !showingLive && !awaitingAccount && !live.error;
  const counts = catalogFamilyCounts(achievementCatalog);
  const stats = countProgressStats(
    achievementCatalog,
    liveById,
    temporalBySubstance,
    showingLive,
  );
  const quote = pickDailyMessage(
    readDailyMessages(t("recovery:homeDailyMessages", { returnObjects: true })),
  );

  const substanceOptions = useMemo(() => {
    const seen = new Map<CatalogItem["substanceId"], string>();
    for (const item of achievementCatalog) {
      if (!seen.has(item.substanceId)) {
        seen.set(
          item.substanceId,
          t(`achievements:ui.substances.${item.substanceId}`, {
            defaultValue: item.substanceName,
          }),
        );
      }
    }
    return seen;
  }, [t]);

  const titleFor = (item: CatalogItem) =>
    t(`achievements:${item.id}.title`, { defaultValue: item.title });

  const items = useMemo(() => {
    const filtered = filterCatalog({
      catalog: achievementCatalog,
      liveById,
      temporalBySubstance,
      showingLive,
      family,
      substance,
      tier,
      status,
      query,
      titleFor,
    });
    return sortCatalog(filtered, sort, liveById);
  }, [
    family,
    liveById,
    query,
    showingLive,
    sort,
    status,
    substance,
    temporalBySubstance,
    tier,
    t,
  ]);

  const highlightIds = useMemo(() => {
    const recent = showingLive ? pickRecentUnlockedAchievements(live.rows, 2) : [];
    const tracked = dashboard.substances.map((item) => item.id);
    const nextCurve = showingLive
      ? pickNextLockedAchievement(live.rows, tracked)
      : null;
    return pickAchievementHighlights({
      catalogIds: new Set(achievementCatalog.map((item) => item.id)),
      recentUnlockedIds: recent.map((row) => row.id),
      temporalStates: temporal.states,
      nextCurveId: nextCurve?.id ?? null,
    });
  }, [dashboard.substances, live.rows, showingLive, temporal.states]);

  const highlightItems = highlightIds
    .map((id) => achievementCatalog.find((item) => item.id === id) ?? null)
    .filter((item): item is CatalogItem => item != null);

  const temporalItems = items.filter((item) => item.family === "temporal");
  const curveItems = items.filter((item) => item.family !== "temporal");
  const showSplit = family === "all";
  const open = achievementCatalog.find((item) => item.id === openId) ?? null;

  function localizedCopy(item: CatalogItem): CatalogItem {
    return {
      ...item,
      title: t(`achievements:${item.id}.title`, { defaultValue: item.title }),
      description: t(`achievements:${item.id}.description`, {
        defaultValue: item.description,
      }),
    } as CatalogItem;
  }

  const description = showingLive
    ? t("achievements:ui.descriptionLive")
    : awaitingAccount
      ? t("achievements:ui.descriptionLoading")
      : base === "/preview"
        ? t("achievements:ui.descriptionDemo")
        : t("achievements:ui.descriptionSignedOut", { count: counts.total });

  return (
    <div className="flex min-w-0 flex-col gap-5 pb-6">
      <RecoveryHero
        eyebrow={t("achievements:ui.eyebrow")}
        title={t("achievements:ui.title")}
        description={description}
        quote={quote}
        demo={catalogOnly && base === "/preview"}
        imageSrc={ACHIEVEMENTS_HERO_IMAGE}
        objectPosition="center 58%"
        overlay={ACHIEVEMENTS_HERO_OVERLAY}
      />

      {awaitingAccount ? (
        <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-8 text-sm text-soma-ink-secondary">
          {t("achievements:ui.loading")}
        </p>
      ) : null}

      {user && live.error ? (
        <div className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-6 text-sm text-soma-ink-secondary">
          <p>{t("achievements:ui.error")}</p>
          <button
            type="button"
            onClick={live.reload}
            className={`${previewFocus} mt-3 rounded-full bg-soma-action px-3 py-1.5 text-sm font-semibold text-[#081018]`}
          >
            {t("achievements:ui.retry")}
          </button>
        </div>
      ) : null}

      {!awaitingAccount && !(user && live.error) ? (
        <>
          <AchievementSummaryStrip
            cards={[
              {
                id: "catalog",
                icon: "catalog",
                label: t("achievements:ui.catalogLabel"),
                value: String(counts.total),
                hint: t("achievements:ui.catalogSplit", {
                  curve: counts.curve,
                  temporal: counts.temporal,
                }),
              },
              {
                id: "unlocked",
                icon: "unlocked",
                label: t("achievements:ui.unlockedLabel"),
                value: String(stats.unlocked),
                percent: catalogSharePercent(stats.unlocked, counts.total),
              },
              {
                id: "progress",
                icon: "progress",
                label: t("achievements:ui.inProgressLabel"),
                value: String(stats.inProgress),
                percent: catalogSharePercent(stats.inProgress, counts.total),
              },
            ]}
          />

          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
              <FilterGroup
                label={t("achievements:ui.familyLabel")}
                value={family}
                options={familyIds.map((id) => ({
                  id,
                  label: t(
                    `achievements:ui.${id === "all" ? "familyAll" : id === "temporal" ? "familyTemporal" : "familyCurve"}`,
                  ),
                }))}
                onChange={setFamily}
              />
              <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row lg:w-auto lg:max-w-md">
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">{t("achievements:ui.searchAria")}</span>
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-soma-ink-muted"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("achievements:ui.searchPlaceholder")}
                    className={`${previewFocus} w-full rounded-full border border-soma-line bg-soma-surface py-2 pr-3 pl-9 text-sm text-soma-ink placeholder:text-soma-ink-muted`}
                  />
                </label>
                <label className="shrink-0">
                  <span className="sr-only">{t("achievements:ui.sortAria")}</span>
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortMode)}
                    className={`${previewFocus} w-full rounded-full border border-soma-line bg-soma-surface px-3 py-2 text-sm text-soma-ink sm:w-44`}
                  >
                    <option value="catalog">{t("achievements:ui.sortCatalog")}</option>
                    <option value="recent">{t("achievements:ui.sortRecent")}</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <FilterGroup
                label={t("achievements:ui.substanceLabel")}
                value={substance}
                options={[
                  { id: "all" as const, label: t("achievements:ui.substanceAll") },
                  ...[...substanceOptions.entries()].map(([id, label]) => ({
                    id,
                    label,
                  })),
                ]}
                onChange={setSubstance}
              />
              <FilterGroup
                label={t("achievements:ui.tierLabel")}
                value={tier}
                options={tierIds.map((id) => ({
                  id,
                  label: t(`achievements:ui.${id === "all" ? "all" : id}`),
                }))}
                onChange={setTier}
              />
              <FilterGroup
                label={t("achievements:ui.statusLabel")}
                value={status}
                options={statusIds.map((id) => ({
                  id,
                  label: t(
                    `achievements:ui.${
                      id === "all"
                        ? "all"
                        : id === "in_progress"
                          ? "inProgress"
                          : id === "indeterminate"
                            ? "indeterminate"
                            : id
                    }`,
                  ),
                }))}
                onChange={setStatus}
              />
            </div>
          </div>

          {highlightItems.length > 0 ? (
            <section>
              <h2 className="text-base font-semibold text-soma-ink">
                {t("achievements:ui.featuredTitle")}
              </h2>
              <p className="mt-1 text-sm text-soma-ink-secondary">
                {t("achievements:ui.featuredSubtitle")}
              </p>
              <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {highlightItems.map((item) => (
                  <li key={item.id} className="min-w-0">
                    <AchievementGalleryCard
                      item={localizedCopy(item)}
                      view={describeAchievement(
                        item,
                        showingLive ? (liveById.get(item.id) ?? null) : undefined,
                        temporalBySubstance.get(item.substanceId) ?? null,
                      )}
                      labels={cardLabels(item, t)}
                      layout="featured"
                      onOpen={setOpenId}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="min-w-0">
            <h2 className="text-base font-semibold text-soma-ink">
              {items.length === achievementCatalog.length
                ? t("achievements:ui.allTitle")
                : t("achievements:ui.filteredTitle")}
              <span className="ml-2 text-sm font-normal tabular-nums text-soma-ink-muted">
                {items.length}
              </span>
            </h2>
            <p className="mt-1 text-sm text-soma-ink-secondary">
              {t("achievements:ui.allSubtitle")}
            </p>
            {items.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-soma-line px-4 py-8 text-sm text-soma-ink-muted">
                {t("achievements:ui.emptyFilter")}
              </p>
            ) : showSplit ? (
              <div className="mt-4 flex flex-col gap-8">
                <CatalogSection
                  title={t("achievements:ui.temporalSectionTitle")}
                  subtitle={t("achievements:ui.temporalSectionSubtitle")}
                  items={temporalItems}
                  showingLive={showingLive}
                  liveById={liveById}
                  temporalBySubstance={temporalBySubstance}
                  onOpen={setOpenId}
                  localize={localizedCopy}
                  t={t}
                />
                <CatalogSection
                  title={t("achievements:ui.curveSectionTitle")}
                  subtitle={t("achievements:ui.curveSectionSubtitle")}
                  items={curveItems}
                  showingLive={showingLive}
                  liveById={liveById}
                  temporalBySubstance={temporalBySubstance}
                  onOpen={setOpenId}
                  localize={localizedCopy}
                  t={t}
                />
              </div>
            ) : (
              <CatalogGrid
                items={items}
                showingLive={showingLive}
                liveById={liveById}
                temporalBySubstance={temporalBySubstance}
                onOpen={setOpenId}
                localize={localizedCopy}
                t={t}
              />
            )}
          </section>
        </>
      ) : null}

      {open && !awaitingAccount && !(user && live.error) ? (
        <AchievementDetail
          item={localizedCopy(open)}
          view={describeAchievement(
            open,
            showingLive ? (liveById.get(open.id) ?? null) : undefined,
            temporalBySubstance.get(open.substanceId) ?? null,
          )}
          locale={i18n.language}
          onClose={() => setOpenId(null)}
        />
      ) : null}
    </div>
  );
}

function CatalogSection({
  title,
  subtitle,
  items,
  showingLive,
  liveById,
  temporalBySubstance,
  onOpen,
  localize,
  t,
}: {
  title: string;
  subtitle: string;
  items: CatalogItem[];
  showingLive: boolean;
  liveById: Map<string, LiveRow>;
  temporalBySubstance: Map<string, TemporalMilestoneState>;
  onOpen: (id: string) => void;
  localize: (item: CatalogItem) => CatalogItem;
  t: ReturnType<typeof useTranslation>[0];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-soma-ink">{title}</h3>
      <p className="mt-1 text-sm text-soma-ink-secondary">{subtitle}</p>
      <CatalogGrid
        items={items}
        showingLive={showingLive}
        liveById={liveById}
        temporalBySubstance={temporalBySubstance}
        onOpen={onOpen}
        localize={localize}
        t={t}
      />
    </div>
  );
}

function CatalogGrid({
  items,
  showingLive,
  liveById,
  temporalBySubstance,
  onOpen,
  localize,
  t,
}: {
  items: CatalogItem[];
  showingLive: boolean;
  liveById: Map<string, LiveRow>;
  temporalBySubstance: Map<string, TemporalMilestoneState>;
  onOpen: (id: string) => void;
  localize: (item: CatalogItem) => CatalogItem;
  t: ReturnType<typeof useTranslation>[0];
}) {
  return (
    <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <li key={item.id} className="min-w-0">
          <AchievementGalleryCard
            item={localize(item)}
            view={describeAchievement(
              item,
              showingLive ? (liveById.get(item.id) ?? null) : undefined,
              temporalBySubstance.get(item.substanceId) ?? null,
            )}
            labels={cardLabels(item, t)}
            layout="gallery"
            onOpen={onOpen}
          />
        </li>
      ))}
    </ul>
  );
}

function cardLabels(item: CatalogItem, t: ReturnType<typeof useTranslation>[0]) {
  const substance = t(`achievements:ui.substances.${item.substanceId}`, {
    defaultValue: item.substanceName,
  });
  return {
    unlocked: t("achievements:ui.statusUnlocked"),
    inProgress: t("achievements:ui.statusInProgress"),
    locked: t("achievements:ui.statusLocked"),
    indeterminate: t("achievements:ui.statusIndeterminate"),
    review: t("achievements:ui.statusReview"),
    remainingDays: (count: number) => t("achievements:ui.remainingDays", { count }),
    daysProgress: (current: number, target: number) =>
      t("achievements:ui.daysProgress", { current, target }),
    temporalRequirement: (days: number, name: string) =>
      t("achievements:ui.temporalRequirement", { count: days, substance: name }),
    curveProgress: (current: number, threshold: number) =>
      t("achievements:ui.curveProgress", { current, threshold }),
    curveRequirement: (percent: number) => t("achievements:ui.curveRequirement", { percent }),
    substance,
    tier: t(`achievements:ui.${item.tier}`),
  };
}

function FilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={`${previewFocus} rounded-full px-3 py-1.5 text-sm ${
              selected
                ? "bg-soma-action text-[#081018]"
                : "bg-soma-surface text-soma-ink-secondary hover:bg-soma-raised hover:text-soma-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function AchievementDetail({
  item,
  view,
  locale,
  onClose,
}: {
  item: CatalogItem;
  view: ReturnType<typeof describeAchievement>;
  locale: string;
  onClose: () => void;
}) {
  const { t } = useTranslation("achievements");
  const substance = t(`ui.substances.${item.substanceId}`, {
    defaultValue: item.substanceName,
  });
  const thresholdPercent = Math.round((item.threshold ?? 0) * 100);
  const unlockedOn = formatDisplayDate(view.unlockedAt, locale);

  if (view.sealed) {
    return (
      <DetailSheet title={t("hidden.title", { defaultValue: achievementHiddenCopy.title })} accessibleTitle={t("ui.statusLocked")} onClose={onClose}>
        <div className="mb-3 flex justify-center">
          <AchievementMedal
            substanceId={item.substanceId}
            tier={item.tier}
            sealed
            locked
            size="detail"
            family={item.family === "temporal" ? "temporal" : "curve"}
          />
        </div>
        <p>
          {t("ui.hiddenLocked")} {t(`ui.${item.tier}`)}.
        </p>
        <p className="mt-2">{t("hidden.description", { defaultValue: achievementHiddenCopy.description })}</p>
      </DetailSheet>
    );
  }

  return (
    <DetailSheet title={item.title} onClose={onClose}>
      <div className="mb-3 flex justify-center">
        <AchievementMedal
          substanceId={item.substanceId}
          tier={item.tier}
          locked={!view.unlocked}
          size="detail"
          family={item.family === "temporal" ? "temporal" : "curve"}
        />
      </div>
      <p>
        {view.unlocked
          ? unlockedOn
            ? t("ui.unlockedOn", { date: unlockedOn })
            : t("ui.statusUnlocked")
          : view.review
            ? t("ui.statusReview")
            : t("ui.statusLocked")}
        . {substance}. {t(`ui.${item.tier}`)}.
      </p>
      {item.family === "temporal" ? (
        <p className="mt-2">
          {t("ui.temporalDetail", {
            count: item.abstinenceDays,
            unit: item.abstinenceDays === 1 ? t("ui.day") : t("ui.days"),
            substance,
          })}
        </p>
      ) : view.review ? (
        <p className="mt-2">
          {t("ui.reviewDetail", { percent: thresholdPercent, organ: item.organName })}
        </p>
      ) : (
        <p className="mt-2">
          {t("ui.curveDetail", { percent: thresholdPercent, organ: item.organName })}
        </p>
      )}
      {view.curveProgress ? (
        <p className="mt-2">
          {t("ui.curveProgressDetail", {
            current: view.curveProgress.currentPercent,
            threshold: view.curveProgress.thresholdPercent,
          })}
        </p>
      ) : null}
      {view.gap ? <p className="mt-2">{gapNote(view.gap, t)}</p> : null}
      {view.unlocked || !item.hidden || item.tier === "platinum" ? (
        <p className="mt-2">{item.description}</p>
      ) : null}
    </DetailSheet>
  );
}

function gapNote(
  gap: NonNullable<ReturnType<typeof describeAchievement>["gap"]>,
  t: ReturnType<typeof useTranslation>[0],
) {
  if (gap === "missing_row") return t("ui.gapMissingRow");
  if (gap === "not_tracked") return t("ui.gapNotTracked");
  if (gap === "active_use") return t("ui.gapActiveUse");
  if (gap === "missing_date") return t("ui.gapMissingDate");
  return t("ui.gapInsufficient");
}
