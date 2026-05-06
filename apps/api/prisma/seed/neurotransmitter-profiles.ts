import type { PrismaClient } from '@prisma/client';

/**
 * Seeds the neurotransmitter profiles for each substance Soma models.
 *
 * Data is qualitative (severity, direction, phase) rather than
 * numeric. The literature on exact neurotransmitter recovery
 * timelines is highly variable across individuals; honest qualitative
 * data is more useful — and more truthful — than fabricated precision.
 *
 * Symptom descriptions are stored as i18n keys, with the corresponding
 * translations living in the frontend's locale files.
 *
 * References:
 *   - Koob GF, Volkow ND. Neurobiology of addiction: a neurocircuitry
 *     analysis. Lancet Psychiatry. 2016.
 *   - Stahl SM. Essential Psychopharmacology, 5th ed., 2021. Ch. 14.
 *   - American Psychiatric Association. DSM-5-TR. 2022.
 *   - Goodman & Gilman's. The Pharmacological Basis of Therapeutics,
 *     14th ed., 2022.
 *   - NIDA Research Reports (substance-specific).
 *
 * Idempotent: deletes and recreates all neurotransmitter profiles
 * on each run, so editing this file and re-seeding works cleanly.
 */

type Phase =
  | 'during_use'
  | 'acute_withdrawal'
  | 'post_acute'
  | 'normalizing';

type Severity = 'severe' | 'moderate' | 'mild' | 'normalizing';

type Direction =
  | 'depleted'
  | 'elevated'
  | 'oscillating'
  | 'normalizing';

type Neurotransmitter =
  | 'dopamine'
  | 'serotonin'
  | 'gaba'
  | 'glutamate'
  | 'acetylcholine'
  | 'norepinephrine'
  | 'endocannabinoid'
  | 'endorphin';

interface PhaseDefinition {
  phase: Phase;
  startDay: number;
  endDay: number | null;
  severity: Severity;
  direction: Direction;
}

interface ProfileDefinition {
  substanceId: string;
  neurotransmitter: Neurotransmitter;
  confidenceLevel: 'high' | 'medium' | 'low';
  referenceSource: string;
  phases: PhaseDefinition[];
}

/**
 * Standardized phase day-ranges. Per-substance refinement is a
 * future enhancement. For v1 these uniform ranges reflect the broad
 * pattern across substances modeled.
 */
const PHASE_RANGES: Record<Phase, { startDay: number; endDay: number | null }> = {
  during_use:       { startDay: 0,   endDay: 0   },
  acute_withdrawal: { startDay: 1,   endDay: 7   },
  post_acute:       { startDay: 8,   endDay: 56  },
  normalizing:      { startDay: 57,  endDay: null },
};

function makePhase(
  phase: Phase,
  severity: Severity,
  direction: Direction,
): PhaseDefinition {
  return {
    phase,
    ...PHASE_RANGES[phase],
    severity,
    direction,
  };
}

const PROFILES: ProfileDefinition[] = [
  // ---------------------------------------------------------------------------
  // Alcohol
  // ---------------------------------------------------------------------------
  {
    substanceId: 'alcohol',
    neurotransmitter: 'gaba',
    confidenceLevel: 'high',
    referenceSource: 'DSM-5-TR; Stahl 2021 ch. 14; Koob & Volkow 2016',
    phases: [
      makePhase('during_use',       'severe',     'elevated'),
      makePhase('acute_withdrawal', 'severe',     'depleted'),
      makePhase('post_acute',       'moderate',   'depleted'),
      makePhase('normalizing',      'mild',       'normalizing'),
    ],
  },
  {
    substanceId: 'alcohol',
    neurotransmitter: 'glutamate',
    confidenceLevel: 'high',
    referenceSource: 'Stahl 2021 ch. 14; Goodman & Gilman 14th ed.',
    phases: [
      makePhase('during_use',       'moderate',   'depleted'),
      makePhase('acute_withdrawal', 'severe',     'elevated'),
      makePhase('post_acute',       'mild',       'elevated'),
      makePhase('normalizing',      'mild',       'normalizing'),
    ],
  },
  {
    substanceId: 'alcohol',
    neurotransmitter: 'dopamine',
    confidenceLevel: 'medium',
    referenceSource: 'Koob & Volkow 2016; NIDA Alcohol Research Report',
    phases: [
      makePhase('during_use',       'mild',       'elevated'),
      makePhase('acute_withdrawal', 'moderate',   'depleted'),
      makePhase('post_acute',       'mild',       'depleted'),
      makePhase('normalizing',      'mild',       'normalizing'),
    ],
  },
  {
    substanceId: 'alcohol',
    neurotransmitter: 'serotonin',
    confidenceLevel: 'medium',
    referenceSource: 'Stahl 2021 ch. 14',
    phases: [
      makePhase('during_use',       'moderate',   'oscillating'),
      makePhase('acute_withdrawal', 'moderate',   'depleted'),
      makePhase('post_acute',       'mild',       'normalizing'),
      makePhase('normalizing',      'mild',       'normalizing'),
    ],
  },

  // ---------------------------------------------------------------------------
  // Cocaine
  // ---------------------------------------------------------------------------
  {
    substanceId: 'cocaine',
    neurotransmitter: 'dopamine',
    confidenceLevel: 'high',
    referenceSource: 'Koob & Volkow 2016; NIDA Cocaine Research Report; Stahl 2021',
    phases: [
      makePhase('during_use',       'severe',     'elevated'),
      makePhase('acute_withdrawal', 'severe',     'depleted'),
      makePhase('post_acute',       'moderate',   'depleted'),
      makePhase('normalizing',      'mild',       'normalizing'),
    ],
  },
  {
    substanceId: 'cocaine',
    neurotransmitter: 'norepinephrine',
    confidenceLevel: 'high',
    referenceSource: 'Goodman & Gilman 14th ed.; Stahl 2021',
    phases: [
      makePhase('during_use',       'severe',     'elevated'),
      makePhase('acute_withdrawal', 'severe',     'depleted'),
      makePhase('post_acute',       'moderate',   'oscillating'),
      makePhase('normalizing',      'mild',       'normalizing'),
    ],
  },
  {
    substanceId: 'cocaine',
    neurotransmitter: 'serotonin',
    confidenceLevel: 'medium',
    referenceSource: 'Stahl 2021 ch. 14',
    phases: [
      makePhase('during_use',       'moderate',   'elevated'),
      makePhase('acute_withdrawal', 'moderate',   'depleted'),
      makePhase('post_acute',       'mild',       'depleted'),
      makePhase('normalizing',      'mild',       'normalizing'),
    ],
  },

  // ---------------------------------------------------------------------------
  // Nicotine
  // ---------------------------------------------------------------------------
  {
    substanceId: 'nicotine',
    neurotransmitter: 'acetylcholine',
    confidenceLevel: 'high',
    referenceSource: 'NIDA Tobacco Research Report; Stahl 2021 ch. 14',
    phases: [
      makePhase('during_use',       'moderate',   'elevated'),
      makePhase('acute_withdrawal', 'severe',     'depleted'),
      makePhase('post_acute',       'moderate',   'depleted'),
      makePhase('normalizing',      'mild',       'normalizing'),
    ],
  },
  {
    substanceId: 'nicotine',
    neurotransmitter: 'dopamine',
    confidenceLevel: 'high',
    referenceSource: 'Koob & Volkow 2016; NIDA Tobacco Research Report',
    phases: [
      makePhase('during_use',       'moderate',   'elevated'),
      makePhase('acute_withdrawal', 'moderate',   'depleted'),
      makePhase('post_acute',       'mild',       'depleted'),
      makePhase('normalizing',      'mild',       'normalizing'),
    ],
  },

  // ---------------------------------------------------------------------------
  // Cannabis
  // ---------------------------------------------------------------------------
  {
    substanceId: 'cannabis',
    neurotransmitter: 'endocannabinoid',
    confidenceLevel: 'high',
    referenceSource: 'NIDA Marijuana Research Report; Stahl 2021 ch. 14',
    phases: [
      makePhase('during_use',       'severe',     'elevated'),
      makePhase('acute_withdrawal', 'moderate',   'depleted'),
      makePhase('post_acute',       'mild',       'depleted'),
      makePhase('normalizing',      'mild',       'normalizing'),
    ],
  },
  {
    substanceId: 'cannabis',
    neurotransmitter: 'dopamine',
    confidenceLevel: 'medium',
    referenceSource: 'Koob & Volkow 2016',
    phases: [
      makePhase('during_use',       'mild',       'elevated'),
      makePhase('acute_withdrawal', 'mild',       'depleted'),
      makePhase('post_acute',       'mild',       'normalizing'),
      makePhase('normalizing',      'mild',       'normalizing'),
    ],
  },
  {
    substanceId: 'cannabis',
    neurotransmitter: 'gaba',
    confidenceLevel: 'medium',
    referenceSource: 'Stahl 2021 ch. 14',
    phases: [
      makePhase('during_use',       'mild',       'oscillating'),
      makePhase('acute_withdrawal', 'mild',       'depleted'),
      makePhase('post_acute',       'mild',       'normalizing'),
      makePhase('normalizing',      'mild',       'normalizing'),
    ],
  },
];

function buildSymptomKey(
  substanceId: string,
  neurotransmitter: Neurotransmitter,
  phase: Phase,
): string {
  return `${substanceId}.${neurotransmitter}.${phase}`;
}

export async function seedNeurotransmitterProfiles(
  prisma: PrismaClient,
): Promise<void> {
  // Idempotent strategy: delete all profiles (cascade deletes phases),
  // then recreate. Profiles are static seed data, no user references.
  await prisma.neurotransmitterPhase.deleteMany();
  await prisma.neurotransmitterProfile.deleteMany();

  for (const profile of PROFILES) {
    await prisma.neurotransmitterProfile.create({
      data: {
        substanceId: profile.substanceId,
        neurotransmitter: profile.neurotransmitter,
        confidenceLevel: profile.confidenceLevel,
        referenceSource: profile.referenceSource,
        phases: {
          create: profile.phases.map((phase) => ({
            phase: phase.phase,
            startDay: phase.startDay,
            endDay: phase.endDay,
            severity: phase.severity,
            direction: phase.direction,
            symptomKey: buildSymptomKey(
              profile.substanceId,
              profile.neurotransmitter,
              phase.phase,
            ),
          })),
        },
      },
    });
  }
}