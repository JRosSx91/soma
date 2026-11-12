import type { CSSProperties } from "react";
import { Flower2, Footprints, WavesHorizontal, Wind, type LucideIcon } from "lucide-react";
import {
  BREATHING_CYCLE_MS,
  BREATHING_PHASE_MS,
  BREATHING_SCALE,
  breathingScale,
  type BreathingSnapshot,
} from "./breathing-session.js";
import type { SupportTool } from "./support-links.js";

export interface SupportVisual {
  icon: LucideIcon;
  /** Icon color, also used for its soft glow. */
  rgb: string;
  /** Second color of the radial backdrop. */
  haloRgb: string;
}

export const supportToolVisuals: Record<SupportTool, SupportVisual> = {
  breathing: { icon: Wind, rgb: "103 232 249", haloRgb: "139 92 246" },
  mindfulness: { icon: Flower2, rgb: "196 181 253", haloRgb: "217 70 239" },
  movement: { icon: Footprints, rgb: "253 186 116", haloRgb: "56 189 248" },
  craving: { icon: WavesHorizontal, rgb: "125 211 252", haloRgb: "59 130 246" },
};

export function supportBackdrop({ rgb, haloRgb }: SupportVisual, dim = false): CSSProperties {
  const a = dim ? 0.14 : 0.42;
  return {
    background: `radial-gradient(circle at 50% 55%, rgb(${rgb} / ${a}) 0%, rgb(${haloRgb} / ${a * 0.75}) 34%, transparent 70%), linear-gradient(180deg, rgb(var(--soma-shell-rail) / 0.5) 0%, rgb(var(--soma-surface) / 0.2) 100%)`,
  };
}

export const BREATHING_ANIMATION_NAME = "soma-breathing-cycle";

const inhaleEndPercent = (BREATHING_PHASE_MS.inhale / BREATHING_CYCLE_MS) * 100;

/** One full cycle, built from the same constants as the session model. */
export const breathingKeyframes = `@keyframes ${BREATHING_ANIMATION_NAME} { 0%, 100% { transform: scale(${BREATHING_SCALE.min}); } ${inhaleEndPercent}% { transform: scale(${BREATHING_SCALE.max}); } }`;

/**
 * While running, the circle plays one linear cycle animation offset to where
 * the run segment began. Its timeline advances with real time, so it cannot
 * drift from the clock the way chained per-phase transitions do (an
 * interrupted transition is shortened when it reverses). Paused and idle
 * states hold the exact computed scale with no animation.
 */
export function breathingCircleStyle(snapshot: BreathingSnapshot): CSSProperties {
  if (snapshot.status === "running") {
    return {
      animation: `${BREATHING_ANIMATION_NAME} ${BREATHING_CYCLE_MS}ms linear ${-Math.round(snapshot.runOffsetMs)}ms infinite`,
    };
  }
  const scale =
    snapshot.status === "paused"
      ? breathingScale(snapshot.phase, snapshot.phaseProgress)
      : BREATHING_SCALE.min;
  return { transform: `scale(${scale.toFixed(4)})` };
}

export function supportGlowIcon({ rgb }: SupportVisual, dim = false): CSSProperties {
  return {
    color: `rgb(${rgb} / ${dim ? 0.6 : 1})`,
    filter: dim
      ? undefined
      : `drop-shadow(0 0 6px rgb(${rgb} / 0.9)) drop-shadow(0 0 18px rgb(${rgb} / 0.55))`,
  };
}
