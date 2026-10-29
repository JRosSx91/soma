import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
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
  countCompletedMissions,
  filterMissionsByCategory,
  FUTURE_MISSION_CATEGORY_IDS,
  groupMissionsByCategory,
  missionCopyPath,
  type MissionCategoryFilter,
} from "../../missions/missions-view.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import { previewFocus } from "../focus.js";
import { DetailSheet } from "../components/DetailSheet.js";
import { RecoveryHero } from "../components/RecoveryHero.js";
import { SegmentedControl } from "../components/SegmentedControl.js";
import { exploreEduHref } from "../explore/explore-edu-query.js";

const MISSIONS_HERO_IMAGE = "/images/decoration/nature-2.png";
const MISSIONS_HERO_OVERLAY =
  "linear-gradient(90deg, rgb(var(--soma-shell-rail) / 0.78) 0%, rgb(var(--soma-shell-rail) / 0.32) 38%, transparent 72%)";

const cardClass =
  "min-w-0 rounded-2xl border border-soma-line bg-soma-surface p-4 sm:p-5";
const accentColor = { color: "rgb(var(--soma-shell-accent))" };

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
  const [category, setCategory] = useState<MissionCategoryFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const rows = catalog.missions;
  const openMission = rows?.find((row) => row.id === openId) ?? null;

  useEffect(() => {
    setSelectedOptionId(null);
  }, [openId]);

  const summary = useMemo(
    () => countCompletedMissions(rows ?? []),
    [rows],
  );
  const visible = useMemo(
    () => filterMissionsByCategory(rows ?? [], category),
    [rows, category],
  );
  const grouped = useMemo(
    () => groupMissionsByCategory(rows ?? []),
    [rows],
  );

  const categoryOptions = useMemo(
    () => [
      { id: "all" as const, label: t("filterAll") },
      ...MISSION_CATEGORY_IDS.map((id) => ({
        id,
        label: t(`categories.${id}`),
      })),
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
    <div className="flex min-w-0 flex-col gap-5 pb-6">
      <RecoveryHero
        eyebrow={t("pageEyebrow")}
        title={t("pageTitle")}
        description={t("pageDescription")}
        quote={t("disclaimer")}
        demo={demo}
        imageSrc={MISSIONS_HERO_IMAGE}
        overlay={MISSIONS_HERO_OVERLAY}
      />

      {demo ? (
        <p className={`${cardClass} text-sm text-soma-ink-secondary`} role="note">
          {t("previewXpNote")}
        </p>
      ) : null}

      {loading ? (
        <p className={`${cardClass} text-sm text-soma-ink-secondary`}>{t("loading")}</p>
      ) : null}

      {loadFailed ? (
        <div className={cardClass}>
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
          <p className="text-sm text-soma-ink-secondary">
            {t("completedSummary", {
              completed: summary.completed,
              total: summary.total,
            })}
          </p>

          <SegmentedControl
            label={t("filterLabel")}
            value={category}
            options={categoryOptions}
            onChange={setCategory}
          />

          {rows == null || rows.length === 0 ? (
            <p className={`${cardClass} text-sm text-soma-ink-secondary`}>{t("emptyCatalog")}</p>
          ) : category === "all" ? (
            <div className="flex min-w-0 flex-col gap-6">
              {grouped.map((group) => (
                <CategoryBlock
                  key={group.categoryId}
                  categoryId={group.categoryId}
                  missions={group.missions}
                  onOpen={setOpenId}
                />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <FutureCategoryNote categoryId={category} />
          ) : (
            <ul className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              {visible.map((mission) => (
                <li key={mission.id} className="min-w-0">
                  <MissionCard mission={mission} onOpen={setOpenId} />
                </li>
              ))}
            </ul>
          )}
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

function CategoryBlock({
  categoryId,
  missions,
  onOpen,
}: {
  categoryId: MissionCategoryId;
  missions: MissionCatalogItem[];
  onOpen: (id: string) => void;
}) {
  const { t } = useTranslation("missions");
  return (
    <section className="min-w-0">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-soma-ink">
        {t(`categories.${categoryId}`)}
      </h2>
      {missions.length === 0 ? (
        <FutureCategoryNote categoryId={categoryId} />
      ) : (
        <ul className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          {missions.map((mission) => (
            <li key={mission.id} className="min-w-0">
              <MissionCard mission={mission} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FutureCategoryNote({ categoryId }: { categoryId: MissionCategoryId }) {
  const { t } = useTranslation("missions");
  const future = FUTURE_MISSION_CATEGORY_IDS.includes(categoryId);
  return (
    <p
      className={`${cardClass} text-sm text-soma-ink-muted`}
      role="note"
    >
      {future ? t("futureCategory") : t("emptyCategory")}
    </p>
  );
}

function MissionCard({
  mission,
  onOpen,
}: {
  mission: MissionCatalogItem;
  onOpen: (id: string) => void;
}) {
  const { t } = useTranslation("missions");
  const completed = mission.state === "completed";
  return (
    <article
      className={`${cardClass} flex h-full min-w-0 flex-col gap-3 motion-reduce:transition-none`}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.14em] text-soma-ink-muted"
          style={accentColor}
        >
          {t(`categories.${mission.categoryId}`)}
        </p>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            completed
              ? "bg-soma-raised text-soma-ink"
              : "border border-soma-line text-soma-ink-secondary"
          }`}
        >
          {completed ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
          {completed ? t("statusCompleted") : t("statusAvailable")}
        </span>
      </div>
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
    </article>
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
            className={`${previewFocus} inline-flex min-h-11 items-center text-sm text-soma-action hover:text-soma-action-hover`}
          >
            {t("readSheet")}
          </Link>
        ) : (
          <p className="text-sm text-soma-ink-muted" role="status">
            {t("sheetUnavailable")}
          </p>
        )}

        {completed ? (
          <p className="flex items-center gap-2 text-sm font-medium text-soma-ink" role="status">
            <Check className="h-4 w-4" aria-hidden="true" />
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
                  className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm leading-snug ${
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
          <div className="rounded-xl border border-soma-line bg-soma-raised/40 p-3" aria-live="polite" role="status">
            <p className="text-sm font-medium text-soma-ink">
              {result.correct ? t("answerCorrect") : t("answerIncorrect")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-soma-ink-secondary">
              {t(missionCopyPath(result.explainKey))}
            </p>
            {showXp ? (
              <p className="mt-2 text-sm text-soma-ink">{t("xpGranted", { count: result.xpGranted })}</p>
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
