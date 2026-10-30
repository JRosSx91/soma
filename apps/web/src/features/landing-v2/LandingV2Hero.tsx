import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { useLandingV2Intro } from "./SomaIntro.js";
import { LandingRegistrationActions } from "./LandingRegistrationActions.js";
import "./landing-v2-hero.css";

const HERO_ART = "/images/landing-v2/hero-holographic-anatomy.png";
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function LandingV2Hero() {
  const { t } = useTranslation("landing-v2");
  const { introComplete } = useLandingV2Intro();
  const reduceMotion = useReducedMotion();
  const enter = reduceMotion ? { duration: 0 } : { duration: 0.8, ease };
  const shown = introComplete || Boolean(reduceMotion);

  return (
    <section className="landing-v2-hero relative isolate flex min-h-[calc(100svh-var(--landing-v2-header))] flex-col overflow-x-hidden bg-[#081018] xl:block">
      <motion.div
        aria-hidden="true"
        className="landing-v2-hero__art pointer-events-none absolute inset-0 overflow-hidden md:relative md:order-2 md:min-h-[26rem] md:flex-1 lg:absolute lg:inset-y-0 lg:left-[40%] lg:right-0 lg:min-h-0 xl:inset-0"
        initial={reduceMotion ? false : { opacity: 0, scale: 1.03 }}
        animate={shown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.03 }}
        transition={enter}
      >
        <img
          src={HERO_ART}
          alt=""
          width={1828}
          height={860}
          decoding="async"
          fetchPriority="high"
          draggable={false}
          className="landing-v2-hero__art-img absolute inset-0 h-full w-full max-w-none object-cover object-[90%_74%] sm:object-[86%_62%] md:object-[center_18%] lg:object-[22%_44%] xl:object-[70%_42%]"
        />
        <div className="landing-v2-hero__veil-portrait absolute inset-0 md:hidden">
          <div className="absolute inset-x-0 top-0 h-[68%] bg-[linear-gradient(to_bottom,#081018_0%,#081018_46%,rgba(8,16,24,0.9)_70%,rgba(8,16,24,0.4)_100%)]" />
          <div className="absolute inset-x-0 top-[52%] bottom-0 bg-[linear-gradient(to_right,#081018_0%,rgba(8,16,24,0.5)_36%,transparent_82%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#081018] to-transparent" />
        </div>
        <div className="landing-v2-hero__veil-md absolute inset-x-0 top-0 hidden h-16 bg-gradient-to-b from-[#081018] to-transparent md:block lg:hidden" />
        <div className="landing-v2-hero__veil-lg absolute inset-y-0 left-0 hidden w-20 bg-gradient-to-r from-[#081018] to-transparent lg:block xl:hidden" />
        <div className="landing-v2-hero__veil-overlay-left absolute inset-y-0 left-0 hidden w-[min(36rem,52%)] bg-gradient-to-r from-[#081018]/35 via-[#081018]/10 to-transparent xl:block" />
        <div className="landing-v2-hero__veil-overlay-bottom absolute inset-x-0 bottom-0 hidden h-36 bg-gradient-to-t from-[#081018] via-[#081018]/50 to-transparent xl:block" />
        <div className="landing-v2-hero__veil-base-bottom absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#081018] to-transparent md:h-24 xl:hidden" />
        <div
          className="landing-v2-hero__veil-short pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#081018_0%,rgba(8,16,24,0.92)_38%,rgba(8,16,24,0.45)_68%,transparent_100%)]"
          aria-hidden="true"
        />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_42%,rgba(8,16,24,0.12),transparent_48%)]"
          animate={
            reduceMotion || !shown
              ? { opacity: 1 }
              : { opacity: [0.88, 1, 0.88] }
          }
          transition={
            reduceMotion || !shown
              ? { duration: 0 }
              : { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }
        />
      </motion.div>

      <div className="landing-v2-hero__copy relative z-10 flex min-h-[calc(100svh-var(--landing-v2-header))] w-full flex-col justify-start px-4 pb-16 pt-10 sm:px-6 md:order-1 md:min-h-0 md:px-8 md:pb-8 md:pt-12 lg:min-h-[calc(100svh-var(--landing-v2-header))] lg:w-[40%] lg:justify-center lg:px-10 lg:pb-16 xl:absolute xl:inset-0 xl:w-full xl:max-w-none xl:justify-center xl:px-16">
        <div className="landing-v2-hero__copy-inner w-full max-w-xl xl:max-w-[27.5rem]">
          <motion.p
            className="text-[11px] font-medium uppercase tracking-[0.22em] text-soma-action"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ ...enter, delay: reduceMotion ? 0 : 0.08 }}
          >
            {t("hero.eyebrow")}
          </motion.p>
          <motion.h1
            className="landing-v2-hero__title mt-3 text-4xl font-semibold leading-tight tracking-tight text-soma-ink sm:text-5xl md:text-[2.65rem] lg:text-[2.75rem] xl:text-[3.15rem]"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ ...enter, delay: reduceMotion ? 0 : 0.14 }}
          >
            <span className="block">{t("hero.titleLead")}</span>
            <span className="mt-1 block text-soma-physiology">
              {t("hero.titleAccent")}
            </span>
          </motion.h1>
          <motion.p
            className="landing-v2-hero__subtitle mt-5 text-base leading-relaxed text-soma-ink-secondary sm:text-lg"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ ...enter, delay: reduceMotion ? 0 : 0.24 }}
          >
            {t("hero.subtitle")}
          </motion.p>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ ...enter, delay: reduceMotion ? 0 : 0.34 }}
          >
            <LandingRegistrationActions
              copyPrefix="hero"
              layoutClassName="landing-v2-hero__cta mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            />
          </motion.div>
          <p className="landing-v2-hero__disclaimer mt-5 text-xs leading-relaxed text-soma-ink-muted">
            {t("hero.disclaimer")}
          </p>
        </div>
      </div>
    </section>
  );
}
