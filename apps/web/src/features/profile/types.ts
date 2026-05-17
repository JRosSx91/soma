import type { BiologicalSex, SubstanceId, UsageStatus } from '@soma/shared-types';

/**
 * Declared substance use for a single substance in the user's profile.
 *
 * Mirrors the shape of the `SubstanceUsage` model on the backend.
 *
 * `status` distinguishes between users who are abstaining (tracking
 * recovery) and users who are actively consuming (tracking real-time
 * damage but not planning to stop). When `status === 'active'`,
 * `lastUseDate` is null — there's no meaningful "last use" when
 * consumption is ongoing.
 */
export interface ProfileUsage {
  substanceId: SubstanceId;
  /**
   * Approximate year the user started regular use of this substance.
   */
  yearStarted: number;
  /**
   * ISO date of the most recent use. The recovery clock runs from here.
   * Null when `status === 'active'`.
   */
  lastUseDate: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
  /**
   * Whether the user is in abstinence or actively consuming.
   * Defaults to 'abstinent' for backwards compatibility.
   */
  status: UsageStatus;
}

/**
 * Local user profile.
 */
export interface UserProfile {
  displayName: string;
  biologicalSex: BiologicalSex;
  birthYear: number;
  weightKg?: number;
  usages: ProfileUsage[];
}