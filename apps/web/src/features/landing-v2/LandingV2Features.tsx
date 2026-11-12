import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { previewFocus } from "../recovery-dashboard/focus.js";
import { LANDING_FEATURE_ITEMS } from "./landing-features.js";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function LandingV2Features() {
  const { t } = useTranslation("landing-v2");
  const reduceMotion = Boolean(useReducedMotion());
  const enter = reduceMotion ? { duration: 0 } : { duration: 0.55, ease };
  const fadeUp = reduceMotion ? false : { opacity: 0, y: 12 };

  return (
    <section
      className="relative isolate overflow-x-hidden bg-[#081018] px-4 py-12 sm:px-6 lg:flex lg:min-h-svh lg:flex-col lg:px-12 lg:py-10 xl:px-16"
      aria-labelledby="landing-v2-features-title"
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
        className="pointer-events-none absolute inset-0 bg-[#081018]/35 md:bg-[#081018]/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,16,24,0.3)_0%,rgba(8,16,24,0.55)_18%,rgba(8,16,24,0.6)_82%,rgba(8,16,24,0.25)_100%),linear-gradient(180deg,rgba(8,16,24,0.5)_0%,rgba(8,16,24,0.15)_24%,rgba(8,16,24,0.2)_74%,rgba(8,16,24,0.5)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-soma-physiology/25 to-transparent"
      />
      <div className="relative mx-auto flex w-full max-w-[88rem] flex-col lg:min-h-0 lg:flex-1 lg:justify-center">
        <motion.header
          className="landing-v2-copy-veil max-w-3xl"
          initial={fadeUp}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={enter}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-soma-action">
            {t("features.eyebrow")}
          </p>
          <h2
            id="landing-v2-features-title"
            className="mt-2 text-3xl font-semibold tracking-tight text-soma-ink sm:text-4xl lg:text-[2.35rem] lg:leading-[1.1]"
          >
            {t("features.title")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-soma-ink-secondary sm:text-base">
            {t("features.intro")}
          </p>
        </motion.header>

        <ul
          className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
          aria-label={t("features.listLabel")}
        >
          {LANDING_FEATURE_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={item.id}
                className="min-w-0"
                initial={fadeUp}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ ...enter, delay: reduceMotion ? 0 : index * 0.04 }}
              >
                <Link
                  to={item.to}
                  className={`${previewFocus} group flex h-full min-h-11 flex-col rounded-2xl border border-soma-line/70 bg-[rgb(8_16_24_/_0.92)] p-4 transition-colors hover:border-soma-physiology/50`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-soma-physiology/10 text-soma-physiology"
                    >
                      <Icon className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.75} />
                    </span>
                    <span className="text-base font-semibold leading-snug text-soma-ink">
                      {t(`features.items.${item.id}.title`)}
                    </span>
                  </span>
                  <span className="mt-2 text-sm leading-relaxed text-soma-ink-secondary">
                    {t(`features.items.${item.id}.body`)}
                  </span>
                  <span className="mt-auto pt-3 text-xs font-medium text-soma-action underline-offset-4 group-hover:underline">
                    {t("features.demoLink")}
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ul>

        <p className="mt-5 max-w-3xl text-xs leading-relaxed text-soma-ink-muted">
          {t("features.note")}
        </p>
      </div>
    </section>
  );
}
