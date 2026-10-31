import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { previewFocus } from "../recovery-dashboard/focus.js";

const MAX_DAY = 90;
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const VIEW = { w: 960, h: 380, l: 40, r: 32, t: 36, b: 52 };

/** Aesthetic interpolation only. Not a recovery formula. */
function illustrativeShape(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped * clamped * (3 - 2 * clamped);
}

function pointOnCurve(t: number): { x: number; y: number } {
  const innerW = VIEW.w - VIEW.l - VIEW.r;
  const innerH = VIEW.h - VIEW.t - VIEW.b;
  return {
    x: VIEW.l + t * innerW,
    y: VIEW.t + (1 - illustrativeShape(t)) * innerH,
  };
}

function curvePath(): string {
  const steps = 48;
  const first = pointOnCurve(0);
  let d = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
  for (let i = 1; i <= steps; i += 1) {
    const point = pointOnCurve(i / steps);
    d += ` L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }
  return d;
}

function areaPath(): string {
  const end = pointOnCurve(1);
  const start = pointOnCurve(0);
  const baseline = VIEW.h - VIEW.b;
  return `${curvePath()} L ${end.x.toFixed(1)} ${baseline} L ${start.x.toFixed(1)} ${baseline} Z`;
}

export function LandingV2Journey() {
  const { t } = useTranslation("landing-v2", {
    bindI18n: "languageChanged loaded added",
  });
  const reduceMotion = Boolean(useReducedMotion());
  const enter = reduceMotion ? { duration: 0 } : { duration: 0.55, ease };
  const fadeUp = reduceMotion ? false : { opacity: 0, y: 14 };
  const sliderId = useId();
  const captionId = useId();
  const fillId = "landing-v2-journey-fill";
  const [day, setDay] = useState(18);
  const progress = day / MAX_DAY;
  const marker = useMemo(() => pointOnCurve(progress), [progress]);
  const fullPath = useMemo(() => curvePath(), []);
  const filledPath = useMemo(() => areaPath(), []);

  return (
    <section
      className="relative isolate overflow-x-hidden bg-[#081018] px-4 py-10 sm:px-6 sm:py-24 lg:px-12 lg:py-28 xl:px-16"
      aria-labelledby="landing-v2-journey-title"
    >
      <img
        src="/images/landing-v2/soma-journey-bg.png"
        alt=""
        width={1920}
        height={800}
        decoding="async"
        draggable={false}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover object-[center_70%] opacity-80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#081018]/45 md:bg-[#081018]/30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_8%,rgba(8,16,24,0.2),transparent_46%),radial-gradient(ellipse_at_8%_88%,rgba(8,16,24,0.35),transparent_42%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-soma-physiology/25 to-transparent"
      />

      <div className="relative mx-auto grid max-w-[88rem] gap-6 lg:grid-cols-[minmax(18rem,26rem)_minmax(0,1fr)] lg:items-center lg:gap-12 xl:gap-16">
        <header className="landing-v2-copy-veil max-w-xl lg:max-w-none">
          <motion.p
            className="text-[11px] font-medium uppercase tracking-[0.22em] text-soma-action"
            initial={fadeUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={enter}
          >
            {t("journey.eyebrow")}
          </motion.p>
          <motion.h2
            id="landing-v2-journey-title"
            className="mt-3 text-4xl font-semibold tracking-tight text-soma-ink sm:mt-4 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08] xl:text-6xl"
            initial={fadeUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ ...enter, delay: reduceMotion ? 0 : 0.08 }}
          >
            {t("journey.title")}
          </motion.h2>
          <motion.p
            className="mt-3 max-w-lg text-base leading-relaxed text-soma-ink-secondary sm:mt-5 sm:text-lg"
            initial={fadeUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ ...enter, delay: reduceMotion ? 0 : 0.16 }}
          >
            {t("journey.subtitle")}
          </motion.p>
        </header>

        <motion.div
          className="overflow-hidden rounded-3xl border border-soma-line/70 bg-[rgb(8_16_24_/_0.92)] shadow-[0_24px_80px_rgba(8,16,24,0.45)]"
          initial={fadeUp}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ ...enter, delay: reduceMotion ? 0 : 0.12 }}
        >
          <div className="relative px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-7">
            <svg
              viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
              className="h-[13.5rem] w-full sm:h-[20rem] lg:h-[24rem] xl:h-[28rem]"
              role="img"
              aria-labelledby={captionId}
            >
              <title>{t("journey.chartTitle")}</title>
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--soma-action))" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="rgb(var(--soma-physiology))" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((tick) => {
                const y = VIEW.t + (1 - tick) * (VIEW.h - VIEW.t - VIEW.b);
                return (
                  <line
                    key={tick}
                    x1={VIEW.l}
                    x2={VIEW.w - VIEW.r}
                    y1={y}
                    y2={y}
                    stroke="rgb(var(--soma-line))"
                    strokeWidth="1"
                    strokeOpacity="0.7"
                  />
                );
              })}
              <motion.path
                d={filledPath}
                fill={`url(#${fillId})`}
                initial={reduceMotion ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.65, ease, delay: 0.2 }}
              />
              <motion.path
                d={fullPath}
                fill="none"
                stroke="rgb(var(--soma-physiology) / 0.32)"
                strokeWidth="2.8"
                strokeLinecap="round"
                pathLength={1}
                initial={reduceMotion ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease }}
              />
              <motion.path
                d={fullPath}
                fill="none"
                stroke="rgb(var(--soma-action))"
                strokeWidth="3.2"
                strokeLinecap="round"
                pathLength={1}
                initial={false}
                animate={{ pathLength: progress }}
                transition={
                  reduceMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut" }
                }
              />
              <motion.circle
                r="7.5"
                fill="rgb(var(--soma-action))"
                stroke="rgb(var(--soma-canvas))"
                strokeWidth="2.4"
                initial={false}
                animate={{ cx: marker.x, cy: marker.y }}
                transition={
                  reduceMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut" }
                }
              />
              <text
                x={VIEW.l}
                y={VIEW.h - 14}
                fill="rgb(var(--soma-ink-muted))"
                fontSize="13"
              >
                {t("journey.axisStart")}
              </text>
              <text
                x={VIEW.w - VIEW.r}
                y={VIEW.h - 14}
                textAnchor="end"
                fill="rgb(var(--soma-ink-muted))"
                fontSize="13"
              >
                {t("journey.axisEnd")}
              </text>
            </svg>

            <div className="mt-1 flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:gap-5 lg:pb-6">
              <div className="flex items-center justify-between gap-3 sm:contents">
                <label
                  htmlFor={sliderId}
                  className="shrink-0 text-sm text-soma-ink-secondary"
                >
                  {t("journey.sliderLabel")}
                </label>
                <p
                  className="shrink-0 text-sm font-medium tabular-nums text-soma-physiology sm:order-last"
                  aria-live="polite"
                >
                  {t("journey.dayLabel", { day })}
                </p>
              </div>
              <input
                id={sliderId}
                type="range"
                min={0}
                max={MAX_DAY}
                step={1}
                value={day}
                aria-valuemin={0}
                aria-valuemax={MAX_DAY}
                aria-valuenow={day}
                aria-valuetext={t("journey.dayLabel", { day })}
                aria-describedby={captionId}
                onChange={(event) => setDay(Number(event.target.value))}
                className={`${previewFocus} h-2 w-full cursor-pointer appearance-none rounded-full bg-soma-line accent-soma-action`}
              />
            </div>
          </div>

          <aside className="flex flex-col gap-1.5 border-t border-soma-line/70 bg-[#081018]/35 px-4 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:px-6 sm:py-3 lg:px-8">
            <p className="text-[11px] leading-relaxed text-soma-ink-muted sm:max-w-sm">
              {t("journey.hint")}
            </p>
            <p
              id={captionId}
              className="text-[11px] leading-relaxed text-soma-ink-muted/90 sm:max-w-xl"
            >
              {t("journey.caption")}
            </p>
          </aside>
        </motion.div>
      </div>
    </section>
  );
}
