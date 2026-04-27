import type { PrismaClient } from '@prisma/client';

export const DAMAGE_PROFILES = [
  // ---------------------------------------------------------------------------
  // Alcohol — see docs/recovery-curves/alcohol.md
  // ---------------------------------------------------------------------------
  {
    substanceId: 'alcohol',
    organId: 'liver',
    maxSeverity: 85,
    confidenceLevel: 'high' as const,
    referenceSource: 'Lieber (2004). Alcoholic fatty liver: its pathogenesis and mechanism of progression to inflammation and fibrosis.',
  },
  {
    substanceId: 'alcohol',
    organId: 'brain-prefrontal-cortex',
    maxSeverity: 70,
    confidenceLevel: 'high' as const,
    referenceSource: 'Sullivan & Pfefferbaum (2005). Neurocircuitry in alcoholism: a substrate of disruption and repair.',
  },
  {
    substanceId: 'alcohol',
    organId: 'brain-hippocampus',
    maxSeverity: 65,
    confidenceLevel: 'high' as const,
    referenceSource: 'Agartz et al. (1999). Hippocampal volume in patients with alcohol dependence.',
  },
  {
    substanceId: 'alcohol',
    organId: 'brain-vta',
    maxSeverity: 60,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Koob & Volkow (2016). Neurobiology of addiction: a neurocircuitry analysis.',
  },
  {
    substanceId: 'alcohol',
    organId: 'brain-nucleus-accumbens',
    maxSeverity: 60,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Koob & Volkow (2016). Neurobiology of addiction: a neurocircuitry analysis.',
  },
  {
    substanceId: 'alcohol',
    organId: 'heart',
    maxSeverity: 55,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Piano (2017). Alcoholic cardiomyopathy: pathogenesis, epidemiology, and therapy. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'alcohol',
    organId: 'stomach',
    maxSeverity: 50,
    confidenceLevel: 'high' as const,
    referenceSource: 'Bode & Bode (1997). Alcohol\'s role in gastrointestinal tract disorders. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'alcohol',
    organId: 'pancreas',
    maxSeverity: 60,
    confidenceLevel: 'high' as const,
    referenceSource: 'Apte et al. (2010). Mechanisms of alcoholic pancreatitis. [NEEDS-VERIFICATION]',
  },

  // ---------------------------------------------------------------------------
  // Nicotine — see docs/recovery-curves/nicotine.md
  // ---------------------------------------------------------------------------
  {
    substanceId: 'nicotine',
    organId: 'lungs',
    maxSeverity: 80,
    confidenceLevel: 'high' as const,
    referenceSource: 'USDHHS (2014). The Health Consequences of Smoking — 50 Years of Progress. Surgeon General\'s Report.',
  },
  {
    substanceId: 'nicotine',
    organId: 'bronchi',
    maxSeverity: 85,
    confidenceLevel: 'high' as const,
    referenceSource: 'USDHHS (2014). The Health Consequences of Smoking — 50 Years of Progress.',
  },
  {
    substanceId: 'nicotine',
    organId: 'heart',
    maxSeverity: 70,
    confidenceLevel: 'high' as const,
    referenceSource: 'USDHHS (2014). The Health Consequences of Smoking — 50 Years of Progress.',
  },
  {
    substanceId: 'nicotine',
    organId: 'brain-vta',
    maxSeverity: 55,
    confidenceLevel: 'high' as const,
    referenceSource: 'Benowitz (2010). Nicotine addiction. NEJM. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'nicotine',
    organId: 'brain-nucleus-accumbens',
    maxSeverity: 55,
    confidenceLevel: 'high' as const,
    referenceSource: 'Benowitz (2010). Nicotine addiction. NEJM. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'nicotine',
    organId: 'brain-prefrontal-cortex',
    maxSeverity: 40,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Durazzo et al. (2010). Chronic cigarette smoking: implications for neurocognition and brain neurobiology. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'nicotine',
    organId: 'skin',
    maxSeverity: 50,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Morita (2007). Tobacco smoke causes premature skin aging. [NEEDS-VERIFICATION]',
  },

  // ---------------------------------------------------------------------------
  // Cannabis — see docs/recovery-curves/cannabis.md
  // ---------------------------------------------------------------------------
  {
    substanceId: 'cannabis',
    organId: 'brain-prefrontal-cortex',
    maxSeverity: 50,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Volkow et al. (2016). Adverse health effects of marijuana use. NEJM. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cannabis',
    organId: 'brain-hippocampus',
    maxSeverity: 55,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Lorenzetti et al. (2016). Structural MRI findings in long-term cannabis users. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cannabis',
    organId: 'brain-vta',
    maxSeverity: 45,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Bloomfield et al. (2016). The effects of cannabis on the dopamine system. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cannabis',
    organId: 'brain-nucleus-accumbens',
    maxSeverity: 45,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Bloomfield et al. (2016). The effects of cannabis on the dopamine system. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cannabis',
    organId: 'brain-amygdala',
    maxSeverity: 40,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Lorenzetti et al. (2016). Structural MRI findings in long-term cannabis users. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cannabis',
    organId: 'lungs',
    maxSeverity: 50,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Tashkin (2013). Effects of marijuana smoking on the lung. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cannabis',
    organId: 'bronchi',
    maxSeverity: 60,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Tashkin (2013). Effects of marijuana smoking on the lung. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cannabis',
    organId: 'heart',
    maxSeverity: 40,
    confidenceLevel: 'low' as const,
    referenceSource: 'Richards et al. (2019). Cannabis use and cardiovascular health. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cannabis',
    organId: 'testes',
    maxSeverity: 30,
    confidenceLevel: 'low' as const,
    referenceSource: 'du Plessis et al. (2015). Marijuana, phytocannabinoids, the endocannabinoid system, and male fertility. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cannabis',
    organId: 'ovaries',
    maxSeverity: 30,
    confidenceLevel: 'low' as const,
    referenceSource: 'Brents (2016). Marijuana, the endocannabinoid system and the female reproductive system. [NEEDS-VERIFICATION]',
  },

  // ---------------------------------------------------------------------------
  // Cocaine — see docs/recovery-curves/cocaine.md
  // ---------------------------------------------------------------------------
  {
    substanceId: 'cocaine',
    organId: 'heart',
    maxSeverity: 85,
    confidenceLevel: 'high' as const,
    referenceSource: 'Schwartz et al. (2010). Cardiovascular effects of cocaine. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cocaine',
    organId: 'brain-vta',
    maxSeverity: 75,
    confidenceLevel: 'high' as const,
    referenceSource: 'Volkow et al. (1993). Decreased dopamine D2 receptor availability is associated with reduced frontal metabolism in cocaine abusers.',
  },
  {
    substanceId: 'cocaine',
    organId: 'brain-nucleus-accumbens',
    maxSeverity: 75,
    confidenceLevel: 'high' as const,
    referenceSource: 'Volkow et al. (1993). Decreased dopamine D2 receptor availability is associated with reduced frontal metabolism in cocaine abusers.',
  },
  {
    substanceId: 'cocaine',
    organId: 'brain-prefrontal-cortex',
    maxSeverity: 65,
    confidenceLevel: 'high' as const,
    referenceSource: 'Goldstein & Volkow (2011). Dysfunction of the prefrontal cortex in addiction: neuroimaging findings and clinical implications.',
  },
  {
    substanceId: 'cocaine',
    organId: 'brain-amygdala',
    maxSeverity: 55,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Ersche et al. (2011). Abnormal brain structure implicated in stimulant drug addiction. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cocaine',
    organId: 'lungs',
    maxSeverity: 55,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Restrepo et al. (2007). Pulmonary complications from cocaine and cocaine-based substances. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cocaine',
    organId: 'bronchi',
    maxSeverity: 60,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Restrepo et al. (2007). Pulmonary complications from cocaine and cocaine-based substances. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cocaine',
    organId: 'kidneys',
    maxSeverity: 50,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Jaffe & Kimmel (2006). Chronic nephropathies of cocaine and heroin abuse. [NEEDS-VERIFICATION]',
  },
  {
    substanceId: 'cocaine',
    organId: 'liver',
    maxSeverity: 40,
    confidenceLevel: 'medium' as const,
    referenceSource: 'Cocaethylene formation in combined alcohol and cocaine use. [NEEDS-VERIFICATION]',
  },
] satisfies Array<{
  substanceId: string;
  organId: string;
  maxSeverity: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  referenceSource: string;
}>;

export async function seedDamageProfiles(prisma: PrismaClient): Promise<void> {
  for (const profile of DAMAGE_PROFILES) {
    await prisma.organDamageProfile.upsert({
      where: {
        organId_substanceId: {
          organId: profile.organId,
          substanceId: profile.substanceId,
        },
      },
      create: profile,
      update: profile,
    });
  }
}