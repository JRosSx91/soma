import type { BiologicalSex, SubstanceId } from '@soma/shared-types';

export interface ProfileUsage {
  substanceId: SubstanceId;
  yearStarted: number;
  lastUseDate: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
}

export interface UserProfile {
  displayName: string;
  biologicalSex: BiologicalSex;
  birthYear: number;
  weightKg?: number;
  usages: ProfileUsage[];
}