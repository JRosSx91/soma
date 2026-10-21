import type { EducationalNeurotransmitter } from "./neurotransmitter-education.ts";

/**
 * Presentation tones for educational signaling marks.
 * They identify the transmitter in the atlas chrome. They are not
 * depletion, elevation, severity, or a recovery percentage.
 */
export const signalingMarkTones = ["action", "physiology", "reward", "warning"] as const;
export type SignalingMarkTone = (typeof signalingMarkTones)[number];

const TONES: Record<EducationalNeurotransmitter, SignalingMarkTone> = {
  dopamine: "reward",
  serotonin: "physiology",
  gaba: "action",
  glutamate: "warning",
  acetylcholine: "physiology",
  norepinephrine: "warning",
  endocannabinoid: "action",
  endorphin: "reward",
  adenosine: "physiology",
};

export function signalingMarkTone(neurotransmitter: EducationalNeurotransmitter): SignalingMarkTone {
  return TONES[neurotransmitter];
}
