import type { PrismaClient } from '@prisma/client';

export const SUBSTANCES = [
  {
    id: 'alcohol',
    name: 'Alcohol',
    category: 'depressant' as const,
    shortDescription:
      'Central nervous system depressant. Chronic use primarily affects the liver, brain, and cardiovascular system.',
  },
  {
    id: 'nicotine',
    name: 'Nicotine',
    category: 'nicotine' as const,
    shortDescription:
      'Stimulant alkaloid found in tobacco. Chronic use primarily affects the respiratory and cardiovascular systems, and produces strong neuroadaptive changes.',
  },
  {
    id: 'cannabis',
    name: 'Cannabis',
    category: 'cannabinoid' as const,
    shortDescription:
      'Acts through CB1 and CB2 receptors. Chronic use primarily affects the endocannabinoid system, with secondary effects on memory, mood, and (in smoked consumption) the respiratory system.',
  },
  {
    id: 'cocaine',
    name: 'Cocaine',
    category: 'stimulant' as const,
    shortDescription:
      'Potent stimulant that blocks monoamine reuptake. Chronic use strongly impacts the cardiovascular system and the dopaminergic reward circuits.',
  },
] satisfies Array<{
  id: string;
  name: string;
  category: 'depressant' | 'stimulant' | 'cannabinoid' | 'nicotine' | 'opioid' | 'hallucinogen' | 'dissociative';
  shortDescription: string;
}>;

export async function seedSubstances(prisma: PrismaClient): Promise<void> {
  for (const substance of SUBSTANCES) {
    await prisma.substance.upsert({
      where: { id: substance.id },
      create: substance,
      update: substance,
    });
  }
}