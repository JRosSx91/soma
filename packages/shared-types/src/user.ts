import type { SubstanceId } from './substances.js';

export type BiologicalSex = 'male' | 'female';

export interface SubstanceUsage {
  substanceId: SubstanceId;
  yearStarted: number;
  lastUseDate: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
}

export interface UserProfile {
  id: string;
  displayName: string;
  biologicalSex: BiologicalSex;
  birthYear: number;
  weightKg?: number;
  usages: SubstanceUsage[];
  createdAt: string;
}