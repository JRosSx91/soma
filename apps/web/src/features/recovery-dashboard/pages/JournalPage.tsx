import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudRain,
  Flag,
  Flame,
  Heart,
  Leaf,
  Lightbulb,
  Moon,
  NotebookPen,
  Plus,
  Quote,
  Rocket,
  Smile,
  Sparkles,
  Sun,
  Target,
  Users,
  Waves,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  JOURNAL_MILESTONE_KIND_IDS,
  type JournalEmotionId,
  type JournalTriggerId,
} from "@soma/shared-types";
import { useAuth } from "../../auth/index.js";
import { useUserProfile } from "../../profile/hooks/useUserProfile.js";
import { SpecialCategoryConsentCard } from "../../profile/components/SpecialCategoryConsentCard.js";
import {
  isSpecialCategoryWriteBlocked,
  needsSpecialCategoryConsent,
} from "../../profile/lib/special-category-consent.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import {
  pickDailyMessage,
  readDailyMessages,
} from "../dashboard/home-daily-message.js";
import { previewFocus } from "../focus.js";
import { DetailSheet } from "../components/DetailSheet.js";
import { RecoveryHero } from "../components/RecoveryHero.js";
import { SegmentedControl } from "../components/SegmentedControl.js";
import { JournalEntryForm } from "../../journal/JournalEntryForm.js";
import {
  createJournalEntry,
  createJournalMilestone,
  deleteJournalEntry,
  deleteJournalMilestone,
  fetchAllJournalEntries,
  fetchJournalMilestones,
  fetchJournalMonthEntries,
  fetchJournalPage,
  patchJournalEntry,
  patchJournalMilestone,
} from "../../journal/journal-api.js";
import {
  JOURNAL_DEMO_ENTRIES,
  JOURNAL_DEMO_MILESTONES,
} from "../../journal/journal-demo.js";
import { runDeleteJournalEntry } from "../../journal/journal-delete.js";
import {
  JOURNAL_DEMO_LIST_PAGE_SIZE,
  JOURNAL_LIST_PAGE_SIZE,
  JOURNAL_MILESTONE_NOTE_MAX,
  JOURNAL_SCALE_IDS,
  JOURNAL_SCALE_RANGE,
  JOURNAL_TAG_ENTRY_PAGE,
  JOURNAL_TABS,
  JOURNAL_TREND_WINDOWS,
  appendJournalPage,
  applyJournalListFilters,
  civilYearMonth,
  countJournalDays,
  currentJournalStreak,
  dailyScaleSeries,
  daysWithEntriesInMonth,
  emotionFrequencies,
  emotionTriggerCoincidences,
  entriesOnDay,
  entriesWithEmotion,
  entriesWithTrigger,
  entryPreview,
  filterEntriesInCivilWindow,
  highlightedEntries,
  isJournalMilestoneKind,
  latestJournalEntry,
  learningEntries,
  localCivilDate,
  selectionForVisibleMonth,
  shiftCivilMonth,
  triggerFrequencies,
  wellbeingAverage,
  type JournalEntry,
  type JournalEntryWrite,
  type JournalListFilters,
  type JournalMilestone,
  type JournalMilestoneWrite,
  type JournalScaleId,
  type JournalTab,
  type JournalTrendWindow,
} from "../../journal/journal-model.js";
import { useSubstances } from "../../substances/index.js";

const JOURNAL_HERO_IMAGE = "/images/decoration/nature-5.png";
const JOURNAL_LAST_IMAGE = "/images/decoration/nature-6.png";
const JOURNAL_HERO_OVERLAY =
  "linear-gradient(90deg, rgb(var(--soma-shell-rail) / 0.78) 0%, rgb(var(--soma-shell-rail) / 0.32) 38%, transparent 72%)";
const JOURNAL_HERO_POSITION = "center 42%";

const cardClass =
  "rounded-2xl border border-soma-line bg-soma-surface p-4 sm:p-5";
const accentColor = { color: "rgb(var(--soma-shell-accent))" };

type Sheet =
  | { kind: "create" }
  | { kind: "edit"; entry: JournalEntry }
  | { kind: "view"; entry: JournalEntry }
  | { kind: "day"; iso: string }
  | { kind: "milestone-create" }
  | { kind: "milestone-edit"; milestone: JournalMilestone }
  | { kind: "milestones" };

type ChartSeries = "wellbeing" | "mood";

const EMOTION_STYLE: Record<string, { icon: typeof Sun; color: string }> = {
  calm: { icon: Sun, color: "#5eead4" },
  optimistic: { icon: Sparkles, color: "#facc15" },
  motivated: { icon: Rocket, color: "#fb923c" },
  anxious: { icon: CloudRain, color: "#93c5fd" },
  irritable: { icon: Flame, color: "#f472b6" },
  sad: { icon: Cloud, color: "#818cf8" },
  tired: { icon: Moon, color: "#94a3b8" },
  grateful: { icon: Leaf, color: "#86efac" },
};

const TRIGGER_STYLE: Record<string, { icon: typeof Sun; color: string }> = {
  conflict: { icon: Flame, color: "#fb7185" },
  fatigue: { icon: Moon, color: "#94a3b8" },
  boredom: { icon: Cloud, color: "#818cf8" },
  social: { icon: Users, color: "#fb923c" },
  place: { icon: Flag, color: "#86efac" },
  cue: { icon: Sparkles, color: "#facc15" },
  loneliness: { icon: CloudRain, color: "#38bdf8" },
  stress: { icon: Zap, color: "#f472b6" },
};

const MILESTONE_STYLE: Record<string, { icon: typeof Sun; color: string }> = {
  clarity: { icon: Sun, color: "#5eead4" },
  rest: { icon: Moon, color: "#818cf8" },
  lessAnxiety: { icon: Heart, color: "#fb7185" },
  energy: { icon: Zap, color: "#facc15" },
  focus: { icon: Target, color: "#fb923c" },
  emotionalStability: { icon: Waves, color: "#38bdf8" },
};

export function JournalPage() {
  const { t, i18n } = useTranslation("journal");
  const base = useShellBase();
  const { user } = useAuth();
  const { data: substances } = useSubstances();
  const demo = base === "/preview";
  const live = base === "/app" && Boolean(user);
  const liveProfile = useUserProfile({ enabled: live });
  const needsConsent =
    live &&
    !liveProfile.loading &&
    liveProfile.profile != null &&
    needsSpecialCategoryConsent(liveProfile.profile);
  const [tab, setTab] = useState<JournalTab>("overview");
  const [entries, setEntries] = useState<JournalEntry[]>(
    demo ? [...JOURNAL_DEMO_ENTRIES] : [],
  );
  const [milestones, setMilestones] = useState<JournalMilestone[]>(
    demo ? [...JOURNAL_DEMO_MILESTONES] : [],
  );
  const [loading, setLoading] = useState(live);
  const [error, setError] = useState(false);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteInFlight = useRef(false);
  const [chartSeries, setChartSeries] = useState<ChartSeries>("wellbeing");
  const [patternScale, setPatternScale] = useState<JournalScaleId>("wellbeing");
  const [patternWindow, setPatternWindow] = useState<JournalTrendWindow>(28);
  const [tagPick, setTagPick] = useState<
    | { kind: "emotion"; id: JournalEmotionId }
    | { kind: "trigger"; id: JournalTriggerId }
    | null
  >(null);
  const [tagListLimit, setTagListLimit] = useState(JOURNAL_TAG_ENTRY_PAGE);
  const today = localCivilDate();
  const todayMonth = civilYearMonth(today);
  const last = latestJournalEntry(entries);
  const [calYear, setCalYear] = useState(todayMonth.year);
  const [calMonth, setCalMonth] = useState(todayMonth.monthIndex);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [monthEntries, setMonthEntries] = useState<JournalEntry[]>([]);
  const [monthReady, setMonthReady] = useState(false);
  const [monthError, setMonthError] = useState(false);
  const [listItems, setListItems] = useState<JournalEntry[]>([]);
  const [listCursor, setListCursor] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [listMoreLoading, setListMoreLoading] = useState(false);
  const [listError, setListError] = useState(false);
  const [demoListLimit, setDemoListLimit] = useState(JOURNAL_DEMO_LIST_PAGE_SIZE);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterHighlighted, setFilterHighlighted] = useState(false);
  const [filterLearning, setFilterLearning] = useState(false);
  const quote = pickDailyMessage(readDailyMessages(t("quotes", { returnObjects: true })));
  const listFilters: JournalListFilters = {
    from: filterFrom || undefined,
    to: filterTo || undefined,
    highlighted: filterHighlighted || undefined,
    learning: filterLearning || undefined,
  };
  const filtersActive = Boolean(
    filterFrom || filterTo || filterHighlighted || filterLearning,
  );

  const loadLive = useCallback(async () => {
    if (!live) return;
    setLoading(true);
    setError(false);
    try {
      const [rows, marks] = await Promise.all([
        fetchAllJournalEntries(),
        fetchJournalMilestones(),
      ]);
      setEntries(rows);
      setMilestones(marks);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [live]);

  useEffect(() => {
    if (demo) {
      setEntries([...JOURNAL_DEMO_ENTRIES]);
      setMilestones([...JOURNAL_DEMO_MILESTONES]);
      setLoading(false);
      setError(false);
      return;
    }
    if (live) void loadLive();
  }, [demo, live, loadLive]);

  useEffect(() => {
    if (!live) {
      setMonthEntries([]);
      setMonthReady(false);
      setMonthError(false);
      return;
    }
    let cancelled = false;
    setMonthReady(false);
    setMonthError(false);
    void (async () => {
      try {
        const rows = await fetchJournalMonthEntries(calYear, calMonth);
        if (cancelled) return;
        setMonthEntries(rows);
        setMonthReady(true);
      } catch {
        if (cancelled) return;
        setMonthError(true);
        setMonthReady(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [live, calYear, calMonth]);

  const loadHistoryPage = useCallback(
    async (mode: "reset" | "more") => {
      if (!live) return;
      if (mode === "reset") {
        setListLoading(true);
        setListError(false);
        setListCursor(null);
        setListItems([]);
      } else {
        setListMoreLoading(true);
      }
      try {
        const page = await fetchJournalPage({
          ...listFilters,
          cursor: mode === "more" ? (listCursor ?? undefined) : undefined,
          limit: JOURNAL_LIST_PAGE_SIZE,
        });
        setListItems((prev) =>
          mode === "reset" ? page.items : appendJournalPage(prev, page.items),
        );
        setListCursor(page.nextCursor);
      } catch {
        setListError(true);
      } finally {
        setListLoading(false);
        setListMoreLoading(false);
      }
    },
    [live, listCursor, listFilters],
  );

  useEffect(() => {
    setDemoListLimit(JOURNAL_DEMO_LIST_PAGE_SIZE);
    if (!live) {
      setListItems([]);
      setListCursor(null);
      setListError(false);
      return;
    }
    if (tab !== "entries") return;
    let cancelled = false;
    setListLoading(true);
    setListError(false);
    setListCursor(null);
    setListItems([]);
    void (async () => {
      try {
        const page = await fetchJournalPage({
          ...listFilters,
          limit: JOURNAL_LIST_PAGE_SIZE,
        });
        if (cancelled) return;
        setListItems(page.items);
        setListCursor(page.nextCursor);
      } catch {
        if (!cancelled) setListError(true);
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [live, tab, filterFrom, filterTo, filterHighlighted, filterLearning]);

  const days = countJournalDays(entries);
  const streak = currentJournalStreak(entries, today);
  const wellbeing = wellbeingAverage(entries, today);
  const highlights = highlightedEntries(entries);
  const learnings = learningEntries(entries);
  const emotions = emotionFrequencies(entries);
  const overviewWindow = filterEntriesInCivilWindow(entries, today, 28);
  const overviewPoints = dailyScaleSeries(
    overviewWindow,
    chartSeries === "wellbeing" ? "wellbeing" : "mood",
  );
  const overviewRange = JOURNAL_SCALE_RANGE[chartSeries];
  const patternEntries = filterEntriesInCivilWindow(entries, today, patternWindow);
  const patternPoints = dailyScaleSeries(patternEntries, patternScale);
  const patternRange = JOURNAL_SCALE_RANGE[patternScale];
  const patternEmpty =
    patternPoints.length === 0
      ? t("patterns.emptyNone")
      : patternPoints.length === 1
        ? t("patterns.emptySingle")
        : t("overview.evolutionEmpty");
  const coincidences = emotionTriggerCoincidences(patternEntries);
  const triggers = triggerFrequencies(entries);
  const taggedEntries = tagPick
    ? tagPick.kind === "emotion"
      ? entriesWithEmotion(entries, tagPick.id)
      : entriesWithTrigger(entries, tagPick.id)
    : [];
  const calendarRows =
    live && monthReady && !monthError ? monthEntries : entries;
  const markedDays = daysWithEntriesInMonth(calendarRows, calYear, calMonth);
  const visibleSelectedDay = selectionForVisibleMonth(
    selectedDay,
    calYear,
    calMonth,
  );
  const selectedDayEntries = visibleSelectedDay
    ? entriesOnDay(calendarRows, visibleSelectedDay)
    : [];
  const viewingCurrentMonth =
    calYear === todayMonth.year && calMonth === todayMonth.monthIndex;
  const demoFiltered = applyJournalListFilters(entries, listFilters);
  const historyEntries = live
    ? listItems
    : demoFiltered.slice(0, demoListLimit);
  const historyHasMore = live
    ? Boolean(listCursor)
    : demoFiltered.length > demoListLimit;

  const tabOptions = JOURNAL_TABS.map((id) => ({
    id,
    label: t(`tabs.${id}`),
  }));

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
    [i18n.language],
  );

  function formatCivil(iso: string): string {
    return dateFmt.format(new Date(`${iso}T00:00:00.000Z`));
  }

  const shortDateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }),
    [i18n.language],
  );

  function formatCivilShort(iso: string): string {
    return shortDateFmt.format(new Date(`${iso}T00:00:00.000Z`));
  }

  async function handleSave(draft: JournalEntryWrite) {
    setSaving(true);
    setSaveError(null);
    const editing = sheet?.kind === "edit" ? sheet.entry : null;
    try {
      if (demo) {
        const nowIso = new Date().toISOString();
        if (editing) {
          const next: JournalEntry = {
            ...editing,
            ...draft,
            title: draft.title ?? null,
            body: draft.body ?? null,
            emotionIds: draft.emotionIds ?? [],
            triggerIds: draft.triggerIds ?? [],
            updatedAt: nowIso,
            mood: draft.mood ?? null,
            sleep: draft.sleep ?? null,
            energy: draft.energy ?? null,
            anxiety: draft.anxiety ?? null,
            cravingIntensity: draft.cravingIntensity ?? null,
            cravingSubstanceId: draft.cravingSubstanceId ?? null,
            wellbeingRating: draft.wellbeingRating ?? null,
            highlighted: draft.highlighted ?? false,
            learning: draft.learning ?? false,
            occurredOn: draft.occurredOn,
          };
          setEntries((rows) => rows.map((row) => (row.id === editing.id ? next : row)));
        } else {
          const created: JournalEntry = {
            id: `demo-local-${nowIso}`,
            createdAt: nowIso,
            updatedAt: nowIso,
            occurredOn: draft.occurredOn,
            mood: draft.mood ?? null,
            sleep: draft.sleep ?? null,
            energy: draft.energy ?? null,
            anxiety: draft.anxiety ?? null,
            cravingIntensity: draft.cravingIntensity ?? null,
            cravingSubstanceId: draft.cravingSubstanceId ?? null,
            wellbeingRating: draft.wellbeingRating ?? null,
            title: draft.title ?? null,
            body: draft.body ?? null,
            highlighted: draft.highlighted ?? false,
            learning: draft.learning ?? false,
            emotionIds: draft.emotionIds ?? [],
            triggerIds: draft.triggerIds ?? [],
          };
          setEntries((rows) => [created, ...rows]);
        }
      } else if (live) {
        if (editing) await patchJournalEntry(editing.id, draft);
        else await createJournalEntry(draft);
        await loadLive();
        setMonthReady(false);
        const monthRows = await fetchJournalMonthEntries(calYear, calMonth);
        setMonthEntries(monthRows);
        setMonthReady(true);
        if (tab === "entries") {
          const page = await fetchJournalPage({
            ...listFilters,
            limit: JOURNAL_LIST_PAGE_SIZE,
          });
          setListItems(page.items);
          setListCursor(page.nextCursor);
        }
      }
      setSheet(null);
    } catch (err) {
      setSaveError(
        isSpecialCategoryWriteBlocked(err)
          ? t("consentSaveError")
          : t("form.saveError"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleMilestoneSave(draft: JournalMilestoneWrite) {
    setSaving(true);
    setSaveError(null);
    const editing = sheet?.kind === "milestone-edit" ? sheet.milestone : null;
    try {
      if (demo) {
        const nowIso = new Date().toISOString();
        if (editing) {
          setMilestones((rows) =>
            rows.map((row) =>
              row.id === editing.id
                ? { ...row, ...draft, note: draft.note ?? null, updatedAt: nowIso }
                : row,
            ),
          );
        } else {
          setMilestones((rows) => [
            {
              id: `demo-ms-${nowIso}`,
              kind: draft.kind,
              occurredOn: draft.occurredOn,
              note: draft.note ?? null,
              createdAt: nowIso,
              updatedAt: nowIso,
            },
            ...rows,
          ]);
        }
      } else if (live) {
        if (editing) await patchJournalMilestone(editing.id, draft);
        else await createJournalMilestone(draft);
        await loadLive();
      }
      setSheet(null);
    } catch (err) {
      setSaveError(
        isSpecialCategoryWriteBlocked(err)
          ? t("consentSaveError")
          : t("milestones.saveError"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEntry(id: string) {
    setDeleteError(null);
    setDeleting(true);
    try {
      const outcome = await runDeleteJournalEntry({
        live,
        demo,
        id,
        inFlight: deleteInFlight,
        deleteRemote: deleteJournalEntry,
      });
      if (outcome === "busy") return;
      if (outcome === "error") {
        setDeleteError(t("form.deleteError"));
        return;
      }
      if (demo) {
        setEntries((rows) => rows.filter((row) => row.id !== id));
      } else if (live) {
        await loadLive();
        setMonthReady(false);
        const monthRows = await fetchJournalMonthEntries(calYear, calMonth);
        setMonthEntries(monthRows);
        setMonthReady(true);
        if (tab === "entries") {
          const page = await fetchJournalPage({
            ...listFilters,
            limit: JOURNAL_LIST_PAGE_SIZE,
          });
          setListItems(page.items);
          setListCursor(page.nextCursor);
        }
      }
      setConfirmDelete(false);
      setSheet(null);
    } catch {
      setDeleteError(t("form.deleteError"));
    } finally {
      setDeleting(false);
    }
  }

  async function handleMilestoneDelete(id: string) {
    if (demo) {
      setMilestones((rows) => rows.filter((row) => row.id !== id));
      setSheet(null);
      return;
    }
    if (!live) return;
    try {
      await deleteJournalMilestone(id);
      await loadLive();
      setSheet(null);
    } catch {
      setSaveError(t("milestones.saveError"));
    }
  }

  const wellbeingLabel =
    wellbeing == null
      ? t("summary.wellbeingEmpty")
      : t("summary.wellbeingValue", {
          value: wellbeing.toLocaleString(i18n.language, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }),
        });

  return (
    <div className="flex min-w-0 flex-col gap-5 pb-6">
      <RecoveryHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={demo ? t("descriptionDemo") : t("descriptionLive")}
        quote={quote}
        demo={demo}
        imageSrc={JOURNAL_HERO_IMAGE}
        objectPosition={JOURNAL_HERO_POSITION}
        overlay={JOURNAL_HERO_OVERLAY}
        onbAnchor="journal-title"
      />

      {needsConsent ? (
        <SpecialCategoryConsentCard
          withdrawn={
            liveProfile.profile?.specialCategoryConsentWithdrawn === true
          }
          onGranted={() => {
            void liveProfile.refresh();
          }}
        />
      ) : null}

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <SegmentedControl
            label={t("tabsLabel")}
            value={tab}
            options={tabOptions}
            onChange={setTab}
          />
        </div>
        {needsConsent ? null : (
          <button
            type="button"
            onClick={() => {
              setSaveError(null);
              setSheet({ kind: "create" });
            }}
            className={`${previewFocus} inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-full bg-soma-action px-4 text-sm font-semibold text-[#081018]`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("newEntry")}
          </button>
        )}
      </div>

      {loading ? (
        <p className={`${cardClass} text-sm text-soma-ink-secondary`}>{t("loading")}</p>
      ) : null}

      {error ? (
        <div className={cardClass}>
          <p className="text-sm text-soma-ink-secondary">{t("error")}</p>
          <button
            type="button"
            onClick={() => void loadLive()}
            className={`${previewFocus} mt-3 rounded-full bg-soma-action px-3 py-1.5 text-sm font-semibold text-[#081018]`}
          >
            {t("retry")}
          </button>
        </div>
      ) : null}

      {!loading && !error && tab === "overview" ? (
        <div className="flex min-w-0 flex-col gap-4">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={<NotebookPen className="h-5 w-5" aria-hidden="true" />}
              label={t("summary.entries")}
              value={String(entries.length)}
              hint={t("summary.entriesHint")}
            />
            <SummaryCard
              icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
              label={t("summary.days")}
              value={String(days)}
              hint={t("summary.daysHint")}
            />
            <SummaryCard
              icon={<Zap className="h-5 w-5" aria-hidden="true" />}
              label={t("summary.streak")}
              value={t("summary.streakValue", { count: streak })}
              hint={t("summary.streakHint")}
              help={t("summary.streakHelp")}
            />
            <SummaryCard
              icon={<Leaf className="h-5 w-5" aria-hidden="true" />}
              label={t("summary.wellbeing")}
              value={wellbeingLabel}
              hint={t("summary.wellbeingHint")}
              help={t("summary.wellbeingHelp")}
            />
          </dl>

          {entries.length === 0 ? (
            <p className={`${cardClass} text-sm leading-relaxed text-soma-ink-secondary`}>
              {t("emptyOverview")}
            </p>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,22rem)]">
            <section className={`${cardClass} min-w-0`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                <div className="min-w-0 sm:flex-1">
                  <h2 className="text-lg font-semibold text-soma-ink">
                    {t("overview.evolutionTitle")}
                  </h2>
                  <p className="mt-1 text-sm text-soma-ink-secondary">
                    {t("overview.evolutionHint")}
                  </p>
                  <p className="mt-1 text-sm text-soma-ink-muted">
                    {t("overview.evolutionHelp")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {(["wellbeing", "mood"] as const).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setChartSeries(id)}
                      className={`${previewFocus} rounded-full px-3 py-1.5 text-xs ${
                        chartSeries === id
                          ? "bg-soma-action text-[#081018]"
                          : "bg-soma-raised text-soma-ink-secondary"
                      }`}
                    >
                      {id === "wellbeing"
                        ? t("overview.seriesWellbeing")
                        : t("overview.seriesMood")}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-2 min-w-0">
                <ValueChart
                  points={overviewPoints}
                  min={overviewRange.min}
                  max={overviewRange.max}
                  formatCivilShort={formatCivilShort}
                  empty={
                    overviewPoints.length === 1
                      ? t("patterns.emptySingle")
                      : t("overview.evolutionEmpty")
                  }
                />
              </div>
            </section>
            <section className={cardClass}>
              <SectionTitle icon={<Smile className="h-4 w-4" />} title={t("overview.emotionsTitle")} />
              <p className="mt-1 text-sm text-soma-ink-secondary">
                {t("overview.emotionsHint")}
              </p>
              <p className="mt-1 text-sm text-soma-ink-muted">{t("overview.emotionsHelp")}</p>
              <EmotionBars emotions={emotions} empty={t("overview.emotionsEmpty")} />
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
            <section className={cardClass}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-soma-ink">
                  {t("overview.calendarTitle")}
                </h2>
                <div className="flex flex-wrap items-center justify-end gap-1">
                  <button
                    type="button"
                    className={`${previewFocus} min-h-11 min-w-11 rounded-lg p-1.5 text-soma-ink-secondary hover:bg-soma-raised`}
                    aria-label={t("overview.calendarPrev")}
                    onClick={() => {
                      const next = shiftCivilMonth(calYear, calMonth, -1);
                      setCalYear(next.year);
                      setCalMonth(next.monthIndex);
                      setSelectedDay((iso) =>
                        selectionForVisibleMonth(iso, next.year, next.monthIndex),
                      );
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`${previewFocus} min-h-11 rounded-lg px-2 text-sm text-soma-action disabled:text-soma-ink-muted`}
                    aria-label={t("overview.calendarToday")}
                    disabled={viewingCurrentMonth}
                    onClick={() => {
                      setCalYear(todayMonth.year);
                      setCalMonth(todayMonth.monthIndex);
                      setSelectedDay(today);
                    }}
                  >
                    {t("overview.calendarToday")}
                  </button>
                  <button
                    type="button"
                    className={`${previewFocus} min-h-11 min-w-11 rounded-lg p-1.5 text-soma-ink-secondary hover:bg-soma-raised`}
                    aria-label={t("overview.calendarNext")}
                    onClick={() => {
                      const next = shiftCivilMonth(calYear, calMonth, 1);
                      setCalYear(next.year);
                      setCalMonth(next.monthIndex);
                      setSelectedDay((iso) =>
                        selectionForVisibleMonth(iso, next.year, next.monthIndex),
                      );
                    }}
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="mt-1 text-sm text-soma-ink-secondary">{t("overview.calendarHint")}</p>
              <p className="sr-only">{t("overview.calendarHelp")}</p>
              <MonthGrid
                year={calYear}
                monthIndex={calMonth}
                marked={markedDays}
                selectedIso={visibleSelectedDay}
                todayIso={today}
                locale={i18n.language}
                formatCivil={formatCivil}
                onSelect={setSelectedDay}
              />
              {markedDays.size === 0 ? (
                <p className="mt-3 text-sm text-soma-ink-muted">
                  {t("overview.calendarMonthEmpty")}
                </p>
              ) : null}
              {visibleSelectedDay ? (
                <div className="mt-4 border-t border-soma-line pt-3">
                  <DayEntries
                    iso={visibleSelectedDay}
                    entries={selectedDayEntries}
                    formatCivil={formatCivil}
                    onOpen={(item) => setSheet({ kind: "view", entry: item })}
                    onEdit={(item) => {
                      setSaveError(null);
                      setSheet({ kind: "edit", entry: item });
                    }}
                  />
                </div>
              ) : null}
            </section>
            <div className="grid min-w-0 gap-4">
              <section className={cardClass}>
                <SectionTitle
                  icon={<BookOpen className="h-4 w-4" />}
                  title={t("overview.lastTitle")}
                />
                {last ? (
                  <LastEntryCard
                    entry={last}
                    formatCivil={formatCivil}
                    onOpen={(item) => setSheet({ kind: "view", entry: item })}
                  />
                ) : (
                  <p className="mt-3 text-sm text-soma-ink-muted">{t("overview.lastEmpty")}</p>
                )}
              </section>
              <section className={`${cardClass} flex flex-col`}>
                <div className="flex items-start justify-between gap-2">
                  <SectionTitle
                    icon={<Quote className="h-4 w-4" />}
                    title={t("overview.highlightsTitle")}
                  />
                  <button
                    type="button"
                    onClick={() => setTab("notes")}
                    className={`${previewFocus} shrink-0 text-sm text-soma-action`}
                  >
                    {t("overview.seeAll")}
                  </button>
                </div>
                {highlights[0] ? (
                  <HighlightQuote
                    entry={highlights[0]}
                    formatCivil={formatCivil}
                    onOpen={() => setSheet({ kind: "view", entry: highlights[0] })}
                  />
                ) : (
                  <p className="mt-3 text-sm text-soma-ink-muted">
                    {t("overview.highlightsEmpty")}
                  </p>
                )}
              </section>
            </div>
          </div>

          <section className={cardClass}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <SectionTitle
                  icon={<Flag className="h-4 w-4" />}
                  title={t("overview.milestonesTitle")}
                />
                <p className="mt-1 text-sm text-soma-ink-secondary">
                  {t("overview.milestonesHint")}
                </p>
                <p className="sr-only">{t("overview.milestonesHelp")}</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSheet({ kind: "milestones" })}
                  className={`${previewFocus} text-sm text-soma-action`}
                >
                  {t("overview.milestonesSeeAll")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSaveError(null);
                    setSheet({ kind: "milestone-create" });
                  }}
                  className={`${previewFocus} text-sm text-soma-action`}
                >
                  {t("overview.milestonesAdd")}
                </button>
              </div>
            </div>
            {milestones.length === 0 ? (
              <p className="mt-3 text-sm text-soma-ink-muted">{t("overview.milestonesEmpty")}</p>
            ) : (
              <div className="mt-5 overflow-x-auto pb-1">
                <div
                  className="relative lg:min-w-0"
                  style={{ minWidth: `${Math.max(milestones.slice(0, 6).length, 1) * 6.5}rem` }}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-[8%] right-[8%] top-8 h-px bg-[rgb(var(--soma-line-strong)/0.85)]"
                  />
                  <ol
                    className="relative z-10 grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(milestones.length, 6)}, minmax(0, 1fr))`,
                    }}
                  >
                    {milestones.slice(0, 6).map((item) => {
                      const style = MILESTONE_STYLE[item.kind] ?? MILESTONE_STYLE.clarity;
                      const Icon = style.icon;
                      return (
                        <li key={item.id} className="text-center">
                          <button
                            type="button"
                            onClick={() => setSheet({ kind: "milestone-edit", milestone: item })}
                            className={`${previewFocus} flex w-full flex-col items-center gap-2 rounded-xl px-1 py-2`}
                          >
                            <span
                              className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-soma-surface"
                              style={{ color: style.color, boxShadow: `0 0 0 6px ${style.color}22` }}
                            >
                              <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <span className="text-sm font-medium leading-snug text-soma-ink">
                              {isJournalMilestoneKind(item.kind)
                                ? t(`milestones.kinds.${item.kind}`)
                                : item.kind}
                            </span>
                            <span className="text-[11px] text-soma-ink-muted">
                              {formatCivil(item.occurredOn)}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            )}
          </section>

          <section className={cardClass}>
            <div className="flex items-center justify-between gap-2">
              <SectionTitle
                icon={<Lightbulb className="h-4 w-4" />}
                title={t("overview.learningsTitle")}
              />
              <button
                type="button"
                onClick={() => setTab("notes")}
                className={`${previewFocus} text-sm text-soma-action`}
              >
                {t("overview.seeAll")}
              </button>
            </div>
            {learnings.length === 0 ? (
              <p className="mt-3 text-sm text-soma-ink-muted">{t("overview.learningsEmpty")}</p>
            ) : (
              <ul className="mt-3 divide-y divide-soma-line">
                {learnings.slice(0, 4).map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSheet({ kind: "view", entry: item })}
                      className={`${previewFocus} flex w-full items-start gap-3 py-3 text-left`}
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-soma-action" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-soma-ink">
                          {entryPreview(item, t("entries.untitled"))}
                        </span>
                        <span className="mt-1 block text-xs text-soma-ink-muted">
                          {formatCivil(item.occurredOn)}
                        </span>
                      </span>
                      <ChevronRight className="mt-1 h-4 w-4 text-soma-ink-muted" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      {!loading && !error && tab === "entries" ? (
        <EntryHistory
          entries={historyEntries}
          totalUnfiltered={live ? undefined : entries.length}
          filtersActive={filtersActive}
          filterFrom={filterFrom}
          filterTo={filterTo}
          filterHighlighted={filterHighlighted}
          filterLearning={filterLearning}
          onFilterFrom={setFilterFrom}
          onFilterTo={setFilterTo}
          onFilterHighlighted={setFilterHighlighted}
          onFilterLearning={setFilterLearning}
          onClearFilters={() => {
            setFilterFrom("");
            setFilterTo("");
            setFilterHighlighted(false);
            setFilterLearning(false);
          }}
          loading={live && listLoading}
          loadingMore={live && listMoreLoading}
          error={live && listError}
          hasMore={historyHasMore}
          formatCivil={formatCivil}
          onOpen={(item) => setSheet({ kind: "view", entry: item })}
          onLoadMore={() => {
            if (live) void loadHistoryPage("more");
            else setDemoListLimit((count) => count + JOURNAL_DEMO_LIST_PAGE_SIZE);
          }}
        />
      ) : null}

      {!loading && !error && tab === "emotions" ? (
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <section className={cardClass}>
            <SectionTitle icon={<Smile className="h-4 w-4" />} title={t("overview.emotionsTitle")} />
            <p className="mt-1 text-sm text-soma-ink-secondary">{t("emotionsTab.hint")}</p>
            <p className="mt-1 text-sm text-soma-ink-muted">{t("emotionsTab.help")}</p>
            <FrequencyBars
              items={emotions}
              empty={t("overview.emotionsEmpty")}
              labelKey="emotions"
              styles={EMOTION_STYLE}
              selectedId={tagPick?.kind === "emotion" ? tagPick.id : null}
              onSelect={(id) => {
                setTagListLimit(JOURNAL_TAG_ENTRY_PAGE);
                setTagPick((current) =>
                  current?.kind === "emotion" && current.id === id
                    ? null
                    : { kind: "emotion", id: id as JournalEmotionId },
                );
              }}
            />
          </section>
          <section className={cardClass}>
            <SectionTitle icon={<Flag className="h-4 w-4" />} title={t("emotionsTab.triggersTitle")} />
            <p className="mt-1 text-sm text-soma-ink-secondary">{t("emotionsTab.hint")}</p>
            <p className="mt-1 text-sm text-soma-ink-muted">{t("emotionsTab.help")}</p>
            <FrequencyBars
              items={triggers}
              empty={t("emotionsTab.triggersEmpty")}
              labelKey="triggers"
              styles={TRIGGER_STYLE}
              selectedId={tagPick?.kind === "trigger" ? tagPick.id : null}
              onSelect={(id) => {
                setTagListLimit(JOURNAL_TAG_ENTRY_PAGE);
                setTagPick((current) =>
                  current?.kind === "trigger" && current.id === id
                    ? null
                    : { kind: "trigger", id: id as JournalTriggerId },
                );
              }}
            />
          </section>
          <section className={`${cardClass} lg:col-span-2`}>
            {tagPick ? (
              <>
                <h2 className="text-lg font-semibold text-soma-ink">
                  {t("emotionsTab.relatedTitle", {
                    label:
                      tagPick.kind === "emotion"
                        ? t(`emotions.${tagPick.id}`)
                        : t(`triggers.${tagPick.id}`),
                  })}
                </h2>
                {taggedEntries.length === 0 ? (
                  <p className="mt-3 text-sm text-soma-ink-muted">
                    {t("emotionsTab.relatedEmpty")}
                  </p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-2">
                    {taggedEntries.slice(0, tagListLimit).map((item) => (
                      <li key={item.id}>
                        <EntryRow
                          entry={item}
                          formatCivil={formatCivil}
                          onOpen={(row) => setSheet({ kind: "view", entry: row })}
                          compact
                        />
                      </li>
                    ))}
                  </ul>
                )}
                {taggedEntries.length > tagListLimit ? (
                  <button
                    type="button"
                    onClick={() =>
                      setTagListLimit((count) => count + JOURNAL_TAG_ENTRY_PAGE)
                    }
                    className={`${previewFocus} mt-3 min-h-11 text-sm text-soma-action`}
                  >
                    {t("entries.loadMore")}
                  </button>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-soma-ink-secondary">{t("emotionsTab.selectHint")}</p>
            )}
          </section>
        </div>
      ) : null}

      {!loading && !error && tab === "patterns" ? (
        <div className="grid min-w-0 gap-4">
          <section className={cardClass}>
            <SectionTitle
              icon={<Waves className="h-4 w-4" />}
              title={t("patterns.evolutionTitle")}
            />
            <p className="mt-1 text-sm text-soma-ink-secondary">
              {t("patterns.evolutionHint")}
            </p>
            <p className="mt-1 text-sm text-soma-ink-muted">{t("patterns.evolutionHelp")}</p>
            <div className="mt-4 flex flex-col gap-3">
              <SegmentedControl
                label={t("patterns.scaleLabel")}
                value={patternScale}
                options={JOURNAL_SCALE_IDS.map((id) => ({
                  id,
                  label: t(`patterns.scales.${id}`),
                }))}
                onChange={setPatternScale}
              />
              <SegmentedControl
                label={t("patterns.windowLabel")}
                value={String(patternWindow)}
                options={JOURNAL_TREND_WINDOWS.map((id) => ({
                  id: String(id),
                  label:
                    id === 28
                      ? t("patterns.window28")
                      : id === 90
                        ? t("patterns.window90")
                        : t("patterns.windowAll"),
                }))}
                onChange={(id) =>
                  setPatternWindow(id === "all" ? "all" : (Number(id) as 28 | 90))
                }
              />
            </div>
            <p className="mt-3 text-sm text-soma-ink-secondary">
              {t("patterns.daysCounted", { count: patternPoints.length })}
            </p>
            <ValueChart
              points={patternPoints}
              min={patternRange.min}
              max={patternRange.max}
              formatCivilShort={formatCivilShort}
              empty={patternEmpty}
            />
          </section>
          <section className={cardClass}>
            <SectionTitle
              icon={<Sparkles className="h-4 w-4" />}
              title={t("patterns.coincidencesTitle")}
            />
            <p className="mt-1 text-sm text-soma-ink-muted">
              {t("patterns.coincidencesHint")}
            </p>
            {coincidences.length === 0 ? (
              <p className="mt-3 text-sm text-soma-ink-secondary">
                {t("patterns.coincidencesEmpty")}
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {coincidences.map((row) => (
                  <li
                    key={`${row.emotionId}-${row.triggerId}`}
                    className="rounded-xl bg-soma-raised px-3 py-2 text-sm text-soma-ink"
                  >
                    {t("patterns.coincidencesItem", {
                      emotion: t(`emotions.${row.emotionId}`),
                      trigger: t(`triggers.${row.triggerId}`),
                      count: row.count,
                    })}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      {!loading && !error && tab === "notes" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <NoteList
            title={t("notes.highlights")}
            empty={t("overview.highlightsEmpty")}
            entries={highlights}
            formatCivil={formatCivil}
            onOpen={(item) => setSheet({ kind: "view", entry: item })}
          />
          <NoteList
            title={t("notes.learnings")}
            empty={t("overview.learningsEmpty")}
            entries={learnings}
            formatCivil={formatCivil}
            onOpen={(item) => setSheet({ kind: "view", entry: item })}
          />
        </div>
      ) : null}

      {sheet ? (
        <DetailSheet
          title={sheetTitle(sheet, t)}
          size="article"
          onClose={() => {
            if (deleting) return;
            setConfirmDelete(false);
            setDeleteError(null);
            setSheet(null);
          }}
        >
          {sheet.kind === "view" ? (
            <EntryDetail
              entry={sheet.entry}
              formatCivil={formatCivil}
              confirmDelete={confirmDelete}
              deleting={deleting}
              deleteError={deleteError}
              onEdit={() => {
                setSaveError(null);
                setConfirmDelete(false);
                setDeleteError(null);
                setSheet({ kind: "edit", entry: sheet.entry });
              }}
              onAskDelete={() => {
                if (deleting) return;
                setDeleteError(null);
                setConfirmDelete(true);
              }}
              onCancelDelete={() => {
                if (deleting) return;
                setConfirmDelete(false);
                setDeleteError(null);
              }}
              onConfirmDelete={() => void handleDeleteEntry(sheet.entry.id)}
            />
          ) : null}
          {sheet.kind === "create" || sheet.kind === "edit" ? (
            <JournalEntryForm
              entry={sheet.kind === "edit" ? sheet.entry : null}
              substances={substances ?? []}
              saving={saving}
              error={saveError}
              onSubmit={(draft) => void handleSave(draft)}
              onCancel={() => setSheet(null)}
            />
          ) : null}
          {sheet.kind === "day" ? (
            <DayEntries
              iso={sheet.iso}
              entries={entriesOnDay(calendarRows, sheet.iso)}
              formatCivil={formatCivil}
              onOpen={(item) => setSheet({ kind: "view", entry: item })}
              onEdit={(item) => {
                setSaveError(null);
                setSheet({ kind: "edit", entry: item });
              }}
            />
          ) : null}
          {sheet.kind === "milestone-create" || sheet.kind === "milestone-edit" ? (
            <MilestoneForm
              milestone={sheet.kind === "milestone-edit" ? sheet.milestone : null}
              saving={saving}
              error={saveError}
              onSubmit={(draft) => void handleMilestoneSave(draft)}
              onCancel={() => setSheet(null)}
              onDelete={
                sheet.kind === "milestone-edit"
                  ? () => void handleMilestoneDelete(sheet.milestone.id)
                  : undefined
              }
            />
          ) : null}
          {sheet.kind === "milestones" ? (
            <ul className="flex flex-col divide-y divide-soma-line">
              {milestones.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSheet({ kind: "milestone-edit", milestone: item })}
                    className={`${previewFocus} flex w-full flex-col gap-1 py-3 text-left`}
                  >
                    <span className="font-medium text-soma-ink">
                      {isJournalMilestoneKind(item.kind)
                        ? t(`milestones.kinds.${item.kind}`)
                        : item.kind}
                    </span>
                    <span className="text-xs text-soma-ink-muted">
                      {formatCivil(item.occurredOn)}
                    </span>
                    {item.note ? <span className="text-sm">{item.note}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </DetailSheet>
      ) : null}
    </div>
  );
}

function sheetTitle(
  sheet: Sheet,
  t: (key: string) => string,
): string {
  if (sheet.kind === "create") return t("form.createTitle");
  if (sheet.kind === "edit") return t("form.editTitle");
  if (sheet.kind === "view") return t("form.detailTitle");
  if (sheet.kind === "day") return t("overview.calendarTitle");
  if (sheet.kind === "milestone-create") return t("milestones.createTitle");
  if (sheet.kind === "milestone-edit") return t("milestones.editTitle");
  return t("overview.milestonesTitle");
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-semibold text-soma-ink">
      <span className="shrink-0 text-soma-action" aria-hidden="true">
        {icon}
      </span>
      {title}
    </h2>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  hint,
  help,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  help?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-soma-line bg-soma-surface px-4 py-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-soma-raised text-soma-action">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-soma-ink-muted">
          {label}
        </dt>
        <dd className="text-2xl font-semibold tabular-nums text-soma-ink">{value}</dd>
        <p className="text-[11px] leading-snug text-soma-ink-secondary">{hint}</p>
        {help ? <p className="sr-only">{help}</p> : null}
      </div>
    </div>
  );
}

function EntryHistory({
  entries,
  totalUnfiltered,
  filtersActive,
  filterFrom,
  filterTo,
  filterHighlighted,
  filterLearning,
  onFilterFrom,
  onFilterTo,
  onFilterHighlighted,
  onFilterLearning,
  onClearFilters,
  loading,
  loadingMore,
  error,
  hasMore,
  formatCivil,
  onOpen,
  onLoadMore,
}: {
  entries: readonly JournalEntry[];
  totalUnfiltered?: number;
  filtersActive: boolean;
  filterFrom: string;
  filterTo: string;
  filterHighlighted: boolean;
  filterLearning: boolean;
  onFilterFrom: (value: string) => void;
  onFilterTo: (value: string) => void;
  onFilterHighlighted: (value: boolean) => void;
  onFilterLearning: (value: boolean) => void;
  onClearFilters: () => void;
  loading: boolean;
  loadingMore: boolean;
  error: boolean;
  hasMore: boolean;
  formatCivil: (iso: string) => string;
  onOpen: (entry: JournalEntry) => void;
  onLoadMore: () => void;
}) {
  const { t } = useTranslation("journal");
  const emptyMessage =
    filtersActive || (totalUnfiltered !== undefined && totalUnfiltered > 0)
      ? t("entries.filterEmpty")
      : t("entries.empty");
  return (
    <div className="flex flex-col gap-4">
      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-soma-ink">{t("entries.filtersTitle")}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-1 text-sm">
            <span>{t("entries.filterFrom")}</span>
            <input
              type="date"
              value={filterFrom}
              onChange={(event) => onFilterFrom(event.target.value)}
              className={`${previewFocus} min-h-11 rounded-xl border border-soma-line bg-soma-raised px-3 py-2 text-soma-ink`}
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1 text-sm">
            <span>{t("entries.filterTo")}</span>
            <input
              type="date"
              value={filterTo}
              onChange={(event) => onFilterTo(event.target.value)}
              className={`${previewFocus} min-h-11 rounded-xl border border-soma-line bg-soma-raised px-3 py-2 text-soma-ink`}
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filterHighlighted}
              onChange={(event) => onFilterHighlighted(event.target.checked)}
            />
            {t("entries.filterHighlighted")}
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filterLearning}
              onChange={(event) => onFilterLearning(event.target.checked)}
            />
            {t("entries.filterLearning")}
          </label>
          {filtersActive ? (
            <button
              type="button"
              onClick={onClearFilters}
              className={`${previewFocus} min-h-11 text-sm text-soma-action`}
            >
              {t("entries.filterClear")}
            </button>
          ) : null}
        </div>
      </section>
      {error ? (
        <p className={`${cardClass} text-sm text-soma-ink-secondary`} role="alert">
          {t("error")}
        </p>
      ) : loading ? (
        <p className={`${cardClass} text-sm text-soma-ink-secondary`} aria-live="polite">
          {t("loading")}
        </p>
      ) : entries.length === 0 ? (
        <p className={`${cardClass} text-sm text-soma-ink-secondary`}>{emptyMessage}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((item) => (
            <li key={item.id} className={cardClass}>
              <EntryRow entry={item} formatCivil={formatCivil} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      )}
      {hasMore && !loading && !error ? (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className={`${previewFocus} min-h-11 self-center rounded-full bg-soma-raised px-4 text-sm font-medium text-soma-ink`}
        >
          {loadingMore ? t("entries.loadingMore") : t("entries.loadMore")}
        </button>
      ) : null}
      {loadingMore ? (
        <p className="sr-only" aria-live="polite">
          {t("entries.loadingMore")}
        </p>
      ) : null}
    </div>
  );
}

function NoteList({
  title,
  empty,
  entries,
  formatCivil,
  onOpen,
}: {
  title: string;
  empty: string;
  entries: readonly JournalEntry[];
  formatCivil: (iso: string) => string;
  onOpen: (entry: JournalEntry) => void;
}) {
  return (
    <section className={cardClass}>
      <h2 className="text-lg font-semibold text-soma-ink">{title}</h2>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-soma-ink-muted">{empty}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {entries.map((item) => (
            <li key={item.id}>
              <EntryRow entry={item} formatCivil={formatCivil} onOpen={onOpen} compact />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmotionBars({
  emotions,
  empty,
}: {
  emotions: ReturnType<typeof emotionFrequencies>;
  empty: string;
}) {
  return (
    <FrequencyBars
      items={emotions}
      empty={empty}
      labelKey="emotions"
      styles={EMOTION_STYLE}
    />
  );
}

function FrequencyBars({
  items,
  empty,
  labelKey,
  styles,
  selectedId,
  onSelect,
}: {
  items: readonly { id: string; percent: number }[];
  empty: string;
  labelKey: "emotions" | "triggers";
  styles: Record<string, { icon: typeof Sun; color: string }>;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const { t } = useTranslation("journal");
  if (items.length === 0) {
    return <p className="mt-4 text-sm text-soma-ink-muted">{empty}</p>;
  }
  return (
    <ul className="mt-4 flex flex-col gap-3">
      {items.map((item) => {
        const style = styles[item.id] ?? EMOTION_STYLE.calm;
        const Icon = style.icon;
        const label = t(`${labelKey}.${item.id}`);
        const selected = selectedId === item.id;
        const body = (
          <>
            <span className="flex min-w-0 items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-soma-ink">
                <Icon className="h-4 w-4 shrink-0" style={{ color: style.color }} aria-hidden="true" />
                {label}
              </span>
              <span className="tabular-nums text-soma-ink-muted">{item.percent}%</span>
            </span>
            <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-soma-line">
              <span
                className="block h-full rounded-full"
                style={{ width: `${item.percent}%`, background: style.color }}
              />
            </span>
          </>
        );
        return (
          <li key={item.id}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-pressed={selected}
                className={`${previewFocus} w-full rounded-xl p-2 text-left ${
                  selected ? "bg-soma-raised" : ""
                }`}
              >
                {body}
              </button>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}

function LastEntryCard({
  entry,
  formatCivil,
  onOpen,
}: {
  entry: JournalEntry;
  formatCivil: (iso: string) => string;
  onOpen: (entry: JournalEntry) => void;
}) {
  const { t } = useTranslation("journal");
  return (
    <article className="mt-4 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-stretch">
      <img
        src={JOURNAL_LAST_IMAGE}
        alt={t("overview.lastPhotoHint")}
        width={320}
        height={220}
        draggable={false}
        className="h-44 w-full shrink-0 rounded-2xl object-cover sm:h-auto sm:min-h-[11rem] sm:w-[42%] lg:min-h-[13rem]"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-xs text-soma-ink-muted">{formatCivil(entry.occurredOn)}</p>
        <h3 className="mt-1 text-base font-semibold leading-snug text-soma-ink sm:text-lg">
          {entryPreview(entry, t("entries.untitled"))}
        </h3>
        {entry.body && entry.title ? (
          <p className="mt-2 line-clamp-5 text-sm leading-relaxed text-soma-ink-secondary">
            {entry.body}
          </p>
        ) : null}
        {entry.emotionIds.length > 0 ? (
          <p className="mt-3 flex flex-wrap gap-1">
            {entry.emotionIds.slice(0, 4).map((id) => (
              <span
                key={id}
                className="rounded-full bg-soma-raised px-2 py-0.5 text-[11px] text-soma-ink-secondary"
              >
                {t(`emotions.${id}`)}
              </span>
            ))}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => onOpen(entry)}
          className={`${previewFocus} mt-auto pt-3 text-left text-sm text-soma-action`}
        >
          {t("entries.open")}
        </button>
      </div>
    </article>
  );
}

function HighlightQuote({
  entry,
  formatCivil,
  onOpen,
}: {
  entry: JournalEntry;
  formatCivil: (iso: string) => string;
  onOpen: () => void;
}) {
  const { t } = useTranslation("journal");
  const quote = entry.body?.trim() || entryPreview(entry, t("entries.untitled"));
  return (
    <blockquote className="mt-4 flex min-h-[10rem] flex-1 flex-col">
      <span aria-hidden="true" className="font-serif text-4xl leading-none" style={accentColor}>
        “
      </span>
      <p className="mt-2 line-clamp-6 text-base font-medium leading-relaxed text-soma-ink sm:text-lg">
        {quote}
      </p>
      <footer className="mt-auto flex items-end justify-between gap-3 pt-4">
        <cite className="text-xs not-italic text-soma-ink-muted">{formatCivil(entry.occurredOn)}</cite>
        <button type="button" onClick={onOpen} className={`${previewFocus} text-sm text-soma-action`}>
          {t("entries.open")}
        </button>
      </footer>
    </blockquote>
  );
}

function EntryRow({
  entry,
  formatCivil,
  onOpen,
  compact = false,
}: {
  entry: JournalEntry;
  formatCivil: (iso: string) => string;
  onOpen: (entry: JournalEntry) => void;
  compact?: boolean;
}) {
  const { t } = useTranslation("journal");
  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      className={`${previewFocus} mt-3 flex w-full min-w-0 items-start gap-3 rounded-xl text-left`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs text-soma-ink-muted">{formatCivil(entry.occurredOn)}</p>
        <p className="mt-1 font-medium text-soma-ink">
          {entryPreview(entry, t("entries.untitled"))}
        </p>
        {!compact && entry.body && entry.title ? (
          <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-soma-ink-secondary">
            {entry.body}
          </p>
        ) : null}
        {!compact && entry.emotionIds.length > 0 ? (
          <p className="mt-2 flex flex-wrap gap-1">
            {entry.emotionIds.slice(0, 3).map((id) => (
              <span
                key={id}
                className="rounded-full bg-soma-raised px-2 py-0.5 text-[11px] text-soma-ink-secondary"
              >
                {t(`emotions.${id}`)}
              </span>
            ))}
          </p>
        ) : null}
      </div>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-soma-ink-muted" aria-hidden="true" />
      <span className="sr-only">{t("entries.open")}</span>
    </button>
  );
}

function EntryDetail({
  entry,
  formatCivil,
  confirmDelete,
  deleting,
  deleteError,
  onEdit,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  entry: JournalEntry;
  formatCivil: (iso: string) => string;
  confirmDelete: boolean;
  deleting: boolean;
  deleteError: string | null;
  onEdit: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const { t } = useTranslation("journal");
  const askRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const hadConfirm = useRef(false);
  const confirmTitleId = useId();
  const confirmBodyId = useId();

  useEffect(() => {
    if (confirmDelete) {
      hadConfirm.current = true;
      confirmRef.current?.focus();
      return;
    }
    if (hadConfirm.current) {
      hadConfirm.current = false;
      askRef.current?.focus();
    }
  }, [confirmDelete]);

  return (
    <div className="flex flex-col gap-3 text-sm text-soma-ink-secondary">
      <p>{formatCivil(entry.occurredOn)}</p>
      <h3 className="text-lg font-semibold text-soma-ink">
        {entryPreview(entry, t("entries.untitled"))}
      </h3>
      {entry.body ? <p className="whitespace-pre-wrap leading-relaxed">{entry.body}</p> : null}
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onEdit}
          disabled={deleting}
          className={`${previewFocus} min-h-11 self-start rounded-full bg-soma-action px-4 font-semibold text-[#081018] disabled:opacity-50`}
        >
          {t("form.edit")}
        </button>
        {confirmDelete ? (
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={confirmTitleId}
            aria-describedby={confirmBodyId}
            aria-busy={deleting}
            className="w-full rounded-2xl border border-soma-organ-damaged/40 bg-soma-raised p-3"
          >
            <p id={confirmTitleId} className="font-medium text-soma-ink">
              {t("form.deleteConfirmTitle")}
            </p>
            <p id={confirmBodyId} className="mt-1 text-soma-ink-secondary">
              {t("form.deleteConfirmBody")}
            </p>
            {deleteError ? (
              <p className="mt-2 text-soma-organ-damaged" role="alert">
                {deleteError}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                ref={confirmRef}
                type="button"
                onClick={onConfirmDelete}
                disabled={deleting}
                aria-busy={deleting}
                className={`${previewFocus} min-h-11 rounded-full bg-soma-organ-damaged px-4 font-semibold text-[#081018] disabled:opacity-50`}
              >
                {deleting ? t("form.deleting") : t("form.deleteConfirm")}
              </button>
              <button
                type="button"
                onClick={onCancelDelete}
                disabled={deleting}
                className={`${previewFocus} min-h-11 rounded-full border border-soma-line bg-soma-surface px-4 text-soma-ink disabled:opacity-50`}
              >
                {t("form.deleteCancel")}
              </button>
            </div>
          </div>
        ) : (
          <button
            ref={askRef}
            type="button"
            onClick={onAskDelete}
            className={`${previewFocus} min-h-11 self-start rounded-full border border-soma-organ-damaged/50 px-4 text-soma-ink hover:bg-soma-raised`}
          >
            {t("form.delete")}
          </button>
        )}
      </div>
    </div>
  );
}

function DayEntries({
  iso,
  entries,
  formatCivil,
  onOpen,
  onEdit,
}: {
  iso: string;
  entries: readonly JournalEntry[];
  formatCivil: (iso: string) => string;
  onOpen: (entry: JournalEntry) => void;
  onEdit: (entry: JournalEntry) => void;
}) {
  const { t } = useTranslation("journal");
  return (
    <div>
      <p className="text-sm text-soma-ink-secondary">
        {t("overview.calendarDay", { date: formatCivil(iso) })}
      </p>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-soma-ink-muted">{t("entries.dayEmpty")}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {entries.map((item) => (
            <li key={item.id} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <EntryRow entry={item} formatCivil={formatCivil} onOpen={onOpen} compact />
              </div>
              <button
                type="button"
                onClick={() => onEdit(item)}
                className={`${previewFocus} mt-3 min-h-11 shrink-0 px-2 text-sm text-soma-action`}
              >
                {t("form.edit")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MonthGrid({
  year,
  monthIndex,
  marked,
  selectedIso,
  todayIso,
  locale,
  formatCivil,
  onSelect,
}: {
  year: number;
  monthIndex: number;
  marked: Set<string>;
  selectedIso: string | null;
  todayIso: string;
  locale: string;
  formatCivil: (iso: string) => string;
  onSelect: (iso: string) => void;
}) {
  const { t } = useTranslation("journal");
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const startWeekday = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(first);
  const weekdays = Array.from({ length: 7 }, (_, index) => {
    const utc = new Date(Date.UTC(2026, 0, 5 + index));
    return {
      short: new Intl.DateTimeFormat(locale, {
        weekday: "short",
        timeZone: "UTC",
      }).format(utc),
      long: new Intl.DateTimeFormat(locale, {
        weekday: "long",
        timeZone: "UTC",
      }).format(utc),
    };
  });
  const cells: Array<string | null> = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      const month = String(monthIndex + 1).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }),
  ];
  const weeks: Array<Array<string | null>> = [];
  for (let index = 0; index < cells.length; index += 7) {
    const row = cells.slice(index, index + 7);
    while (row.length < 7) row.push(null);
    weeks.push(row);
  }
  return (
    <div className="mt-4 w-full min-w-0 max-w-[22rem]">
      <table className="w-full table-fixed border-collapse text-center text-xs">
        <caption className="mb-3 caption-top text-left text-sm font-medium capitalize text-soma-ink">
          {monthLabel}
        </caption>
        <thead>
          <tr>
            {weekdays.map((day) => (
              <th
                key={day.long}
                scope="col"
                className="pb-1 font-medium text-soma-ink-muted"
              >
                <span aria-hidden="true">{day.short}</span>
                <span className="sr-only">{day.long}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={`week-${weekIndex}`}>
              {week.map((iso, dayIndex) => {
                if (!iso) {
                  return <td key={`e-${weekIndex}-${dayIndex}`} className="p-0.5" />;
                }
                const hasEntry = marked.has(iso);
                const selected = selectedIso === iso;
                const isToday = iso === todayIso;
                const day = Number(iso.slice(8));
                const status = hasEntry
                  ? t("overview.calendarHasEntry")
                  : t("overview.calendarNoEntry");
                const todayMark = isToday ? `. ${t("overview.calendarIsToday")}` : "";
                const selectedMark = selected
                  ? `. ${t("overview.calendarSelected")}`
                  : "";
                return (
                  <td key={iso} className="p-0.5">
                    <button
                      type="button"
                      onClick={() => onSelect(iso)}
                      aria-pressed={selected}
                      aria-current={isToday ? "date" : undefined}
                      aria-label={`${formatCivil(iso)}. ${status}${todayMark}${selectedMark}`}
                      className={`${previewFocus} flex min-h-11 w-full flex-col items-center justify-center rounded-xl ${
                        selected
                          ? "bg-soma-action font-semibold text-[#081018]"
                          : isToday
                            ? "ring-1 ring-soma-action text-soma-ink"
                            : hasEntry
                              ? "font-semibold text-soma-ink"
                              : "text-soma-ink-muted"
                      }`}
                    >
                      <span>{day}</span>
                      {hasEntry ? (
                        <span
                          className={`mt-0.5 h-1 w-1 rounded-full ${
                            selected ? "bg-[#081018]" : "bg-soma-action"
                          }`}
                          aria-hidden="true"
                        />
                      ) : (
                        <span className="mt-0.5 h-1 w-1" aria-hidden="true" />
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ValueChart({
  points,
  min,
  max,
  formatCivilShort,
  empty,
}: {
  points: readonly { occurredOn: string; value: number }[];
  min: number;
  max: number;
  formatCivilShort: (iso: string) => string;
  empty: string;
}) {
  if (points.length < 2) {
    return <p className="mt-4 text-sm text-soma-ink-muted">{empty}</p>;
  }
  const width = 800;
  const height = 240;
  const padL = 36;
  const padR = 18;
  const padT = 12;
  const padB = 32;
  const times = points.map((point) => Date.parse(`${point.occurredOn}T00:00:00.000Z`));
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  const span = Math.max(t1 - t0, 1);
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const coords = points.map((point, index) => {
    const x = padL + ((times[index] - t0) / span) * plotW;
    const y = padT + (1 - (point.value - min) / (max - min)) * plotH;
    return { x, y, point };
  });
  const ticks = [max, Math.round((max + min) / 2), min];
  const labelIndexes =
    coords.length <= 4
      ? coords.map((_, index) => index)
      : [0, Math.round((coords.length - 1) / 3), Math.round(((coords.length - 1) * 2) / 3), coords.length - 1];
  const uniqueLabelIndexes = [...new Set(labelIndexes)];
  const first = coords[0];
  const last = coords[coords.length - 1];
  const fillD = [
    `M ${first.x} ${padT + plotH}`,
    `L ${first.x} ${first.y}`,
    ...coords.slice(1).map((c) => `L ${c.x} ${c.y}`),
    `L ${last.x} ${padT + plotH}`,
    "Z",
  ].join(" ");
  return (
    <div className="mt-3 min-w-0">
      <svg
        className="block h-auto w-full text-soma-action"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="journal-chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((tick) => {
          const y = padT + (1 - (tick - min) / (max - min)) * plotH;
          return (
            <g key={tick}>
              <line
                x1={padL}
                x2={width - padR}
                y1={y}
                y2={y}
                stroke="rgb(var(--soma-line))"
                strokeWidth="1"
              />
              <text x={6} y={y + 3} fill="rgb(var(--soma-ink-muted))" fontSize="11">
                {tick}
              </text>
            </g>
          );
        })}
        <path d={fillD} fill="url(#journal-chart-fill)" />
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={coords.map((c) => `${c.x},${c.y}`).join(" ")}
        />
        {coords.map((c) => (
          <circle
            key={c.point.occurredOn + c.x}
            cx={c.x}
            cy={c.y}
            r="4"
            fill="currentColor"
          />
        ))}
        {uniqueLabelIndexes.map((index) => {
          const c = coords[index];
          const anchor = index === 0 ? "start" : index === coords.length - 1 ? "end" : "middle";
          return (
            <text
              key={`label-${c.point.occurredOn}-${index}`}
              x={c.x}
              y={height - 8}
              textAnchor={anchor}
              fill="rgb(var(--soma-ink-muted))"
              fontSize="11"
            >
              {formatCivilShort(c.point.occurredOn)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function MilestoneForm({
  milestone,
  saving,
  error,
  onSubmit,
  onCancel,
  onDelete,
}: {
  milestone: JournalMilestone | null;
  saving: boolean;
  error: string | null;
  onSubmit: (draft: JournalMilestoneWrite) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const { t } = useTranslation("journal");
  const [kind, setKind] = useState(milestone?.kind ?? "clarity");
  const [occurredOn, setOccurredOn] = useState(
    milestone?.occurredOn ?? localCivilDate(),
  );
  const [note, setNote] = useState(milestone?.note ?? "");
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          kind,
          occurredOn,
          note: note.trim() ? note : null,
        });
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        <span>{t("milestones.kind")}</span>
        <select
          value={kind}
          onChange={(event) => setKind(event.target.value)}
          className={`${previewFocus} rounded-xl border border-soma-line bg-soma-raised px-3 py-2 text-soma-ink`}
        >
          {JOURNAL_MILESTONE_KIND_IDS.map((id) => (
            <option key={id} value={id}>
              {t(`milestones.kinds.${id}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t("milestones.occurredOn")}</span>
        <input
          type="date"
          required
          value={occurredOn}
          onChange={(event) => setOccurredOn(event.target.value)}
          className={`${previewFocus} rounded-xl border border-soma-line bg-soma-raised px-3 py-2 text-soma-ink`}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t("milestones.note")}</span>
        <textarea
          rows={3}
          maxLength={JOURNAL_MILESTONE_NOTE_MAX}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className={`${previewFocus} rounded-xl border border-soma-line bg-soma-raised px-3 py-2 text-soma-ink`}
        />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className={`${previewFocus} min-h-11 rounded-full bg-soma-action px-4 font-semibold text-[#081018]`}
        >
          {t("milestones.save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`${previewFocus} min-h-11 rounded-full bg-soma-raised px-4 text-soma-ink-secondary`}
        >
          {t("milestones.cancel")}
        </button>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className={`${previewFocus} min-h-11 rounded-full px-4 text-soma-ink-secondary`}
          >
            {t("milestones.delete")}
          </button>
        ) : null}
      </div>
    </form>
  );
}
