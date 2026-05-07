import type { PrismaClient } from '@prisma/client';

/**
 * Curvas de recuperación por par (sustancia, órgano).
 *
 * Cada entrada se corresponde directamente con una fila de la tabla
 * "Recovery curves" del documento correspondiente en
 * `docs/recovery-curves/<substance>.md`.
 */
export const RECOVERY_CURVES = [
  // ---------------------------------------------------------------------------
  // Alcohol
  // ---------------------------------------------------------------------------
  {
    substanceId: 'alcohol',
    organId: 'liver',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 90,
    recoveryCeiling: 0.95,
    confidenceLevel: 'high' as const,
    referenceSource: 'Lieber (2004). Early steatosis reverses in 2-6 weeks, mild fibrosis partially reversible over months.',
  },
  {
    substanceId: 'alcohol',
    organId: 'brain-prefrontal-cortex',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 365,
    recoveryCeiling: 0.85,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Pfefferbaum et al. (1995). Gray matter recovery in abstinent alcoholics over months.',
  },
  {
    substanceId: 'alcohol',
    organId: 'brain-hippocampus',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 540,
    recoveryCeiling: 0.80,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Agartz et al. (2003). Partial hippocampal volume recovery in long-term abstinence. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'alcohol',
    organId: 'brain-vta',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 180,
    recoveryCeiling: 0.90,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Volkow et al. (2007). Dopamine D2 receptor recovery in abstinent subjects.',
  },
  {
    substanceId: 'alcohol',
    organId: 'brain-nucleus-accumbens',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 180,
    recoveryCeiling: 0.90,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Volkow et al. (2007). Dopamine D2 receptor recovery in abstinent subjects.',
  },
  {
    substanceId: 'alcohol',
    organId: 'heart',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 365,
    recoveryCeiling: 0.85,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Piano (2017). Alcoholic cardiomyopathy. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'alcohol',
    organId: 'stomach',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 60,
    recoveryCeiling: 1.00,
    confidenceLevel: 'high' as const,
    referenceSource: 'Gastric mucosa regenerates rapidly; complete recovery typical without chronic gastritis. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'alcohol',
    organId: 'pancreas',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 180,
    recoveryCeiling: 0.75,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Apte et al. (2010). Acute pancreatitis resolves but chronic changes may persist. [NEEDS-VERIFICATION]',
  },

  // ---------------------------------------------------------------------------
  // Nicotine
  // ---------------------------------------------------------------------------
  {
    substanceId: 'nicotine',
    organId: 'bronchi',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 270,
    recoveryCeiling: 0.90,
    confidenceLevel: 'high' as const,
    referenceSource: 'USDHHS (2014). Ciliary motility restored within 2-3 weeks, mucosal clearance normalizes over 9 months.',
  },
  {
    substanceId: 'nicotine',
    organId: 'lungs',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 365,
    recoveryCeiling: 0.75,
    confidenceLevel: 'high' as const,
    referenceSource: 'USDHHS (2014). FEV1 decline slows to non-smoker rate; lost capacity only partially recovers.',
  },
  {
    substanceId: 'nicotine',
    organId: 'heart',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 365,
    recoveryCeiling: 0.90,
    confidenceLevel: 'high' as const,
    referenceSource: 'USDHHS (2014). Cardiovascular event risk halves in 1 year; approaches non-smoker baseline over 10-15 years.',
  },
  {
    substanceId: 'nicotine',
    organId: 'brain-vta',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 90,
    recoveryCeiling: 0.95,
    confidenceLevel: 'high' as const,
    referenceSource: 'Cosgrove et al. (2009). nAChR upregulation reverses within weeks to months of abstinence. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'nicotine',
    organId: 'brain-nucleus-accumbens',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 90,
    recoveryCeiling: 0.95,
    confidenceLevel: 'high' as const,
    referenceSource: 'Cosgrove et al. (2009). nAChR upregulation reverses within weeks to months of abstinence. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'nicotine',
    organId: 'brain-prefrontal-cortex',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 540,
    recoveryCeiling: 0.85,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Durazzo et al. (2014). Partial recovery of cortical thickness in long-term abstinent smokers. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'nicotine',
    organId: 'skin',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 180,
    recoveryCeiling: 0.80,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Microcirculation and collagen metabolism improve within months; deep wrinkles partially irreversible. [NEEDS-VERIFICATION]',
  },

  // ---------------------------------------------------------------------------
  // Cannabis
  // ---------------------------------------------------------------------------
  {
    substanceId: 'cannabis',
    organId: 'brain-vta',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 30,
    recoveryCeiling: 0.95,
    confidenceLevel: 'high' as const,
    referenceSource: 'Hirvonen et al. (2012). Reversible CB1 receptor downregulation in chronic cannabis smokers.',
  },
  {
    substanceId: 'cannabis',
    organId: 'brain-nucleus-accumbens',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 30,
    recoveryCeiling: 0.95,
    confidenceLevel: 'high' as const,
    referenceSource: 'Hirvonen et al. (2012). Reversible CB1 receptor downregulation in chronic cannabis smokers.',
  },
  {
    substanceId: 'cannabis',
    organId: 'brain-prefrontal-cortex',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 180,
    recoveryCeiling: 0.90,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Schuster et al. (2016). Cognitive recovery in abstinent cannabis users. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cannabis',
    organId: 'brain-hippocampus',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 365,
    recoveryCeiling: 0.85,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Lorenzetti et al. (2016). Volumetric changes partially reversible over months. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cannabis',
    organId: 'brain-amygdala',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 180,
    recoveryCeiling: 0.90,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Lorenzetti et al. (2016). [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cannabis',
    organId: 'bronchi',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 90,
    recoveryCeiling: 0.95,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Tashkin (2013). Chronic bronchitis symptoms largely reversible with cessation. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cannabis',
    organId: 'lungs',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 180,
    recoveryCeiling: 0.90,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Tashkin (2013). Unlike tobacco, no clear association with lung cancer or COPD at typical levels. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cannabis',
    organId: 'heart',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 90,
    recoveryCeiling: 1.00,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Transient cardiovascular effects resolve within days to weeks in users without underlying disease. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cannabis',
    organId: 'testes',
    shape: 'linear' as const,
    daysTo95Recovery: 180,
    recoveryCeiling: 0.95,
    confidenceLevel: 'low' as const,
    referenceSource: 'du Plessis et al. (2015). Sperm parameters recover within 3-6 months of cessation. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cannabis',
    organId: 'ovaries',
    shape: 'linear' as const,
    daysTo95Recovery: 180,
    recoveryCeiling: 0.95,
    confidenceLevel: 'low' as const,
    referenceSource: 'Brents (2016). Hormonal cycle normalization typically within months. [NEEDS-VERIFICATION]',
  },

  // ---------------------------------------------------------------------------
  // Cocaine
  // ---------------------------------------------------------------------------
  {
    substanceId: 'cocaine',
    organId: 'brain-vta',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 270,
    recoveryCeiling: 0.85,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Volkow et al. (1993, 2002). D2 receptor recovery slower and less complete than in other substances.',
  },
  {
    substanceId: 'cocaine',
    organId: 'brain-nucleus-accumbens',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 270,
    recoveryCeiling: 0.85,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Volkow et al. (1993, 2002). D2 receptor recovery slower and less complete than in other substances.',
  },
  {
    substanceId: 'cocaine',
    organId: 'brain-prefrontal-cortex',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 365,
    recoveryCeiling: 0.85,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Goldstein & Volkow (2011). Executive function improves over months of abstinence.',
  },
  {
    substanceId: 'cocaine',
    organId: 'brain-amygdala',
    shape: 'sigmoidal' as const,
    daysTo95Recovery: 365,
    recoveryCeiling: 0.85,
    confidenceLevel: 'low' as const,
    referenceSource: 'Ersche et al. (2011). Structural changes partially reversible; limited literature. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cocaine',
    organId: 'heart',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 540,
    recoveryCeiling: 0.75,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Cardiovascular risk markers improve within weeks to months. Structural changes show limited reversibility. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cocaine',
    organId: 'bronchi',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 90,
    recoveryCeiling: 0.95,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Applies to users who smoked crack; airway inflammation resolves within weeks to months. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cocaine',
    organId: 'lungs',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 180,
    recoveryCeiling: 0.85,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Pulmonary function improves with cessation in crack users; chronic changes may persist. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cocaine',
    organId: 'kidneys',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 180,
    recoveryCeiling: 0.85,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Renal function improves with cessation when no acute injury occurred. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cocaine',
    organId: 'liver',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 90,
    recoveryCeiling: 0.95,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Hepatic recovery rapid in absence of coexisting alcohol use. [NEEDS-VERIFICATION]',
  },
  // ---------------------------------------------------------------------------
  // Caffeine
  // ---------------------------------------------------------------------------
  {
    substanceId: 'caffeine',
    organId: 'heart',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 14,
    recoveryCeiling: 1.00,
    confidenceLevel: 'medium' as const,
    referenceSource: 'AHA position; clinical reviews on caffeine cardiovascular effects. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'caffeine',
    organId: 'stomach',
    shape: 'logarithmic' as const,
    daysTo95Recovery: 21,
    recoveryCeiling: 1.00,
    confidenceLevel: 'medium' as const,
    referenceSource: 'ACG 2020; reviews on caffeine gastric mucosa recovery. [NEEDS-VERIFICATION]',
  },
] satisfies Array<{
  substanceId: string;
  organId: string;
  shape: 'logarithmic' | 'sigmoidal' | 'linear' | 'stepwise';
  daysTo95Recovery: number;
  recoveryCeiling: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  referenceSource: string;
}>;

export async function seedRecoveryCurves(prisma: PrismaClient): Promise<void> {
  for (const curve of RECOVERY_CURVES) {
    await prisma.organRecoveryCurve.upsert({
      where: {
        organId_substanceId: {
          organId: curve.organId,
          substanceId: curve.substanceId,
        },
      },
      create: curve,
      update: curve,
    });
  }
}