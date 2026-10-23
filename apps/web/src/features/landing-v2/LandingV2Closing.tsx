import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { SomaMark } from "../recovery-dashboard/components/SomaMark.js";
import { previewFocus } from "../recovery-dashboard/focus.js";
import { LandingPulseWave } from "./LandingPulseWave.js";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function LandingV2Closing() {
  const { t } = useTranslation("landing-v2", {
    bindI18n: "languageChanged loaded added",
  });
  const reduceMotion = Boolean(useReducedMotion());
  const enter = reduceMotion ? { duration: 0 } : { duration: 0.7, ease };
  const year = new Date().getFullYear();
  const sectionRef = useRef<HTMLElement>(null);
  const [pulseLive, setPulseLive] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPulseLive(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-x-hidden bg-[#081018] px-4 py-16 sm:px-6 lg:flex lg:h-svh lg:flex-col lg:px-12 lg:py-0 xl:px-16"
      aria-labelledby="landing-v2-closing-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_50%,rgba(104,216,192,0.16),transparent_34%),radial-gradient(ellipse_at_92%_48%,rgba(134,183,232,0.14),transparent_36%),radial-gradient(ellipse_at_50%_18%,rgba(134,183,232,0.06),transparent_42%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-soma-physiology/25 to-transparent"
      />

      <div className="relative mx-auto flex w-full max-w-[88rem] flex-1 flex-col lg:min-h-0">
        <div className="relative flex flex-1 flex-col items-center justify-center py-6 lg:min-h-0 lg:py-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[-10%] top-[46%] h-[42%] lg:top-[50%] lg:h-[38%]"
          >
            <LandingPulseWave
              variant="live"
              reduceMotion={reduceMotion}
              live={pulseLive}
            />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[38%] h-[min(22rem,52%)] w-[min(44rem,92%)] -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(8,16,24,0.94)_0%,rgba(8,16,24,0.82)_46%,rgba(8,16,24,0)_76%)]"
          />

          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
            <motion.p
              className="text-[11px] font-medium uppercase tracking-[0.28em] text-soma-action"
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={enter}
            >
              {t("closing.eyebrow")}
            </motion.p>
            <motion.h2
              id="landing-v2-closing-title"
              className="mt-5 text-4xl font-semibold tracking-tight text-soma-ink sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ ...enter, delay: reduceMotion ? 0 : 0.08 }}
            >
              {t("closing.title")}
            </motion.h2>
            <motion.p
              className="mt-5 max-w-2xl text-base leading-relaxed text-soma-ink-secondary sm:text-lg"
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ ...enter, delay: reduceMotion ? 0 : 0.14 }}
            >
              {t("closing.subtitle")}
            </motion.p>
            <motion.div
              className="mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ ...enter, delay: reduceMotion ? 0 : 0.2 }}
            >
              <Link
                to="/register"
                className={`${previewFocus} inline-flex items-center justify-center rounded-xl bg-soma-action px-6 py-3 text-sm font-semibold text-[#081018] transition-colors hover:bg-soma-action-hover`}
              >
                {t("closing.ctaPrimary")}
              </Link>
              <Link
                to="/preview"
                className={`${previewFocus} inline-flex items-center justify-center rounded-xl border border-soma-line-strong bg-[#081018]/40 px-6 py-3 text-sm font-medium text-soma-ink-secondary transition-colors hover:border-soma-physiology hover:text-soma-ink`}
              >
                {t("closing.ctaSecondary")}
              </Link>
            </motion.div>
            <p className="mt-6 max-w-xl text-xs leading-relaxed text-soma-ink-muted">
              {t("closing.note")}
            </p>
          </div>
        </div>

        <footer className="relative shrink-0 pb-6 pt-5 lg:pb-7">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-soma-line/70 to-transparent"
          />
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
            <SomaMark />
            <p className="text-xs text-soma-ink-muted">{t("closing.tagline")}</p>
            <p className="text-xs tabular-nums text-soma-ink-muted">© {year}</p>
          </div>
        </footer>
      </div>
    </section>
  );
}
