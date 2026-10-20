import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";

export const LANDING_METHODOLOGY_ID = "landing-methodology";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const SHAPE_KEYS = ["logarithmic", "sigmoidal", "linear"] as const;
const CONFIDENCE_KEYS = ["high", "medium", "low"] as const;

const SHAPE_PATHS: Record<(typeof SHAPE_KEYS)[number], string> = {
  logarithmic: "M 8 52 C 22 18 48 12 112 10",
  sigmoidal: "M 8 52 C 40 52 80 12 112 12",
  linear: "M 8 52 L 112 12",
};

const CONFIDENCE_MARK: Record<(typeof CONFIDENCE_KEYS)[number], string> = {
  high: "bg-soma-action",
  medium: "bg-soma-physiology",
  low: "bg-soma-ink-muted",
};

export function LandingV2Methodology() {
  const { t } = useTranslation("landing-v2", {
    bindI18n: "languageChanged loaded added",
  });
  const reduceMotion = Boolean(useReducedMotion());
  const enter = reduceMotion ? { duration: 0 } : { duration: 0.55, ease };
  const fadeUp = reduceMotion ? false : { opacity: 0, y: 12 };

  return (
    <section
      id={LANDING_METHODOLOGY_ID}
      className="relative overflow-x-hidden bg-[#07141f] px-4 py-8 sm:px-6 lg:flex lg:h-svh lg:flex-col lg:px-12 lg:py-6 xl:px-16"
      aria-labelledby="landing-v2-methodology-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_88%_8%,rgba(104,216,192,0.14),transparent_40%),radial-gradient(ellipse_at_8%_88%,rgba(134,183,232,0.12),transparent_46%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-soma-action/30 to-transparent"
      />

      <div className="relative mx-auto flex w-full max-w-[88rem] flex-col gap-4 lg:min-h-0 lg:flex-1 lg:justify-center lg:gap-5">
        <motion.header
          className="max-w-3xl shrink-0"
          initial={fadeUp}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={enter}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-soma-action">
            {t("methodology.eyebrow")}
          </p>
          <h2
            id="landing-v2-methodology-title"
            className="mt-2 text-3xl font-semibold tracking-tight text-soma-ink sm:text-4xl lg:text-[2.35rem] lg:leading-[1.1] xl:text-[2.75rem]"
          >
            {t("methodology.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-soma-ink-secondary sm:text-base">
            {t("methodology.subtitle")}
          </p>
        </motion.header>

        <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] lg:items-stretch lg:gap-10">
          <div className="relative min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-soma-ink-muted">
              {t("science.shapesDetailLabel")}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-soma-ink-muted">
              {t("science.shapesCaption")}
            </p>
            <ol className="mt-3 flex flex-col gap-2.5 lg:mt-4 lg:gap-3">
              {SHAPE_KEYS.map((key, index) => {
                const captionId = `landing-v2-method-shape-${key}`;
                return (
                  <motion.li
                    key={key}
                    className="relative grid grid-cols-[3.3rem_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-soma-line/60 bg-[#081018]/55 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3"
                    initial={fadeUp}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ ...enter, delay: reduceMotion ? 0 : index * 0.08 }}
                  >
                    <svg
                      viewBox="0 0 120 64"
                      className="h-10 w-full"
                      role="img"
                      aria-labelledby={captionId}
                    >
                      <title>{t(`science.shapes.${key}.title`)}</title>
                      <path
                        d={SHAPE_PATHS[key]}
                        fill="none"
                        stroke="rgb(var(--soma-physiology) / 0.28)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <motion.path
                        d={SHAPE_PATHS[key]}
                        fill="none"
                        stroke="rgb(var(--soma-action))"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        pathLength={1}
                        initial={reduceMotion ? false : { pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { duration: 0.65, ease, delay: index * 0.08 }
                        }
                      />
                    </svg>
                    <div className="min-w-0">
                      <h3
                        id={captionId}
                        className="text-sm font-semibold text-soma-ink"
                      >
                        {t(`science.shapes.${key}.title`)}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-soma-ink-secondary">
                        {t(`science.shapes.${key}.body`)}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </div>

          <motion.div
            className="flex min-w-0 flex-col rounded-3xl border border-soma-physiology/25 bg-soma-canvas/40 p-4 shadow-[inset_0_1px_0_rgba(134,183,232,0.08)] sm:p-6"
            initial={fadeUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ ...enter, delay: reduceMotion ? 0 : 0.2 }}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-soma-physiology">
              {t("science.confidenceLabel")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-soma-ink-secondary">
              {t("science.confidenceIntro")}
            </p>
            <ul className="mt-3 flex flex-1 flex-col justify-center gap-2.5 lg:mt-4 lg:gap-3">
              {CONFIDENCE_KEYS.map((key) => (
                <li key={key} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${CONFIDENCE_MARK[key]}`}
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-soma-ink">
                      {t(`science.confidence.${key}.title`)}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-soma-ink-secondary">
                      {t(`science.confidence.${key}.body`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.p
          className="shrink-0 rounded-2xl border border-soma-line/70 bg-[#081018]/70 px-4 py-2.5 text-[11px] leading-relaxed text-soma-ink-muted sm:px-5 sm:py-3"
          initial={fadeUp}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ ...enter, delay: reduceMotion ? 0 : 0.28 }}
        >
          {t("science.limits")}
        </motion.p>
      </div>
    </section>
  );
}
