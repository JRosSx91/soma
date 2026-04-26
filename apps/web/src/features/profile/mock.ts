import type { UserProfile } from './types.js';

/**
 * Generic demo profile for v1 development.
 *
 * Designed to exercise all four modeled substances simultaneously, with
 * staggered last-use dates so the UI shows organs at varied recovery
 * states. Not modeled on any real person.
 *
 * Last-use dates are computed at module load time relative to "today",
 * so the demo profile always feels current regardless of when the app
 * is opened.
 */

const DAY_MS = 1000 * 60 * 60 * 24;

function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

export const MOCK_PROFILE: UserProfile = {
  displayName: 'Demo user',
  biologicalSex: 'male',
  birthYear: 1990,
  weightKg: 78,
  usages: [
    {
      // Recently quit nicotine. Bronchi and VTA visibly recovering,
      // lungs and heart still mostly damaged.
      substanceId: 'nicotine',
      yearStarted: 2010,
      lastUseDate: daysAgo(21),
      frequency: 'daily',
    },
    {
      // Cannabis: a few months in. CB1 receptors fully renormalized
      // already (30-day curve), prefrontal/hippocampus mid-recovery.
      substanceId: 'cannabis',
      yearStarted: 2012,
      lastUseDate: daysAgo(90),
      frequency: 'daily',
    },
    {
      // Alcohol: long abstinence. Liver near ceiling, brain structures
      // mid-to-late recovery.
      substanceId: 'alcohol',
      yearStarted: 2008,
      lastUseDate: daysAgo(180),
      frequency: 'weekly',
    },
    {
      // Cocaine: occasional past use, longer abstinence.
      // Dopaminergic system substantially recovered, cardiac structure
      // limited by lower ceiling.
      substanceId: 'cocaine',
      yearStarted: 2015,
      lastUseDate: daysAgo(300),
      frequency: 'occasional',
    },
  ],
};