import type { PrismaClient } from '@prisma/client';

/**
 * Catálogo de logros fisiológicos. Cada logro está vinculado a un par
 * (sustancia, órgano) y se dispara cuando la recuperación de ese órgano
 * alcanza un umbral concreto.
 *
 * Los textos visibles para el usuario (título y descripción) viven en
 * los archivos de i18n del frontend bajo el namespace `achievements`.
 * Aquí solo guardamos las claves; el frontend las resuelve.
 *
 * Convención de claves:
 *   title:       <achievement-id>.title
 *   description: <achievement-id>.description
 *
 * Ejemplo: la fila con id "alcohol-liver-bronze" tiene:
 *   titleKey       = "alcohol-liver-bronze.title"
 *   descriptionKey = "alcohol-liver-bronze.description"
 */
export const ACHIEVEMENTS = [
  // ---------------------------------------------------------------------------
  // Alcohol
  // ---------------------------------------------------------------------------

  // BRONZE
  {
    id: 'alcohol-acute-survival-bronze',
    tier: 'bronze' as const,
    titleKey: 'alcohol-acute-survival-bronze.title',
    descriptionKey: 'alcohol-acute-survival-bronze.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.05,
  },
  {
    id: 'alcohol-liver-bronze-1',
    tier: 'bronze' as const,
    titleKey: 'alcohol-liver-bronze-1.title',
    descriptionKey: 'alcohol-liver-bronze-1.description',
    triggerOrganId: 'liver',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.10,
  },
  {
    id: 'alcohol-vta-bronze',
    tier: 'bronze' as const,
    titleKey: 'alcohol-vta-bronze.title',
    descriptionKey: 'alcohol-vta-bronze.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.15,
  },
  {
    id: 'alcohol-liver-bronze-2',
    tier: 'bronze' as const,
    titleKey: 'alcohol-liver-bronze-2.title',
    descriptionKey: 'alcohol-liver-bronze-2.description',
    triggerOrganId: 'liver',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.25,
  },
  {
    id: 'alcohol-prefrontal-bronze',
    tier: 'bronze' as const,
    titleKey: 'alcohol-prefrontal-bronze.title',
    descriptionKey: 'alcohol-prefrontal-bronze.description',
    triggerOrganId: 'brain-prefrontal-cortex',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.25,
  },
  {
    id: 'alcohol-heart-bronze',
    tier: 'bronze' as const,
    titleKey: 'alcohol-heart-bronze.title',
    descriptionKey: 'alcohol-heart-bronze.description',
    triggerOrganId: 'heart',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.25,
  },
  {
    id: 'alcohol-stomach-bronze',
    tier: 'bronze' as const,
    titleKey: 'alcohol-stomach-bronze.title',
    descriptionKey: 'alcohol-stomach-bronze.description',
    triggerOrganId: 'stomach',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.30,
  },
  {
    id: 'alcohol-pancreas-bronze',
    tier: 'bronze' as const,
    titleKey: 'alcohol-pancreas-bronze.title',
    descriptionKey: 'alcohol-pancreas-bronze.description',
    triggerOrganId: 'pancreas',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.30,
  },
  {
    id: 'alcohol-sleep-bronze',
    tier: 'bronze' as const,
    titleKey: 'alcohol-sleep-bronze.title',
    descriptionKey: 'alcohol-sleep-bronze.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.35,
  },

  // SILVER
  {
    id: 'alcohol-vta-silver',
    tier: 'silver' as const,
    titleKey: 'alcohol-vta-silver.title',
    descriptionKey: 'alcohol-vta-silver.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.50,
  },
  {
    id: 'alcohol-prefrontal-silver',
    tier: 'silver' as const,
    titleKey: 'alcohol-prefrontal-silver.title',
    descriptionKey: 'alcohol-prefrontal-silver.description',
    triggerOrganId: 'brain-prefrontal-cortex',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.50,
  },
  {
    id: 'alcohol-liver-silver',
    tier: 'silver' as const,
    titleKey: 'alcohol-liver-silver.title',
    descriptionKey: 'alcohol-liver-silver.description',
    triggerOrganId: 'liver',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.50,
  },
  {
    id: 'alcohol-hippocampus-silver',
    tier: 'silver' as const,
    titleKey: 'alcohol-hippocampus-silver.title',
    descriptionKey: 'alcohol-hippocampus-silver.description',
    triggerOrganId: 'brain-hippocampus',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.50,
  },
  {
    id: 'alcohol-heart-silver',
    tier: 'silver' as const,
    titleKey: 'alcohol-heart-silver.title',
    descriptionKey: 'alcohol-heart-silver.description',
    triggerOrganId: 'heart',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.60,
  },
  {
    id: 'alcohol-prefrontal-silver-2',
    tier: 'silver' as const,
    titleKey: 'alcohol-prefrontal-silver-2.title',
    descriptionKey: 'alcohol-prefrontal-silver-2.description',
    triggerOrganId: 'brain-prefrontal-cortex',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.65,
  },
  {
    id: 'alcohol-pancreas-silver',
    tier: 'silver' as const,
    titleKey: 'alcohol-pancreas-silver.title',
    descriptionKey: 'alcohol-pancreas-silver.description',
    triggerOrganId: 'pancreas',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.65,
  },
  {
    id: 'alcohol-stomach-silver',
    tier: 'silver' as const,
    titleKey: 'alcohol-stomach-silver.title',
    descriptionKey: 'alcohol-stomach-silver.description',
    triggerOrganId: 'stomach',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.70,
  },

  // GOLD
  {
    id: 'alcohol-hippocampus-gold',
    tier: 'gold' as const,
    titleKey: 'alcohol-hippocampus-gold.title',
    descriptionKey: 'alcohol-hippocampus-gold.description',
    triggerOrganId: 'brain-hippocampus',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.75,
  },
  {
    id: 'alcohol-liver-gold',
    tier: 'gold' as const,
    titleKey: 'alcohol-liver-gold.title',
    descriptionKey: 'alcohol-liver-gold.description',
    triggerOrganId: 'liver',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.80,
  },
  {
    id: 'alcohol-vta-gold',
    tier: 'gold' as const,
    titleKey: 'alcohol-vta-gold.title',
    descriptionKey: 'alcohol-vta-gold.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.80,
  },

  // PLATINUM
  {
    id: 'alcohol-sovereignty-platinum',
    tier: 'platinum' as const,
    titleKey: 'alcohol-sovereignty-platinum.title',
    descriptionKey: 'alcohol-sovereignty-platinum.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'alcohol',
    triggerRecoveryThreshold: 0.99,
  },

  // ---------------------------------------------------------------------------
  // Nicotine
  // ---------------------------------------------------------------------------
  {
    id: 'nicotine-bronchi-bronze-1',
    tier: 'bronze' as const,
    titleKey: 'nicotine-bronchi-bronze-1.title',
    descriptionKey: 'nicotine-bronchi-bronze-1.description',
    triggerOrganId: 'bronchi',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.10,
  },
  {
    id: 'nicotine-bronchi-bronze-2',
    tier: 'bronze' as const,
    titleKey: 'nicotine-bronchi-bronze-2.title',
    descriptionKey: 'nicotine-bronchi-bronze-2.description',
    triggerOrganId: 'bronchi',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.20,
  },
  {
    id: 'nicotine-bronchi-silver',
    tier: 'silver' as const,
    titleKey: 'nicotine-bronchi-silver.title',
    descriptionKey: 'nicotine-bronchi-silver.description',
    triggerOrganId: 'bronchi',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.60,
  },
  {
    id: 'nicotine-lungs-bronze',
    tier: 'bronze' as const,
    titleKey: 'nicotine-lungs-bronze.title',
    descriptionKey: 'nicotine-lungs-bronze.description',
    triggerOrganId: 'lungs',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.25,
  },
  {
    id: 'nicotine-lungs-silver',
    tier: 'silver' as const,
    titleKey: 'nicotine-lungs-silver.title',
    descriptionKey: 'nicotine-lungs-silver.description',
    triggerOrganId: 'lungs',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.50,
  },
  {
    id: 'nicotine-lungs-gold',
    tier: 'gold' as const,
    titleKey: 'nicotine-lungs-gold.title',
    descriptionKey: 'nicotine-lungs-gold.description',
    triggerOrganId: 'lungs',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.75,
  },
  {
    id: 'nicotine-heart-bronze',
    tier: 'bronze' as const,
    titleKey: 'nicotine-heart-bronze.title',
    descriptionKey: 'nicotine-heart-bronze.description',
    triggerOrganId: 'heart',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.30,
  },
  {
    id: 'nicotine-heart-silver',
    tier: 'silver' as const,
    titleKey: 'nicotine-heart-silver.title',
    descriptionKey: 'nicotine-heart-silver.description',
    triggerOrganId: 'heart',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.55,
  },
  {
    id: 'nicotine-heart-gold',
    tier: 'gold' as const,
    titleKey: 'nicotine-heart-gold.title',
    descriptionKey: 'nicotine-heart-gold.description',
    triggerOrganId: 'heart',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.70,
  },
  {
    id: 'nicotine-vta-bronze',
    tier: 'bronze' as const,
    titleKey: 'nicotine-vta-bronze.title',
    descriptionKey: 'nicotine-vta-bronze.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.30,
  },
  {
    id: 'nicotine-vta-silver',
    tier: 'silver' as const,
    titleKey: 'nicotine-vta-silver.title',
    descriptionKey: 'nicotine-vta-silver.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.60,
  },
  {
    id: 'nicotine-vta-gold',
    tier: 'gold' as const,
    titleKey: 'nicotine-vta-gold.title',
    descriptionKey: 'nicotine-vta-gold.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.85,
  },
  // PLATINUM
  {
    id: 'nicotine-sovereignty-platinum',
    tier: 'platinum' as const,
    titleKey: 'nicotine-sovereignty-platinum.title',
    descriptionKey: 'nicotine-sovereignty-platinum.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'nicotine',
    triggerRecoveryThreshold: 0.99,
  },

  // ---------------------------------------------------------------------------
  // Cannabis
  // ---------------------------------------------------------------------------

  // BRONZE
  {
    id: 'cannabis-vta-bronze-1',
    tier: 'bronze' as const,
    titleKey: 'cannabis-vta-bronze-1.title',
    descriptionKey: 'cannabis-vta-bronze-1.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.10,
  },
  {
    id: 'cannabis-prefrontal-bronze-1',
    tier: 'bronze' as const,
    titleKey: 'cannabis-prefrontal-bronze-1.title',
    descriptionKey: 'cannabis-prefrontal-bronze-1.description',
    triggerOrganId: 'brain-prefrontal-cortex',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.15,
  },
  {
    id: 'cannabis-bronchi-bronze',
    tier: 'bronze' as const,
    titleKey: 'cannabis-bronchi-bronze.title',
    descriptionKey: 'cannabis-bronchi-bronze.description',
    triggerOrganId: 'bronchi',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.25,
  },
  {
    id: 'cannabis-hippocampus-bronze',
    tier: 'bronze' as const,
    titleKey: 'cannabis-hippocampus-bronze.title',
    descriptionKey: 'cannabis-hippocampus-bronze.description',
    triggerOrganId: 'brain-hippocampus',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.30,
  },
  {
    id: 'cannabis-vta-bronze-2',
    tier: 'bronze' as const,
    titleKey: 'cannabis-vta-bronze-2.title',
    descriptionKey: 'cannabis-vta-bronze-2.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.30,
  },

  // SILVER
  {
    id: 'cannabis-prefrontal-silver-1',
    tier: 'silver' as const,
    titleKey: 'cannabis-prefrontal-silver-1.title',
    descriptionKey: 'cannabis-prefrontal-silver-1.description',
    triggerOrganId: 'brain-prefrontal-cortex',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.50,
  },
  {
    id: 'cannabis-hippocampus-silver',
    tier: 'silver' as const,
    titleKey: 'cannabis-hippocampus-silver.title',
    descriptionKey: 'cannabis-hippocampus-silver.description',
    triggerOrganId: 'brain-hippocampus',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.55,
  },
  {
    id: 'cannabis-bronchi-silver',
    tier: 'silver' as const,
    titleKey: 'cannabis-bronchi-silver.title',
    descriptionKey: 'cannabis-bronchi-silver.description',
    triggerOrganId: 'bronchi',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.60,
  },
  {
    id: 'cannabis-prefrontal-silver-2',
    tier: 'silver' as const,
    titleKey: 'cannabis-prefrontal-silver-2.title',
    descriptionKey: 'cannabis-prefrontal-silver-2.description',
    triggerOrganId: 'brain-prefrontal-cortex',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.65,
  },
  {
    id: 'cannabis-vta-silver-1',
    tier: 'silver' as const,
    titleKey: 'cannabis-vta-silver-1.title',
    descriptionKey: 'cannabis-vta-silver-1.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.70,
  },
  {
    id: 'cannabis-vta-silver-2',
    tier: 'silver' as const,
    titleKey: 'cannabis-vta-silver-2.title',
    descriptionKey: 'cannabis-vta-silver-2.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.80,
  },

  // GOLD
  {
    id: 'cannabis-hippocampus-gold',
    tier: 'gold' as const,
    titleKey: 'cannabis-hippocampus-gold.title',
    descriptionKey: 'cannabis-hippocampus-gold.description',
    triggerOrganId: 'brain-hippocampus',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.75,
  },
  {
    id: 'cannabis-prefrontal-gold',
    tier: 'gold' as const,
    titleKey: 'cannabis-prefrontal-gold.title',
    descriptionKey: 'cannabis-prefrontal-gold.description',
    triggerOrganId: 'brain-prefrontal-cortex',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.85,
  },
  {
    id: 'cannabis-vta-gold',
    tier: 'gold' as const,
    titleKey: 'cannabis-vta-gold.title',
    descriptionKey: 'cannabis-vta-gold.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.90,
  },

  // PLATINUM
  {
    id: 'cannabis-sovereignty-platinum',
    tier: 'platinum' as const,
    titleKey: 'cannabis-sovereignty-platinum.title',
    descriptionKey: 'cannabis-sovereignty-platinum.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cannabis',
    triggerRecoveryThreshold: 0.99,
  },
  // ---------------------------------------------------------------------------
  // Cocaine
  // ---------------------------------------------------------------------------

  // BRONZE
  {
    id: 'cocaine-vta-bronze-1',
    tier: 'bronze' as const,
    titleKey: 'cocaine-vta-bronze-1.title',
    descriptionKey: 'cocaine-vta-bronze-1.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.05,
  },
  {
    id: 'cocaine-heart-bronze-1',
    tier: 'bronze' as const,
    titleKey: 'cocaine-heart-bronze-1.title',
    descriptionKey: 'cocaine-heart-bronze-1.description',
    triggerOrganId: 'heart',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.10,
  },
  {
    id: 'cocaine-heart-bronze-2',
    tier: 'bronze' as const,
    titleKey: 'cocaine-heart-bronze-2.title',
    descriptionKey: 'cocaine-heart-bronze-2.description',
    triggerOrganId: 'heart',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.15,
  },
  {
    id: 'cocaine-bronchi-bronze-1',
    tier: 'bronze' as const,
    titleKey: 'cocaine-bronchi-bronze-1.title',
    descriptionKey: 'cocaine-bronchi-bronze-1.description',
    triggerOrganId: 'bronchi',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.20,
  },
  {
    id: 'cocaine-vta-bronze-2',
    tier: 'bronze' as const,
    titleKey: 'cocaine-vta-bronze-2.title',
    descriptionKey: 'cocaine-vta-bronze-2.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.30,
  },
  {
    id: 'cocaine-vta-bronze-3',
    tier: 'bronze' as const,
    titleKey: 'cocaine-vta-bronze-3.title',
    descriptionKey: 'cocaine-vta-bronze-3.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.35,
  },
  {
    id: 'cocaine-heart-bronze-3',
    tier: 'bronze' as const,
    titleKey: 'cocaine-heart-bronze-3.title',
    descriptionKey: 'cocaine-heart-bronze-3.description',
    triggerOrganId: 'heart',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.20,
  },

  // SILVER
  {
    id: 'cocaine-prefrontal-silver-1',
    tier: 'silver' as const,
    titleKey: 'cocaine-prefrontal-silver-1.title',
    descriptionKey: 'cocaine-prefrontal-silver-1.description',
    triggerOrganId: 'brain-prefrontal-cortex',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.40,
  },
  {
    id: 'cocaine-heart-silver-1',
    tier: 'silver' as const,
    titleKey: 'cocaine-heart-silver-1.title',
    descriptionKey: 'cocaine-heart-silver-1.description',
    triggerOrganId: 'heart',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.45,
  },
  {
    id: 'cocaine-prefrontal-silver-2',
    tier: 'silver' as const,
    titleKey: 'cocaine-prefrontal-silver-2.title',
    descriptionKey: 'cocaine-prefrontal-silver-2.description',
    triggerOrganId: 'brain-prefrontal-cortex',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.55,
  },
  {
    id: 'cocaine-vta-silver-1',
    tier: 'silver' as const,
    titleKey: 'cocaine-vta-silver-1.title',
    descriptionKey: 'cocaine-vta-silver-1.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.65,
  },
  {
    id: 'cocaine-prefrontal-silver-3',
    tier: 'silver' as const,
    titleKey: 'cocaine-prefrontal-silver-3.title',
    descriptionKey: 'cocaine-prefrontal-silver-3.description',
    triggerOrganId: 'brain-prefrontal-cortex',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.60,
  },
  {
    id: 'cocaine-prefrontal-silver-4',
    tier: 'silver' as const,
    titleKey: 'cocaine-prefrontal-silver-4.title',
    descriptionKey: 'cocaine-prefrontal-silver-4.description',
    triggerOrganId: 'brain-prefrontal-cortex',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.65,
  },
  {
    id: 'cocaine-heart-silver-2',
    tier: 'silver' as const,
    titleKey: 'cocaine-heart-silver-2.title',
    descriptionKey: 'cocaine-heart-silver-2.description',
    triggerOrganId: 'heart',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.60,
  },
  {
    id: 'cocaine-heart-silver-3',
    tier: 'silver' as const,
    titleKey: 'cocaine-heart-silver-3.title',
    descriptionKey: 'cocaine-heart-silver-3.description',
    triggerOrganId: 'heart',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.70,
  },

  // GOLD
  {
    id: 'cocaine-hippocampus-gold-1',
    tier: 'gold' as const,
    titleKey: 'cocaine-hippocampus-gold-1.title',
    descriptionKey: 'cocaine-hippocampus-gold-1.description',
    triggerOrganId: 'brain-hippocampus',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.75,
  },
  {
    id: 'cocaine-vta-gold-1',
    tier: 'gold' as const,
    titleKey: 'cocaine-vta-gold-1.title',
    descriptionKey: 'cocaine-vta-gold-1.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.80,
  },
  {
    id: 'cocaine-heart-gold-1',
    tier: 'gold' as const,
    titleKey: 'cocaine-heart-gold-1.title',
    descriptionKey: 'cocaine-heart-gold-1.description',
    triggerOrganId: 'heart',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.90,
  },
  {
    id: 'cocaine-liver-gold-1',
    tier: 'gold' as const,
    titleKey: 'cocaine-liver-gold-1.title',
    descriptionKey: 'cocaine-liver-gold-1.description',
    triggerOrganId: 'liver',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.92,
  },

  // PLATINUM
  {
    id: 'cocaine-sovereignty-platinum',
    tier: 'platinum' as const,
    titleKey: 'cocaine-sovereignty-platinum.title',
    descriptionKey: 'cocaine-sovereignty-platinum.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'cocaine',
    triggerRecoveryThreshold: 0.99,
  },

  // ---------------------------------------------------------------------------
  // Caffeine
  // ---------------------------------------------------------------------------

  // BRONZE
  {
    id: 'caffeine-vta-bronze-1',
    tier: 'bronze' as const,
    titleKey: 'caffeine-vta-bronze-1.title',
    descriptionKey: 'caffeine-vta-bronze-1.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'caffeine',
    triggerRecoveryThreshold: 0.10,
  },
  {
    id: 'caffeine-vta-bronze-2',
    tier: 'bronze' as const,
    titleKey: 'caffeine-vta-bronze-2.title',
    descriptionKey: 'caffeine-vta-bronze-2.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'caffeine',
    triggerRecoveryThreshold: 0.30,
  },
  {
    id: 'caffeine-heart-bronze',
    tier: 'bronze' as const,
    titleKey: 'caffeine-heart-bronze.title',
    descriptionKey: 'caffeine-heart-bronze.description',
    triggerOrganId: 'heart',
    triggerSubstanceId: 'caffeine',
    triggerRecoveryThreshold: 0.50,
  },
  {
    id: 'caffeine-stomach-bronze',
    tier: 'bronze' as const,
    titleKey: 'caffeine-stomach-bronze.title',
    descriptionKey: 'caffeine-stomach-bronze.description',
    triggerOrganId: 'stomach',
    triggerSubstanceId: 'caffeine',
    triggerRecoveryThreshold: 0.60,
  },

  // SILVER
  {
    id: 'caffeine-vta-silver-1',
    tier: 'silver' as const,
    titleKey: 'caffeine-vta-silver-1.title',
    descriptionKey: 'caffeine-vta-silver-1.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'caffeine',
    triggerRecoveryThreshold: 0.55,
  },
  {
    id: 'caffeine-vta-silver-2',
    tier: 'silver' as const,
    titleKey: 'caffeine-vta-silver-2.title',
    descriptionKey: 'caffeine-vta-silver-2.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'caffeine',
    triggerRecoveryThreshold: 0.75,
  },
  {
    id: 'caffeine-vta-silver-3',
    tier: 'silver' as const,
    titleKey: 'caffeine-vta-silver-3.title',
    descriptionKey: 'caffeine-vta-silver-3.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'caffeine',
    triggerRecoveryThreshold: 0.85,
  },
  {
    id: 'caffeine-vta-silver-4',
    tier: 'silver' as const,
    titleKey: 'caffeine-vta-silver-4.title',
    descriptionKey: 'caffeine-vta-silver-4.description',
    triggerOrganId: 'brain-vta',
    triggerSubstanceId: 'caffeine',
    triggerRecoveryThreshold: 0.95,
  },
] satisfies Array<{
  id: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  titleKey: string;
  descriptionKey: string;
  triggerOrganId: string;
  triggerSubstanceId: string;
  triggerRecoveryThreshold: number;
}>;

export async function seedAchievements(prisma: PrismaClient): Promise<void> {
  // Achievements are reference data — wipe and recreate on every seed
  // run so the DB exactly mirrors the catalog defined here.
  // UserAchievement rows referencing deleted achievements would be
  // orphaned, so we delete them too. Users get their unlocks
  // recomputed on next login (the detection service is idempotent).
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();

  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.create({ data: achievement });
  }
}