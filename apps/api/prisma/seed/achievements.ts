import type { PrismaClient } from '@prisma/client';

export const ACHIEVEMENTS = [
  // ---------------------------------------------------------------------------
  // Alcohol
  // ---------------------------------------------------------------------------
  {
    id: 'alcohol-liver-bronze',
    tier: 'bronze' as const,
    title: 'First signs of hepatic recovery',
    physiologicalDescription:
      'Hepatic steatosis begins reversing within the first two weeks of abstinence. Lipid deposits are metabolized and hepatocyte function improves measurably.',
    triggerOrganId: 'liver',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.25,
  },
  {
    id: 'alcohol-liver-silver',
    tier: 'silver' as const,
    title: 'Liver function restored',
    physiologicalDescription:
      'Transaminase levels (ALT, AST) approach normal ranges. Liver fat content is substantially reduced.',
    triggerOrganId: 'liver',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.50,
  },
  {
    id: 'alcohol-liver-gold',
    tier: 'gold' as const,
    title: 'Hepatic regeneration nearly complete',
    physiologicalDescription:
      'The liver has regenerated most of its functional tissue. Fibrosis, if mild, has partially reversed.',
    triggerOrganId: 'liver',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.80,
  },
  {
    id: 'alcohol-prefrontal-silver',
    tier: 'silver' as const,
    title: 'Cognitive control recovering',
    physiologicalDescription:
      'Gray matter volume in the prefrontal cortex is increasing. Executive function, impulse control, and decision-making improve.',
    triggerOrganId: 'brain-prefrontal-cortex',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.50,
  },
  {
    id: 'alcohol-vta-gold',
    tier: 'gold' as const,
    title: 'Reward system recalibrating',
    physiologicalDescription:
      'Dopamine receptor density is approaching baseline. Natural rewards begin to feel meaningful again, reducing anhedonia.',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.80,
  },

  // ---------------------------------------------------------------------------
  // Nicotine
  // ---------------------------------------------------------------------------
  {
    id: 'nicotine-bronchi-bronze',
    tier: 'bronze' as const,
    title: 'Cilia awakening',
    physiologicalDescription:
      'Within 72 hours of cessation, bronchial cilia begin restoring their rhythmic motion. The mucociliary escalator starts clearing accumulated tar and particulates.',
    triggerOrganId: 'bronchi',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.20,
  },
  {
    id: 'nicotine-bronchi-silver',
    tier: 'silver' as const,
    title: 'Breathing easier',
    physiologicalDescription:
      'Bronchial mucosa has largely recovered. Chronic cough reduces, exercise tolerance noticeably improves.',
    triggerOrganId: 'bronchi',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.60,
  },
  {
    id: 'nicotine-lungs-silver',
    tier: 'silver' as const,
    title: 'Pulmonary capacity rebounding',
    physiologicalDescription:
      'Forced expiratory volume (FEV1) is improving. The rate of age-related lung function decline has normalized to that of a non-smoker.',
    triggerOrganId: 'lungs',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.50,
  },
  {
    id: 'nicotine-heart-gold',
    tier: 'gold' as const,
    title: 'Cardiovascular risk halved',
    physiologicalDescription:
      'The risk of myocardial infarction has dropped dramatically. Platelet aggregation, endothelial function, and lipid profiles are approaching non-smoker ranges.',
    triggerOrganId: 'heart',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.70,
  },
  {
    id: 'nicotine-vta-silver',
    tier: 'silver' as const,
    title: 'Nicotinic receptors recalibrating',
    physiologicalDescription:
      'Upregulated nicotinic acetylcholine receptors are returning to baseline density. Cravings intensity and frequency are decreasing measurably.',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.60,
  },
  {
    id: 'nicotine-vta-gold',
    tier: 'gold' as const,
    title: 'Reward system restored',
    physiologicalDescription:
      'Dopamine release in response to natural rewards is normalizing. The brain no longer depends on nicotine to trigger pleasure responses.',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.85,
  },

  // ---------------------------------------------------------------------------
  // Cannabis
  // ---------------------------------------------------------------------------
  {
    id: 'cannabis-vta-bronze',
    tier: 'bronze' as const,
    title: 'CB1 receptors awakening',
    physiologicalDescription:
      'Downregulated CB1 receptors in the reward system are beginning to restore density. The brain is regaining sensitivity to its own endocannabinoid signaling.',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.30,
  },
  {
    id: 'cannabis-vta-silver',
    tier: 'silver' as const,
    title: 'Endocannabinoid system restored',
    physiologicalDescription:
      'CB1 receptor density has largely normalized. Natural rewards — food, social connection, physical activity — regain their full motivational weight.',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.70,
  },
  {
    id: 'cannabis-prefrontal-silver',
    tier: 'silver' as const,
    title: 'Executive function sharpening',
    physiologicalDescription:
      'Prefrontal cortex activity patterns are normalizing. Working memory, attention, and planning capabilities improve measurably.',
    triggerOrganId: 'brain-prefrontal-cortex',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.50,
  },
  {
    id: 'cannabis-hippocampus-gold',
    tier: 'gold' as const,
    title: 'Memory consolidation restored',
    physiologicalDescription:
      'Hippocampal structure and function are approaching baseline. Short-term memory encoding and spatial memory show sustained improvement.',
    triggerOrganId: 'brain-hippocampus',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.75,
  },
  {
    id: 'cannabis-bronchi-silver',
    tier: 'silver' as const,
    title: 'Airways clearing',
    physiologicalDescription:
      'Chronic bronchitis symptoms — cough, sputum production, wheeze — are resolving. Bronchial inflammation markers return toward baseline.',
    triggerOrganId: 'bronchi',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.60,
  },

  // ---------------------------------------------------------------------------
  // Cocaine
  // ---------------------------------------------------------------------------
  {
    id: 'cocaine-heart-bronze',
    tier: 'bronze' as const,
    title: 'Blood pressure normalizing',
    physiologicalDescription:
      'Resting blood pressure and heart rate are returning to baseline. Acute cardiovascular risk from each day of use has been eliminated.',
    triggerOrganId: 'heart',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.25,
  },
  {
    id: 'cocaine-heart-silver',
    tier: 'silver' as const,
    title: 'Endothelial function recovering',
    physiologicalDescription:
      'The inner lining of blood vessels is healing. Vasospasm risk is decreasing, and circulation is improving measurably.',
    triggerOrganId: 'heart',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.50,
  },
  {
    id: 'cocaine-vta-bronze',
    tier: 'bronze' as const,
    title: 'First dopamine rebound',
    physiologicalDescription:
      'Dopamine D2 receptor density is beginning to recover from the deep downregulation caused by chronic stimulant use.',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.25,
  },
  {
    id: 'cocaine-vta-silver',
    tier: 'silver' as const,
    title: 'Reward system rebuilding',
    physiologicalDescription:
      'Substantial recovery of striatal dopamine signaling. Natural rewards — food, music, social connection, exercise — are regaining their motivational salience.',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.60,
  },
  {
    id: 'cocaine-vta-gold',
    tier: 'gold' as const,
    title: 'Dopaminergic system restored',
    physiologicalDescription:
      'D2 receptor availability has reached near-baseline levels. The anhedonia characteristic of early abstinence has substantially resolved.',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.85,
  },
  {
    id: 'cocaine-prefrontal-silver',
    tier: 'silver' as const,
    title: 'Executive function recovering',
    physiologicalDescription:
      'Prefrontal cortex activity patterns are normalizing. Impulse control, working memory, and decision-making show sustained improvement.',
    triggerOrganId: 'brain-prefrontal-cortex',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.50,
  },
  {
    id: 'cocaine-prefrontal-gold',
    tier: 'gold' as const,
    title: 'Cognitive control restored',
    physiologicalDescription:
      'Executive function has largely normalized. Cue-reactivity and craving intensity are substantially reduced.',
    triggerOrganId: 'brain-prefrontal-cortex',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.80,
  },
] satisfies Array<{
  id: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  title: string;
  physiologicalDescription: string;
  triggerOrganId: string;
  triggerSubstanceId: string;
  triggerRecoveryThreshold: number;
}>;

export async function seedAchievements(prisma: PrismaClient): Promise<void> {
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { id: achievement.id },
      create: achievement,
      update: achievement,
    });
  }
}