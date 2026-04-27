import type { PrismaClient } from '@prisma/client';

export const ORGANS = [
  // Hepatic system
  {
    id: 'liver',
    name: 'Liver',
    system: 'hepatic' as const,
    shortDescription:
      'Primary site of alcohol metabolism. Highly regenerative under abstinence, though severe long-term damage leaves residual fibrosis.',
  },

  // Cardiovascular system
  {
    id: 'heart',
    name: 'Heart',
    system: 'cardiovascular' as const,
    shortDescription:
      'Affected by stimulants (hypertension, arrhythmia, structural remodeling) and by alcohol (cardiomyopathy). Some structural changes are only partially reversible.',
  },

  // Respiratory system
  {
    id: 'lungs',
    name: 'Lungs',
    system: 'respiratory' as const,
    shortDescription:
      'Alveolar tissue. Damaged primarily by smoked substances. Lost capacity is only partially recoverable in long-term smokers.',
  },
  {
    id: 'bronchi',
    name: 'Bronchi',
    system: 'respiratory' as const,
    shortDescription:
      'Airway passages lined with ciliated epithelium. Ciliary function recovers within days of cessation, making early respiratory recovery highly visible.',
  },

  // Renal system
  {
    id: 'kidneys',
    name: 'Kidneys',
    system: 'renal' as const,
    shortDescription:
      'Filter blood and regulate fluid balance. Affected by chronic stimulant use through sustained hypertension and potential acute injury.',
  },

  // Digestive system
  {
    id: 'stomach',
    name: 'Stomach',
    system: 'digestive' as const,
    shortDescription:
      'Gastric mucosa is damaged by alcohol (direct irritation, altered acid production). Regenerates rapidly under abstinence.',
  },
  {
    id: 'pancreas',
    name: 'Pancreas',
    system: 'digestive' as const,
    shortDescription:
      'Exocrine and endocrine gland. Alcoholic pancreatitis is a major complication; recovery depends on whether acute episodes have occurred.',
  },

  // Central nervous system — modeled at structure-level granularity
  {
    id: 'brain-prefrontal-cortex',
    name: 'Prefrontal cortex',
    system: 'nervous_central' as const,
    shortDescription:
      'Executive function, impulse control, decision-making. Shows gray matter volume changes in chronic substance use, with partial recovery over months.',
  },
  {
    id: 'brain-hippocampus',
    name: 'Hippocampus',
    system: 'nervous_central' as const,
    shortDescription:
      'Memory formation and spatial learning. Affected by alcohol and cannabis; volumetric changes are partially reversible.',
  },
  {
    id: 'brain-vta',
    name: 'Ventral tegmental area',
    system: 'nervous_central' as const,
    shortDescription:
      'Origin of the mesolimbic dopamine pathway. Central to reward processing and craving. Recovery time varies dramatically by substance.',
  },
  {
    id: 'brain-nucleus-accumbens',
    name: 'Nucleus accumbens',
    system: 'nervous_central' as const,
    shortDescription:
      'Target of the mesolimbic dopamine pathway. Chronic use produces receptor-level adaptations that normalize with abstinence.',
  },
  {
    id: 'brain-amygdala',
    name: 'Amygdala',
    system: 'nervous_central' as const,
    shortDescription:
      'Processes emotional salience and threat. Chronically activated by substance cues; normalizes with sustained abstinence.',
  },

  // Integumentary system
  {
    id: 'skin',
    name: 'Skin',
    system: 'integumentary' as const,
    shortDescription:
      'Affected primarily by nicotine through reduced microcirculation and altered collagen metabolism. Some photoaging is irreversible.',
  },

  // Reproductive system
  {
    id: 'testes',
    name: 'Testes',
    system: 'reproductive' as const,
    shortDescription:
      'Spermatogenesis is affected by several substances. Sperm parameters typically recover within months of cessation.',
  },
  {
    id: 'ovaries',
    name: 'Ovaries',
    system: 'reproductive' as const,
    shortDescription:
      'Hormonal cycling can be disrupted by chronic substance use. Typically normalizes within months of cessation.',
  },
] satisfies Array<{
  id: string;
  name: string;
  system:
    | 'respiratory'
    | 'cardiovascular'
    | 'hepatic'
    | 'renal'
    | 'nervous_central'
    | 'nervous_peripheral'
    | 'endocrine'
    | 'reproductive'
    | 'digestive'
    | 'immune'
    | 'integumentary';
  shortDescription: string;
}>;

export async function seedOrgans(prisma: PrismaClient): Promise<void> {
  for (const organ of ORGANS) {
    await prisma.organ.upsert({
      where: { id: organ.id },
      create: organ,
      update: organ,
    });
  }
}