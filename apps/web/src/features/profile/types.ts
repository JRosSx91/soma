import type { BiologicalSex, SubstanceId } from '@soma/shared-types';

/**
 * Declared substance use for a single substance in the user's profile.
 *
 * Mirrors the shape of the `SubstanceUsage` model on the backend, but
 * lives in the frontend independently because in v1 we don't yet have
 * authentication and persistence — the profile is local-only.
 *
 * When real user accounts land, this type will be replaced (or aliased)
 * to whatever the API returns for `/users/me`.
 */
export interface ProfileUsage {
  substanceId: SubstanceId;
  /**
   * Approximate year the user started regular use of this substance.
   */
  yearStarted: number;
  /**
   * ISO date of the most recent use. The recovery clock runs from here.
   */
  lastUseDate: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
}

/**
 * Local user profile.
 *
 * For v1 this is a static mock. PR 7 will replace this with an
 * authenticated user fetched from the API.
 */
export interface UserProfile {
  displayName: string;
  biologicalSex: BiologicalSex;
  birthYear: number;
  weightKg?: number;
  usages: ProfileUsage[];
}