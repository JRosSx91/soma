import type { Neurotransmitter } from '@prisma/client';

/**
 * Maps each organ to the neurotransmitters whose imbalance is
 * meaningfully expressed there.
 *
 * For v1 we only model brain regions and the heart. Other organs
 * have local neurochemistry (the gut has substantial serotonin,
 * for example) but the user-facing value is highest for these.
 *
 * If an organ is not present in this map, it has no associated
 * neurotransmitter panel.
 */
export const ORGAN_NEUROTRANSMITTERS: Record<string, Neurotransmitter[]> = {
  'brain-prefrontal-cortex': ['dopamine', 'serotonin', 'norepinephrine'],
  'brain-vta': ['dopamine', 'gaba'],
  'brain-nucleus-accumbens': ['dopamine', 'endocannabinoid', 'endorphin'],
  'brain-amygdala': ['gaba', 'norepinephrine', 'serotonin'],
  'brain-hippocampus': ['glutamate', 'acetylcholine'],
  heart: ['norepinephrine'],
};

export function getNeurotransmittersForOrgan(
  organId: string,
): Neurotransmitter[] {
  return ORGAN_NEUROTRANSMITTERS[organId] ?? [];
}