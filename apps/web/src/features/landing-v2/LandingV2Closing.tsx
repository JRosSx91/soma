import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { SomaMark } from "../recovery-dashboard/components/SomaMark.js";
import { previewFocus } from "../recovery-dashboard/focus.js";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const PULSE_PATH =
  "M0 200 H540 C600 200 610 200 640 200 C680 200 684 70 724 70 C764 70 768 270 812 270 C852 270 856 150 888 150 C920 150 928 200 960 200 H1600";

const SPARK_HEAD = 40;
const SPARK_CORE = 110;
const SPARK_TRAIL = 220;

function ClosingPulse({
  reduceMotion,
  live,
}: {
  reduceMotion: boolean;
  live: boolean;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    setLength(path.getTotalLength());
  }, []);

  const armed = !reduceMotion && length > 0;

  return (
    <svg
      viewBox="0 0 1600 400"
      preserveAspectRatio="xMidYMid slice"
      className={`h-full w-full${armed ? " landing-v2-closing-pulse-armed" : ""}${live && armed ? " landing-v2-closing-pulse-live" : ""}`}
      aria-hidden="true"
      style={
        {
          "--landing-v2-closing-len": length,
          "--landing-v2-closing-head": SPARK_HEAD,
        } as CSSProperties
      }
    >
      <style>
        {`
          @keyframes landing-v2-closing-spark {
            0% { stroke-dashoffset: var(--landing-v2-closing-len); }
            70% { stroke-dashoffset: calc(var(--landing-v2-closing-head) * -1); }
            100% { stroke-dashoffset: calc(var(--landing-v2-closing-head) * -1); }
          }
          @keyframes landing-v2-closing-peak {
            0%, 28% { opacity: 0.55; }
            38% { opacity: 0.95; }
            50% { opacity: 0.55; }
            100% { opacity: 0.55; }
          }
          .landing-v2-closing-spark {
            stroke-dashoffset: var(--landing-v2-closing-len);
          }
          .landing-v2-closing-pulse-armed .landing-v2-closing-spark,
          .landing-v2-closing-pulse-armed .landing-v2-closing-peak {
            animation-duration: 4.6s;
            animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            animation-iteration-count: infinite;
            animation-play-state: paused;
          }
          .landing-v2-closing-pulse-armed .landing-v2-closing-spark {
            animation-name: landing-v2-closing-spark;
          }
          .landing-v2-closing-pulse-armed .landing-v2-closing-peak {
            animation-name: landing-v2-closing-peak;
          }
          .landing-v2-closing-pulse-live .landing-v2-closing-spark,
          .landing-v2-closing-pulse-live .landing-v2-closing-peak {
            animation-play-state: running;
          }
        `}
      </style>
      <defs>
        <linearGradient id="landing-v2-closing-stroke" x1="0" y1="0" x2="1600" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(104,216,192,0.88)" />
          <stop offset="16%" stopColor="rgba(134,183,232,0.62)" />
          <stop offset="36%" stopColor="rgba(104,216,192,0.28)" />
          <stop offset="50%" stopColor="rgba(134,183,232,0.22)" />
          <stop offset="64%" stopColor="rgba(104,216,192,0.28)" />
          <stop offset="84%" stopColor="rgba(134,183,232,0.62)" />
          <stop offset="100%" stopColor="rgba(104,216,192,0.88)" />
        </linearGradient>
        <linearGradient id="landing-v2-closing-trail" x1="0" y1="0" x2="1600" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(104,216,192,0.5)" />
          <stop offset="20%" stopColor="rgba(134,183,232,0.28)" />
          <stop offset="50%" stopColor="rgba(104,216,192,0.1)" />
          <stop offset="80%" stopColor="rgba(134,183,232,0.28)" />
          <stop offset="100%" stopColor="rgba(104,216,192,0.5)" />
        </linearGradient>
        <radialGradient id="landing-v2-closing-bloom" cx="50%" cy="50%" r="52%">
          <stop offset="0%" stopColor="rgba(104,216,192,0.2)" />
          <stop offset="40%" stopColor="rgba(134,183,232,0.08)" />
          <stop offset="100%" stopColor="rgba(8,16,24,0)" />
        </radialGradient>
        <filter id="landing-v2-closing-blur" x="-20%" y="-180%" width="140%" height="460%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id="landing-v2-closing-soft" x="-8%" y="-80%" width="116%" height="260%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>

      <ellipse cx="220" cy="200" rx="260" ry="90" fill="url(#landing-v2-closing-bloom)" />
      <ellipse cx="1380" cy="200" rx="260" ry="90" fill="url(#landing-v2-closing-bloom)" />
      <ellipse
        className="landing-v2-closing-peak"
        cx="800"
        cy="200"
        rx="300"
        ry="96"
        fill="url(#landing-v2-closing-bloom)"
        opacity="0.55"
      />

      <path
        d={PULSE_PATH}
        fill="none"
        stroke="url(#landing-v2-closing-trail)"
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#landing-v2-closing-blur)"
        opacity="0.55"
      />
      <path
        d={PULSE_PATH}
        fill="none"
        stroke="url(#landing-v2-closing-trail)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#landing-v2-closing-soft)"
        opacity="0.7"
      />
      <path
        ref={pathRef}
        d={PULSE_PATH}
        fill="none"
        stroke="url(#landing-v2-closing-stroke)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {length > 0 && !reduceMotion ? (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path
            className="landing-v2-closing-spark"
            d={PULSE_PATH}
            stroke="rgba(104,216,192,0.38)"
            strokeWidth="6"
            strokeDasharray={`${SPARK_TRAIL} ${length}`}
          />
          <path
            className="landing-v2-closing-spark"
            d={PULSE_PATH}
            stroke="rgba(104,216,192,0.72)"
            strokeWidth="2.6"
            strokeDasharray={`${SPARK_CORE} ${length}`}
          />
          <path
            className="landing-v2-closing-spark"
            d={PULSE_PATH}
            stroke="rgba(232,246,255,0.92)"
            strokeWidth="1.8"
            strokeDasharray={`${SPARK_HEAD} ${length}`}
          />
        </g>
      ) : null}

      <g opacity="0.45">
        <circle cx="96" cy="188" r="2.1" fill="rgba(232,246,255,0.72)" />
        <circle cx="188" cy="210" r="1.4" fill="rgba(104,216,192,0.7)" />
        <circle cx="286" cy="196" r="1.8" fill="rgba(134,183,232,0.58)" />
        <circle cx="390" cy="206" r="1.3" fill="rgba(232,246,255,0.5)" />
        <circle cx="1210" cy="204" r="1.5" fill="rgba(134,183,232,0.55)" />
        <circle cx="1314" cy="192" r="2" fill="rgba(104,216,192,0.68)" />
        <circle cx="1410" cy="210" r="1.4" fill="rgba(232,246,255,0.62)" />
        <circle cx="1512" cy="198" r="1.7" fill="rgba(134,183,232,0.52)" />
      </g>
    </svg>
  );
}

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
            <ClosingPulse reduceMotion={reduceMotion} live={pulseLive} />
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
