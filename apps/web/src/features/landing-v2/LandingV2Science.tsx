import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { previewFocus } from "../recovery-dashboard/focus.js";
import { LANDING_METHODOLOGY_ID } from "./LandingV2Methodology.js";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const STAGE_KEYS = ["research", "modeling", "exploration"] as const;
const SHAPE_KEYS = ["logarithmic", "sigmoidal", "linear"] as const;

const SHAPE_PATHS: Record<(typeof SHAPE_KEYS)[number], string> = {
  logarithmic: "M 8 52 C 22 18 48 12 112 10",
  sigmoidal: "M 8 52 C 40 52 80 12 112 12",
  linear: "M 8 52 L 112 12",
};

function ShapeGlyph({
  d,
  title,
  captionId,
  reduceMotion,
  delay,
}: {
  d: string;
  title: string;
  captionId: string;
  reduceMotion: boolean;
  delay: number;
}) {
  const draw = reduceMotion
    ? { duration: 0 }
    : { duration: 0.65, ease, delay };

  return (
    <svg
      viewBox="0 0 120 64"
      className="h-10 w-full sm:h-14"
      role="img"
      aria-labelledby={captionId}
    >
      <title>{title}</title>
      <line
        x1="8"
        x2="112"
        y1="56"
        y2="56"
        stroke="rgb(var(--soma-line))"
        strokeWidth="1"
      />
      <path
        d={d}
        fill="none"
        stroke="rgb(var(--soma-physiology) / 0.28)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <motion.path
        d={d}
        fill="none"
        stroke="rgb(var(--soma-action))"
        strokeWidth="2.2"
        strokeLinecap="round"
        pathLength={1}
        initial={reduceMotion ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={draw}
      />
    </svg>
  );
}

function scrollToMethodology(reduceMotion: boolean) {
  const target = document.getElementById(LANDING_METHODOLOGY_ID);
  if (!target) return;
  target.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

export function LandingV2Science() {
  const { t } = useTranslation("landing-v2", {
    bindI18n: "languageChanged loaded added",
  });
  const reduceMotion = Boolean(useReducedMotion());
  const enter = reduceMotion ? { duration: 0 } : { duration: 0.55, ease };
  const fadeUp = reduceMotion ? false : { opacity: 0, y: 12 };

  return (
    <section
      className="relative isolate overflow-x-hidden bg-[#081018] px-4 py-8 sm:px-6 lg:flex lg:h-svh lg:flex-col lg:px-12 lg:py-5 xl:px-16"
      aria-labelledby="landing-v2-science-title"
    >
      <img
        src="/images/landing-v2/soma-science-bg.png"
        alt=""
        width={1920}
        height={800}
        decoding="async"
        draggable={false}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover object-center opacity-80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#081018]/22 md:bg-[#081018]/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,16,24,0.18)_0%,rgba(8,16,24,0.62)_16%,rgba(8,16,24,0.68)_84%,rgba(8,16,24,0.2)_100%),linear-gradient(180deg,rgba(8,16,24,0.5)_0%,rgba(8,16,24,0.18)_22%,rgba(8,16,24,0.22)_72%,rgba(8,16,24,0.45)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-soma-physiology/25 to-transparent"
      />

      <div className="relative mx-auto flex w-full max-w-[88rem] flex-col gap-3 lg:min-h-0 lg:flex-1 lg:justify-center lg:gap-3">
        <motion.header
          className="landing-v2-copy-veil landing-v2-copy-veil--center mx-auto w-full max-w-[850px] shrink-0 text-center"
          initial={fadeUp}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={enter}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-soma-action">
            {t("science.eyebrow")}
          </p>
          <h2
            id="landing-v2-science-title"
            className="mt-2 text-3xl font-semibold tracking-tight text-soma-ink sm:text-4xl lg:text-[2.35rem] lg:leading-[1.1] xl:text-[2.75rem]"
          >
            {t("science.title")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-soma-ink-secondary sm:text-base">
            {t("science.subtitle")}
          </p>
        </motion.header>

        <ol className="grid shrink-0 gap-2.5 lg:grid-cols-3 lg:gap-4">
          {STAGE_KEYS.map((key, index) => (
            <motion.li
              key={key}
              className="relative rounded-2xl border border-soma-line/80 bg-[#081018]/95 p-3 shadow-[0_18px_48px_rgba(8,16,24,0.45)] sm:rounded-3xl sm:p-5"
              initial={fadeUp}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ ...enter, delay: reduceMotion ? 0 : index * 0.1 }}
            >
              <span
                aria-hidden="true"
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-soma-physiology"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-soma-ink">
                {t(`science.stages.${key}.title`)}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-soma-ink-secondary">
                {t(`science.stages.${key}.body`)}
              </p>
            </motion.li>
          ))}
        </ol>

        <div className="shrink-0 rounded-2xl border border-soma-line/80 bg-[#081018]/90 px-3 py-2.5 sm:rounded-3xl sm:px-5 sm:py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-soma-ink-muted">
            {t("science.shapesLabel")}
          </p>
          <ul className="mt-2 grid grid-cols-3 gap-2 sm:mt-3 sm:gap-5">
            {SHAPE_KEYS.map((key, index) => {
              const captionId = `landing-v2-science-shape-${key}`;
              return (
                <li key={key} className="min-w-0">
                  <ShapeGlyph
                    d={SHAPE_PATHS[key]}
                    title={t(`science.shapes.${key}.title`)}
                    captionId={captionId}
                    reduceMotion={reduceMotion}
                    delay={reduceMotion ? 0 : index * 0.08}
                  />
                  <h3
                    id={captionId}
                    className="mt-1.5 text-sm font-semibold text-soma-ink"
                  >
                    {t(`science.shapes.${key}.title`)}
                  </h3>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <p className="max-w-2xl text-[11px] leading-relaxed text-soma-ink-muted">
            {t("science.notice")}
          </p>
          <a
            href={`#${LANDING_METHODOLOGY_ID}`}
            className={`${previewFocus} shrink-0 rounded-full border border-soma-action/70 bg-soma-action/10 px-4 py-2 text-sm text-soma-ink transition-colors hover:border-soma-action`}
            onClick={(event) => {
              event.preventDefault();
              scrollToMethodology(reduceMotion);
            }}
          >
            {t("science.exploreMethod")}
          </a>
        </div>
      </div>
    </section>
  );
}
