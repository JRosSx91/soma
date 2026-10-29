import { BookOpen, Check, NotebookPen } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { MISSION_XP_AMOUNT } from "@soma/shared-types";
import { previewFocus } from "../recovery-dashboard/focus.js";
import "./landing-v2-missions-journal.css";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const PATH_BG = "/images/landing-v2/soma-missions-journal-bg.png";

const DEMO_MISSIONS = [
  { id: "edu-dopamine-01", state: "completed" },
  { id: "edu-receptors-01", state: "completed" },
  { id: "edu-serotonin-01", state: "available" },
] as const;

const DEMO_COMPLETED = DEMO_MISSIONS.filter((item) => item.state === "completed")
  .length;
const DEMO_TOTAL = 6;

const JOURNAL_SAMPLE_EMOTIONS = ["calm", "grateful"] as const;

export function LandingV2MissionsJournal() {
  const { t } = useTranslation(["landing-v2", "missions", "journal"], {
    bindI18n: "languageChanged loaded added",
  });
  const reduceMotion = Boolean(useReducedMotion());
  const enter = reduceMotion ? { duration: 0 } : { duration: 0.55, ease };
  const fadeUp = reduceMotion ? false : { opacity: 0, y: 12 };
  const progressPercent = Math.round((DEMO_COMPLETED / DEMO_TOTAL) * 100);

  return (
    <section
      className="landing-v2-path relative isolate overflow-x-hidden bg-[#081018] px-4 py-12 sm:px-6 lg:flex lg:min-h-svh lg:flex-col lg:px-12 lg:py-6 xl:px-16"
      aria-labelledby="landing-v2-path-title"
    >
      <img
        src={PATH_BG}
        alt=""
        width={1920}
        height={800}
        decoding="async"
        draggable={false}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover object-[center_80%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#081018]/45 md:bg-[#081018]/25"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#081018] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#081018] to-transparent"
      />

      <div className="relative mx-auto flex w-full max-w-[88rem] flex-1 flex-col justify-center gap-6 lg:min-h-0 lg:gap-5">
        <header className="mx-auto max-w-3xl text-center">
          <motion.p
            className="text-[11px] font-medium uppercase tracking-[0.22em] text-soma-action"
            initial={fadeUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={enter}
          >
            {t("path.eyebrow")}
          </motion.p>
          <motion.h2
            id="landing-v2-path-title"
            className="mt-2 text-3xl font-semibold tracking-tight text-soma-ink sm:text-4xl lg:text-[2.35rem] lg:leading-[1.1]"
            initial={fadeUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ ...enter, delay: reduceMotion ? 0 : 0.08 }}
          >
            {t("path.title")}
          </motion.h2>
        </header>

        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch lg:gap-6">
          <motion.article
            className="landing-v2-path__panel landing-v2-path__panel--missions flex flex-col rounded-3xl border border-amber-200/20 p-4 sm:p-5"
            aria-labelledby="landing-v2-path-missions-title"
            initial={fadeUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ ...enter, delay: reduceMotion ? 0 : 0.08 }}
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-200/10 text-amber-200"
              >
                <BookOpen className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <h3
                  id="landing-v2-path-missions-title"
                  className="text-xl font-semibold tracking-tight text-soma-ink"
                >
                  {t("path.missions.title")}
                </h3>
                <p className="mt-1 text-sm text-amber-100/80">
                  {t("path.missions.subtitle")}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-soma-ink-secondary">
              {t("path.missions.body")}
            </p>

            <div className="mt-4">
              <div className="flex items-baseline justify-between gap-3 text-xs text-soma-ink-muted">
                <span>{t("missions:statProgress")}</span>
                <span>
                  {t("missions:completedSummary", {
                    completed: DEMO_COMPLETED,
                    total: DEMO_TOTAL,
                  })}
                </span>
              </div>
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-soma-line/80"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercent}
                aria-label={t("missions:statProgress")}
              >
                <motion.div
                  className="h-full origin-left rounded-full bg-amber-300"
                  style={{ width: `${progressPercent}%` }}
                  initial={reduceMotion ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{
                    ...enter,
                    delay: reduceMotion ? 0 : 0.16,
                  }}
                />
              </div>
            </div>

            <ul className="mt-4 flex min-h-0 flex-1 flex-col gap-2">
              {DEMO_MISSIONS.map((item, index) => {
                const completed = item.state === "completed";
                return (
                  <motion.li
                    key={item.id}
                    className="flex flex-1 items-center rounded-2xl border border-amber-200/15 bg-[#081018]/55 px-3 py-2.5"
                    initial={fadeUp}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{
                      ...enter,
                      delay: reduceMotion ? 0 : 0.18 + index * 0.08,
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          completed
                            ? "bg-amber-300 text-[#081018]"
                            : "border border-amber-200/40 text-amber-100/70"
                        }`}
                      >
                        {completed ? <Check className="h-3 w-3" strokeWidth={2.4} /> : null}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-soma-ink">
                          {t(`missions:items.${item.id}.title`)}
                        </p>
                        <p className="mt-0.5 text-xs text-soma-ink-muted">
                          {completed
                            ? t("missions:statusCompleted")
                            : t("missions:statusAvailable")}
                          <span className="text-amber-200/90">
                            {" · "}
                            {t("missions:xpGranted", { count: MISSION_XP_AMOUNT })}
                          </span>
                        </p>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
            <p className="mt-auto pt-3 text-[11px] leading-relaxed text-soma-ink-muted">
              {t("path.missions.note")}
            </p>
            <Link
              to="/preview/missions"
              className={`${previewFocus} mt-3 inline-flex text-sm font-medium text-amber-200 underline-offset-4 hover:underline`}
            >
              {t("path.missions.demo")}
            </Link>
          </motion.article>

          <motion.article
            className="landing-v2-path__panel landing-v2-path__panel--journal flex flex-col rounded-3xl border border-soma-physiology/25 p-4 sm:p-5"
            aria-labelledby="landing-v2-path-journal-title"
            initial={fadeUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ ...enter, delay: reduceMotion ? 0 : 0.14 }}
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-soma-physiology/10 text-soma-physiology"
              >
                <NotebookPen className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <h3
                  id="landing-v2-path-journal-title"
                  className="text-xl font-semibold tracking-tight text-soma-ink"
                >
                  {t("path.journal.title")}
                </h3>
                <p className="mt-1 text-sm text-soma-physiology/90">
                  {t("path.journal.subtitle")}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-soma-ink-secondary">
              {t("path.journal.body")}
            </p>

            <motion.div
              className="mt-4 rounded-2xl border border-soma-physiology/20 bg-[#081018]/55 p-3.5"
              initial={fadeUp}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ ...enter, delay: reduceMotion ? 0 : 0.22 }}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-soma-physiology">
                {t("path.journal.sampleLabel")}
              </p>
              <p className="mt-2 text-sm font-semibold text-soma-ink">
                {t("path.journal.sampleTitle")}
              </p>
              <p className="mt-1 text-xs text-soma-ink-muted">
                {t("path.journal.sampleMeta")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-soma-ink-secondary">
                {t("path.journal.sampleBody")}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {JOURNAL_SAMPLE_EMOTIONS.map((id) => (
                  <li
                    key={id}
                    className="rounded-full border border-soma-physiology/30 bg-soma-physiology/10 px-2 py-0.5 text-[11px] text-soma-physiology"
                  >
                    {t(`journal:emotions.${id}`)}
                  </li>
                ))}
                <li className="rounded-full border border-soma-physiology/20 px-2 py-0.5 text-[11px] text-soma-ink-muted">
                  {t("journal:notes.highlights")}
                </li>
              </ul>
            </motion.div>

            <ul className="mt-3 flex flex-col gap-2">
              <motion.li
                className="rounded-2xl border border-soma-line/70 bg-[#081018]/40 px-3 py-2"
                initial={fadeUp}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ ...enter, delay: reduceMotion ? 0 : 0.3 }}
              >
                <p className="text-sm text-soma-ink">{t("path.journal.historyOneTitle")}</p>
                <p className="mt-0.5 text-xs text-soma-ink-muted">
                  {t("path.journal.historyOneMeta")}
                </p>
              </motion.li>
              <motion.li
                className="rounded-2xl border border-soma-line/70 bg-[#081018]/40 px-3 py-2"
                initial={fadeUp}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ ...enter, delay: reduceMotion ? 0 : 0.38 }}
              >
                <p className="text-sm text-soma-ink">{t("path.journal.historyTwoTitle")}</p>
                <p className="mt-0.5 text-xs text-soma-ink-muted">
                  {t("path.journal.historyTwoMeta")}
                </p>
              </motion.li>
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-soma-ink-muted">
              {t("path.journal.note")}
            </p>
            <Link
              to="/preview/journal"
              className={`${previewFocus} mt-3 inline-flex text-sm font-medium text-soma-physiology underline-offset-4 hover:underline`}
            >
              {t("path.journal.demo")}
            </Link>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
