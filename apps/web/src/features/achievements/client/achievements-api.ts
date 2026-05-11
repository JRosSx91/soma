import { apiRequest } from '../../auth/client/api.js';
import type { AchievementWithUnlockState } from '../types.js';

export function fetchAchievements(): Promise<AchievementWithUnlockState[]> {
  return apiRequest<AchievementWithUnlockState[]>('/me/achievements');
}

export function markAchievementsAsNotified(
  achievementIds: string[],
): Promise<{ updated: number }> {
  return apiRequest<{ updated: number }>('/me/achievements/mark-notified', {
    method: 'POST',
    body: { achievementIds },
  });
}