import type { CSSProperties } from "react";
import {
  BREATHING_CYCLE_MS,
  BREATHING_PHASE_MS,
  BREATHING_SCALE,
  breathingScale,
  type BreathingSnapshot,
} from "./breathing-session.js";
import type { SupportResourceGroupId, SupportTool } from "./support-links.js";

/** SUP-ASSET-01 illustrations: PNG masters with one 768 px WebP each (`optimize-sup-asset-01.mjs`). */
export const SUPPORT_ILLUSTRATION_DIR = "/images/support";
export const SUPPORT_ILLUSTRATION_SIZE = { width: 768, height: 512 } as const;

export const supportToolIllustrations: Record<SupportTool, string> = {
  breathing: "support-breathing",
  mindfulness: "support-mindfulness",
  movement: "support-activity",
  craving: "support-craving",
};

export const supportResourceIllustrations: Record<SupportResourceGroupId, string> = {
  processes: "support-learning",
  reading: "support-reading",
  audio: "support-audio",
};

export function supportIllustrationSrc(name: string, format: "webp" | "png"): string {
  return `${SUPPORT_ILLUSTRATION_DIR}/${name}.${format}`;
}

/** Colors of the breathing circle and the backdrop it sits on. */
export const breathingVisual = { rgb: "103 232 249", haloRgb: "139 92 246" } as const;

export const breathingBackdrop: CSSProperties = {
  background: `radial-gradient(circle at 50% 55%, rgb(${breathingVisual.rgb} / 0.42) 0%, rgb(${breathingVisual.haloRgb} / 0.32) 34%, transparent 70%), linear-gradient(180deg, rgb(var(--soma-shell-rail) / 0.5) 0%, rgb(var(--soma-surface) / 0.2) 100%)`,
};

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
