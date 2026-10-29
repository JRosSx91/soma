import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import "./landing-v2-origin.css";

const ORIGIN_BG = "/images/landing-v2/soma-origin-bg.png";
const BODY_KEYS = ["p1", "p2", "p3"] as const;
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function LandingV2Origin() {
  const { t } = useTranslation("landing-v2", {
    bindI18n: "languageChanged loaded added",
  });
  const reduceMotion = Boolean(useReducedMotion());
  const enter = reduceMotion ? { duration: 0 } : { duration: 0.55, ease };
  const fadeUp = reduceMotion ? false : { opacity: 0, y: 12 };

  return (
    <section
      className="landing-v2-origin relative isolate overflow-x-hidden bg-[#081018] px-4 py-16 sm:px-6 lg:flex lg:h-svh lg:flex-col lg:px-12 lg:py-6 xl:px-16 scroll-mt-[var(--landing-v2-header)]"
      aria-labelledby="landing-v2-origin-title"
    >
      <img
        src={ORIGIN_BG}
        alt=""
        width={1920}
        height={800}
        decoding="async"
        draggable={false}
        aria-hidden="true"
        className="landing-v2-origin__bg pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover object-[96%_center] sm:object-[94%_center] md:object-[92%_center] lg:object-right xl:object-right"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#081018] via-[#081018]/90 to-[#081018]/50 md:hidden"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#081018] from-[18%] via-[#081018]/82 via-[52%] to-transparent md:from-[#081018] md:via-[#081018]/78 md:via-[46%] lg:from-[#081018]/95 lg:via-[#081018]/35 lg:via-[40%] xl:via-[#081018]/12"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#081018] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-soma-physiology/25 to-transparent"
      />

      <div className="relative mx-auto flex w-full max-w-[88rem] flex-1 items-center lg:min-h-0">
        <div className="w-full max-w-[20.5rem] sm:max-w-md md:max-w-[22rem] lg:max-w-[30rem] xl:max-w-[34rem]">
          <motion.h2
            id="landing-v2-origin-title"
            className="text-3xl font-semibold tracking-tight text-soma-ink sm:text-4xl lg:text-[2.35rem] lg:leading-[1.1] xl:text-[2.75rem]"
            initial={fadeUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={enter}
          >
            {t("origin.title")}
          </motion.h2>
          <motion.p
            lang="el"
            className="landing-v2-origin__word mt-8 font-semibold tracking-tight text-soma-physiology"
            initial={fadeUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ ...enter, delay: reduceMotion ? 0 : 0.12 }}
          >
            {t("origin.word")}
          </motion.p>
          <motion.p
            className="mt-3 text-sm italic leading-relaxed text-soma-ink-secondary sm:text-base"
            initial={fadeUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ ...enter, delay: reduceMotion ? 0 : 0.22 }}
          >
            {t("origin.etymology")}
          </motion.p>
          <div className="mt-8 flex flex-col gap-4 text-sm leading-relaxed text-soma-ink-secondary sm:text-base">
            {BODY_KEYS.map((key, index) => (
              <motion.p
                key={key}
                initial={fadeUp}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  ...enter,
                  delay: reduceMotion ? 0 : 0.32 + index * 0.08,
                }}
              >
                {t(`origin.${key}`)}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
