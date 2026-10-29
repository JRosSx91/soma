import { useMemo, useState } from "react";
import { Bug, Lightbulb, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  FEEDBACK_CATEGORY_IDS,
  type FeedbackCategoryId,
  type FeedbackItem,
  type FeedbackStatusId,
} from "@soma/shared-types";
import { useAuth } from "../../auth/index.js";
import { useFeedback } from "../../feedback/useFeedback.js";
import type { FeedbackDraft } from "../../feedback/feedback-model.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import { previewFocus } from "../focus.js";
import { RecoveryHero } from "../components/RecoveryHero.js";

const FEEDBACK_HERO_IMAGE = "/images/decoration/nature-4.png";
const FEEDBACK_HERO_OVERLAY =
  "linear-gradient(90deg, rgb(var(--soma-shell-rail) / 0.88) 0%, rgb(var(--soma-shell-rail) / 0.42) 38%, rgb(var(--soma-shell-rail) / 0.1) 62%, transparent 82%)";

const panelClass =
  "min-w-0 rounded-2xl border border-soma-line bg-soma-surface/90 p-4 sm:p-5";
const accentColor = { color: "rgb(var(--soma-shell-accent))" };

const CATEGORY_ICON = {
  bug: Bug,
  suggestion: Lightbulb,
  general: MessageCircle,
} as const;

export function FeedbackPage() {
  const { t, i18n } = useTranslation("feedback");
  const base = useShellBase();
  const { user, loading: authLoading } = useAuth();
  const demo = base === "/preview";
  const live = base === "/app" && Boolean(user);
  const catalog = useFeedback({
    live,
    userId: live ? (user?.id ?? null) : null,
  });
  const [category, setCategory] = useState<FeedbackCategoryId | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const draft: FeedbackDraft = { category, title, body };
  const loading = (base === "/app" && authLoading) || catalog.state === "loading";
  const loadFailed = catalog.state === "error";
  const dateLocale = i18n.resolvedLanguage ?? i18n.language ?? "en";

  async function handleSubmit() {
    if (catalog.submitting || demo || !live) return;
    const result = await catalog.submit(draft);
    if (result) {
      setTitle("");
      setBody("");
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 pb-8">
      <RecoveryHero
        eyebrow={t("eyebrow")}
        title={t("headline")}
        description={t("intro")}
        quote={null}
        demo={demo}
        imageSrc={FEEDBACK_HERO_IMAGE}
        overlay={FEEDBACK_HERO_OVERLAY}
      />

      <p className="text-sm leading-relaxed text-soma-ink-secondary">{t("privacy")}</p>

      {demo ? (
        <p className={`${panelClass} text-sm text-soma-ink-secondary`} role="note">
          {t("demoNotice")}
        </p>
      ) : null}

      <form
        className={panelClass}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
        noValidate
      >
        <fieldset disabled={catalog.submitting || demo} className="min-w-0">
          <legend className="text-sm font-semibold text-soma-ink">
            {t("categoriesLabel")}
          </legend>
          <div
            role="radiogroup"
            aria-labelledby="feedback-categories-label"
            aria-describedby={catalog.fieldErrors.includes("category") ? "feedback-category-error" : undefined}
            className="mt-3 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3"
          >
            <span id="feedback-categories-label" className="sr-only">
              {t("categoriesLabel")}
            </span>
            {FEEDBACK_CATEGORY_IDS.map((id) => {
              const selected = category === id;
              const Icon = CATEGORY_ICON[id];
              return (
                <label
                  key={id}
                  className={`flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 text-sm motion-safe:transition-colors motion-reduce:transition-none ${
                    selected
                      ? "border-soma-action bg-soma-raised text-soma-ink"
                      : "border-soma-line text-soma-ink-secondary hover:bg-soma-raised/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="feedback-category"
                    value={id}
                    checked={selected}
                    onChange={() => setCategory(id)}
                    className={previewFocus}
                  />
                  <Icon className="h-4 w-4 shrink-0" style={accentColor} aria-hidden="true" />
                  <span className="min-w-0 font-medium">{t(`categories.${id}`)}</span>
                </label>
              );
            })}
          </div>
          {catalog.fieldErrors.includes("category") ? (
            <p id="feedback-category-error" className="mt-2 text-sm text-soma-ink-secondary" role="alert">
              {t("errors.category")}
            </p>
          ) : null}

          <label className="mt-5 block min-w-0">
            <span className="text-sm font-semibold text-soma-ink">{t("titleLabel")}</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("titlePlaceholder")}
              maxLength={80}
              aria-invalid={catalog.fieldErrors.includes("title")}
              aria-describedby={catalog.fieldErrors.includes("title") ? "feedback-title-error" : undefined}
              className={`${previewFocus} mt-2 min-h-11 w-full rounded-xl border border-soma-line bg-soma-raised/40 px-3 text-sm text-soma-ink placeholder:text-soma-ink-muted`}
            />
          </label>
          {catalog.fieldErrors.includes("title") ? (
            <p id="feedback-title-error" className="mt-2 text-sm text-soma-ink-secondary" role="alert">
              {t("errors.title")}
            </p>
          ) : null}

          <label className="mt-5 block min-w-0">
            <span className="text-sm font-semibold text-soma-ink">{t("bodyLabel")}</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={t("bodyPlaceholder")}
              rows={5}
              maxLength={4000}
              aria-invalid={catalog.fieldErrors.includes("body")}
              aria-describedby={catalog.fieldErrors.includes("body") ? "feedback-body-error" : undefined}
              className={`${previewFocus} mt-2 w-full rounded-xl border border-soma-line bg-soma-raised/40 px-3 py-2 text-sm leading-relaxed text-soma-ink placeholder:text-soma-ink-muted`}
            />
          </label>
          {catalog.fieldErrors.includes("body") ? (
            <p id="feedback-body-error" className="mt-2 text-sm text-soma-ink-secondary" role="alert">
              {t("errors.body")}
            </p>
          ) : null}
        </fieldset>

        <button
          type="submit"
          disabled={catalog.submitting || demo || !live}
          className={`${previewFocus} mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-soma-action px-4 text-sm font-semibold text-[#081018] disabled:opacity-60`}
        >
          {catalog.submitting ? t("submitting") : t("submit")}
        </button>
      </form>

      {catalog.lastSubmit ? (
        <p className={`${panelClass} text-sm text-soma-ink`} role="status">
          {catalog.lastSubmit.kind === "duplicate" ? t("duplicate") : t("confirmation")}
        </p>
      ) : null}

      {catalog.submitError ? (
        <div className={panelClass} role="alert">
          <p className="text-sm text-soma-ink-secondary">{t("errors.network")}</p>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            className={`${previewFocus} mt-3 min-h-11 rounded-full bg-soma-action px-4 text-sm font-semibold text-[#081018]`}
          >
            {t("retry")}
          </button>
        </div>
      ) : null}

      <section className="min-w-0" aria-labelledby="feedback-history">
        <h2 id="feedback-history" className="text-lg font-semibold text-soma-ink">
          {t("historyTitle")}
        </h2>
        <p className="mt-1 text-sm text-soma-ink-secondary">{t("historyHint")}</p>

        {loading ? (
          <p className={`${panelClass} mt-4 text-sm text-soma-ink-secondary`} role="status">
            {t("loading")}
          </p>
        ) : null}

        {loadFailed ? (
          <div className={`${panelClass} mt-4`} role="alert">
            <p className="text-sm text-soma-ink-secondary">{t("errors.load")}</p>
            <button
              type="button"
              onClick={() => catalog.reload()}
              className={`${previewFocus} mt-3 min-h-11 rounded-full bg-soma-action px-4 text-sm font-semibold text-[#081018]`}
            >
              {t("retry")}
            </button>
          </div>
        ) : null}

        {!loading && !loadFailed && catalog.items.length === 0 ? (
          <p className={`${panelClass} mt-4 text-sm text-soma-ink-secondary`}>{t("empty")}</p>
        ) : null}

        {!loading && !loadFailed && catalog.items.length > 0 ? (
          <ul className="mt-4 flex min-w-0 flex-col gap-3">
            {catalog.items.map((item) => (
              <li key={item.id} className="min-w-0">
                <HistoryCard
                  item={item}
                  locale={dateLocale}
                  expanded={openId === item.id}
                  onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
                />
              </li>
            ))}
          </ul>
        ) : null}

        {catalog.nextCursor ? (
          <button
            type="button"
            onClick={() => void catalog.loadMore()}
            disabled={catalog.loadingMore}
            className={`${previewFocus} mt-4 min-h-11 rounded-full border border-soma-line bg-soma-surface px-4 text-sm font-semibold text-soma-ink disabled:opacity-60`}
          >
            {catalog.loadingMore ? t("loadingMore") : t("loadMore")}
          </button>
        ) : null}
      </section>
    </div>
  );
}

function HistoryCard({
  item,
  locale,
  expanded,
  onToggle,
}: {
  item: FeedbackItem;
  locale: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation("feedback");
  const when = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
      }).format(new Date(item.createdAt)),
    [item.createdAt, locale],
  );
  const status = item.status as FeedbackStatusId;
  const bodyId = `feedback-body-${item.id}`;

  return (
    <article className={panelClass}>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em]" style={accentColor}>
        {t(`categories.${item.category}`)}
      </p>
      <h3 className="mt-1 text-base font-semibold leading-snug text-soma-ink">{item.title}</h3>
      <p className="mt-1 text-xs text-soma-ink-muted">
        {when}
        <span className="mx-2" aria-hidden="true">
          ·
        </span>
        <span>
          {t("statusLabel")}: {t(`statuses.${status}`)}
        </span>
      </p>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={bodyId}
        onClick={onToggle}
        className={`${previewFocus} mt-3 min-h-11 text-sm font-medium text-soma-action`}
      >
        {expanded ? t("collapseBody") : t("expandBody")}
      </button>
      {expanded ? (
        <p id={bodyId} className="mt-2 text-sm leading-relaxed text-soma-ink-secondary">
          {item.body}
        </p>
      ) : null}
    </article>
  );
}
