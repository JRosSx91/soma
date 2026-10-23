import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  pulseRevealOffsets,
  SPARK_CORE,
  SPARK_HEAD,
  SPARK_TRAIL,
} from "./pulseRevealOffsets.js";

/**
 * Shared landing pulse geometry. 404 uses three compatible QRS-like paths
 * revealed left-to-right; `live` keeps the original closing stroke.
 */
export const LANDING_PULSE_PATH =
  "M0 200 H540 C600 200 610 200 640 200 C680 200 684 70 724 70 C764 70 768 270 812 270 C852 270 856 150 888 150 C920 150 928 200 960 200 H1600";

/** First 404 pass: two landing-style complexes, spaced along the baseline. */
export const LANDING_TWO_PEAK_PATH =
  "M0 200 H360 C420 200 430 200 460 200 C500 200 504 70 544 70 C584 70 588 270 632 270 C672 270 676 150 708 150 C740 150 748 200 780 200 H900 C960 200 970 200 1000 200 C1040 200 1044 70 1084 70 C1124 70 1128 270 1172 270 C1212 270 1216 150 1248 150 C1280 150 1288 200 1320 200 H1600";

export const LANDING_FLATLINE_PATH =
  "M0 200 H540 C600 200 610 200 640 200 C680 200 684 200 724 200 C764 200 768 200 812 200 C852 200 856 200 888 200 C920 200 928 200 960 200 H1600";

const DRAW_DURATION_S = 2.8;
const HOLD_DURATION_S = 0.35;
const FADE_DURATION_S = 0.4;
const REVEAL_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const LIVE_VIEWBOX = "0 0 1600 400";
/** Tight vertical window around the QRS (y 70–270) so `meet` can fill width. */
const FLATLINE_VIEWBOX = "0 44 1600 252";
const FLATLINE_ASPECT = "1600 / 252";

export type LandingPulseWaveVariant = "live" | "flatline";

interface LandingPulseWaveProps {
  variant: LandingPulseWaveVariant;
  reduceMotion: boolean;
  /** When variant is `live`, starts the spark (intersection / visibility). */
  live?: boolean;
}

function PulseDefs({ idPrefix }: { idPrefix: string }) {
  return (
    <defs>
      <linearGradient
        id={`${idPrefix}-stroke`}
        x1="0"
        y1="0"
        x2="1600"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="rgba(104,216,192,0.88)" />
        <stop offset="16%" stopColor="rgba(134,183,232,0.62)" />
        <stop offset="36%" stopColor="rgba(104,216,192,0.28)" />
        <stop offset="50%" stopColor="rgba(134,183,232,0.22)" />
        <stop offset="64%" stopColor="rgba(104,216,192,0.28)" />
        <stop offset="84%" stopColor="rgba(134,183,232,0.62)" />
        <stop offset="100%" stopColor="rgba(104,216,192,0.88)" />
      </linearGradient>
      <linearGradient
        id={`${idPrefix}-trail`}
        x1="0"
        y1="0"
        x2="1600"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="rgba(104,216,192,0.5)" />
        <stop offset="20%" stopColor="rgba(134,183,232,0.28)" />
        <stop offset="50%" stopColor="rgba(104,216,192,0.1)" />
        <stop offset="80%" stopColor="rgba(134,183,232,0.28)" />
        <stop offset="100%" stopColor="rgba(104,216,192,0.5)" />
      </linearGradient>
      <radialGradient id={`${idPrefix}-bloom`} cx="50%" cy="50%" r="52%">
        <stop offset="0%" stopColor="rgba(104,216,192,0.2)" />
        <stop offset="40%" stopColor="rgba(134,183,232,0.08)" />
        <stop offset="100%" stopColor="rgba(8,16,24,0)" />
      </radialGradient>
      <filter id={`${idPrefix}-blur`} x="-20%" y="-180%" width="140%" height="460%">
        <feGaussianBlur stdDeviation="10" />
      </filter>
      <filter id={`${idPrefix}-soft`} x="-8%" y="-80%" width="116%" height="260%">
        <feGaussianBlur stdDeviation="3.5" />
      </filter>
    </defs>
  );
}

function LivePulseSpark({
  length,
  reduceMotion,
}: {
  length: number;
  reduceMotion: boolean;
}) {
  if (length <= 0 || reduceMotion) return null;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path
        className="landing-v2-closing-spark"
        d={LANDING_PULSE_PATH}
        stroke="rgba(104,216,192,0.38)"
        strokeWidth="6"
        strokeDasharray={`${SPARK_TRAIL} ${length}`}
      />
      <path
        className="landing-v2-closing-spark"
        d={LANDING_PULSE_PATH}
        stroke="rgba(104,216,192,0.72)"
        strokeWidth="2.6"
        strokeDasharray={`${SPARK_CORE} ${length}`}
      />
      <path
        className="landing-v2-closing-spark"
        d={LANDING_PULSE_PATH}
        stroke="rgba(232,246,255,0.92)"
        strokeWidth="1.8"
        strokeDasharray={`${SPARK_HEAD} ${length}`}
      />
    </g>
  );
}

function RevealedPass({
  d,
  length,
  idPrefix,
  passClass,
  progress,
  opacity,
  sparkOpacity,
  showSpark,
}: {
  d: string;
  length: number;
  idPrefix: string;
  passClass: string;
  progress: MotionValue<number>;
  opacity: MotionValue<number>;
  sparkOpacity: MotionValue<number>;
  showSpark: boolean;
}) {
  const drawDashoffset = useTransform(
    progress,
    (value) => pulseRevealOffsets(value, length).drawDashoffset,
  );
  const sparkHeadDashoffset = useTransform(
    progress,
    (value) => pulseRevealOffsets(value, length).sparkHeadDashoffset,
  );
  const sparkCoreDashoffset = useTransform(
    progress,
    (value) => pulseRevealOffsets(value, length).sparkCoreDashoffset,
  );
  const sparkTrailDashoffset = useTransform(
    progress,
    (value) => pulseRevealOffsets(value, length).sparkTrailDashoffset,
  );

  return (
    <motion.g className={passClass} style={{ opacity }}>
      <motion.path
        className="landing-v2-flatline-draw"
        d={d}
        fill="none"
        stroke={`url(#${idPrefix}-trail)`}
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${idPrefix}-blur)`}
        opacity="0.55"
        strokeDasharray={length}
        style={{ strokeDashoffset: drawDashoffset }}
      />
      <motion.path
        className="landing-v2-flatline-draw"
        d={d}
        fill="none"
        stroke={`url(#${idPrefix}-trail)`}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${idPrefix}-soft)`}
        opacity="0.7"
        strokeDasharray={length}
        style={{ strokeDashoffset: drawDashoffset }}
      />
      <motion.path
        className="landing-v2-flatline-draw"
        d={d}
        fill="none"
        stroke={`url(#${idPrefix}-stroke)`}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length}
        style={{ strokeDashoffset: drawDashoffset }}
      />
      {showSpark && length > 0 ? (
        <motion.g
          className="landing-v2-flatline-spark-g"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: sparkOpacity }}
        >
          <motion.path
            className="landing-v2-flatline-spark"
            d={d}
            stroke="rgba(104,216,192,0.38)"
            strokeWidth="6"
            strokeDasharray={`${SPARK_TRAIL} ${length}`}
            style={{ strokeDashoffset: sparkTrailDashoffset }}
          />
          <motion.path
            className="landing-v2-flatline-spark"
            d={d}
            stroke="rgba(104,216,192,0.72)"
            strokeWidth="2.6"
            strokeDasharray={`${SPARK_CORE} ${length}`}
            style={{ strokeDashoffset: sparkCoreDashoffset }}
          />
          <motion.path
            className="landing-v2-flatline-spark"
            d={d}
            stroke="rgba(232,246,255,0.92)"
            strokeWidth="1.8"
            strokeDasharray={`${SPARK_HEAD} ${length}`}
            style={{ strokeDashoffset: sparkHeadDashoffset }}
          />
        </motion.g>
      ) : null}
    </motion.g>
  );
}

function FlatlinePasses({
  idPrefix,
  reduceMotion,
}: {
  idPrefix: string;
  reduceMotion: boolean;
}) {
  const twoRef = useRef<SVGPathElement>(null);
  const oneRef = useRef<SVGPathElement>(null);
  const flatRef = useRef<SVGPathElement>(null);
  const [lengths, setLengths] = useState({ two: 0, one: 0, flat: 0 });
  const [passIndex, setPassIndex] = useState(0);
  const [done, setDone] = useState(false);
  const progress = useMotionValue(0);
  const passOpacity = useMotionValue(1);
  const sparkOpacity = useMotionValue(1);
  const ready = !reduceMotion && lengths.two > 0 && lengths.one > 0 && lengths.flat > 0;

  useLayoutEffect(() => {
    const two = twoRef.current?.getTotalLength() ?? 0;
    const one = oneRef.current?.getTotalLength() ?? 0;
    const flat = flatRef.current?.getTotalLength() ?? 0;
    setLengths({ two, one, flat });
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    let running: { stop: () => void } | undefined;

    async function run() {
      const wait = (seconds: number) =>
        new Promise<void>((resolve) => {
          window.setTimeout(resolve, seconds * 1000);
        });

      for (let index = 0; index < 3; index += 1) {
        if (cancelled) return;
        progress.set(0);
        sparkOpacity.set(1);
        passOpacity.set(0);
        setPassIndex(index);
        setDone(false);
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
        if (cancelled) return;
        passOpacity.set(1);
        const draw = animate(progress, 1, {
          type: "tween",
          duration: DRAW_DURATION_S,
          ease: REVEAL_EASE,
        });
        running = draw;
        await draw;
        if (cancelled) return;
        if (index < 2) {
          await wait(HOLD_DURATION_S);
          if (cancelled) return;
          const fade = animate(passOpacity, 0, { duration: FADE_DURATION_S, ease: "linear" });
          running = fade;
          await fade;
        } else {
          const sparkOut = animate(sparkOpacity, 0, {
            duration: FADE_DURATION_S,
            ease: "linear",
          });
          running = sparkOut;
          await sparkOut;
          if (!cancelled) setDone(true);
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
      running?.stop();
    };
  }, [passOpacity, progress, ready, sparkOpacity]);

  if (reduceMotion) {
    return (
      <>
        <path
          d={LANDING_FLATLINE_PATH}
          fill="none"
          stroke={`url(#${idPrefix}-trail)`}
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${idPrefix}-blur)`}
          opacity="0.55"
        />
        <path
          d={LANDING_FLATLINE_PATH}
          fill="none"
          stroke={`url(#${idPrefix}-trail)`}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${idPrefix}-soft)`}
          opacity="0.7"
        />
        <path
          d={LANDING_FLATLINE_PATH}
          fill="none"
          stroke={`url(#${idPrefix}-stroke)`}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    );
  }

  const passes = [
    { d: LANDING_TWO_PEAK_PATH, length: lengths.two, className: "landing-v2-flatline-pass-1" },
    { d: LANDING_PULSE_PATH, length: lengths.one, className: "landing-v2-flatline-pass-2" },
    { d: LANDING_FLATLINE_PATH, length: lengths.flat, className: "landing-v2-flatline-pass-3" },
  ] as const;
  const active = passes[passIndex] ?? passes[0];

  return (
    <g
      className={ready ? "landing-v2-flatline-armed" : undefined}
      data-flatline-pass={passIndex + 1}
      data-flatline-done={done ? "true" : "false"}
    >
      <path
        ref={twoRef}
        d={LANDING_TWO_PEAK_PATH}
        fill="none"
        stroke="none"
        aria-hidden="true"
      />
      <path
        ref={oneRef}
        d={LANDING_PULSE_PATH}
        fill="none"
        stroke="none"
        aria-hidden="true"
      />
      <path
        ref={flatRef}
        d={LANDING_FLATLINE_PATH}
        fill="none"
        stroke="none"
        aria-hidden="true"
      />
      {active.length > 0 ? (
        <RevealedPass
          d={active.d}
          length={active.length}
          idPrefix={idPrefix}
          passClass={active.className}
          progress={progress}
          opacity={passOpacity}
          sparkOpacity={sparkOpacity}
          showSpark={!done}
        />
      ) : null}
    </g>
  );
}

/**
 * Landing ECG stroke. `live` is the closing-section behaviour; `flatline`
 * is three left-to-right reveals (two peaks → one peak → rest line).
 */
export function LandingPulseWave({
  variant,
  reduceMotion,
  live = false,
}: LandingPulseWaveProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);
  const isLive = variant === "live";
  const idPrefix = isLive ? "landing-v2-closing" : "landing-v2-flatline";
  const armed = isLive && !reduceMotion && length > 0;

  useLayoutEffect(() => {
    if (!isLive) return;
    const path = pathRef.current;
    if (!path) return;
    setLength(path.getTotalLength());
  }, [isLive]);

  return (
    <svg
      viewBox={isLive ? LIVE_VIEWBOX : FLATLINE_VIEWBOX}
      preserveAspectRatio={isLive ? "xMidYMid slice" : "xMidYMid meet"}
      overflow={isLive ? "hidden" : "visible"}
      className={`${isLive ? "h-full w-full" : "h-auto w-full overflow-visible"}${armed ? " landing-v2-closing-pulse-armed" : ""}${live && armed ? " landing-v2-closing-pulse-live" : ""}`}
      aria-hidden="true"
      data-pulse-variant={variant}
      style={
        {
          "--landing-v2-closing-len": length,
          "--landing-v2-closing-head": SPARK_HEAD,
          ...(isLive ? {} : { aspectRatio: FLATLINE_ASPECT }),
        } as CSSProperties
      }
    >
      {isLive ? (
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
      ) : null}
      <PulseDefs idPrefix={idPrefix} />

      <ellipse cx="220" cy="200" rx="260" ry="90" fill={`url(#${idPrefix}-bloom)`} />
      <ellipse cx="1380" cy="200" rx="260" ry="90" fill={`url(#${idPrefix}-bloom)`} />
      <ellipse
        className={isLive ? "landing-v2-closing-peak" : undefined}
        cx="800"
        cy="200"
        rx="300"
        ry="96"
        fill={`url(#${idPrefix}-bloom)`}
        opacity={variant === "flatline" ? 0.18 : 0.55}
      />

      {isLive ? (
        <>
          <path
            d={LANDING_PULSE_PATH}
            fill="none"
            stroke={`url(#${idPrefix}-trail)`}
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${idPrefix}-blur)`}
            opacity="0.55"
          />
          <path
            d={LANDING_PULSE_PATH}
            fill="none"
            stroke={`url(#${idPrefix}-trail)`}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${idPrefix}-soft)`}
            opacity="0.7"
          />
          <path
            ref={pathRef}
            d={LANDING_PULSE_PATH}
            fill="none"
            stroke={`url(#${idPrefix}-stroke)`}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <LivePulseSpark length={length} reduceMotion={reduceMotion} />
        </>
      ) : (
        <FlatlinePasses idPrefix={idPrefix} reduceMotion={reduceMotion} />
      )}

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
