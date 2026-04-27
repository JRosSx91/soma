import type { UserProfile } from './types.js';

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