import { apiRequest } from '../../auth/client/api.js';
import type { AchievementWithUnlockState } from '../types.js';

export function fetchAchievements(): Promise<AchievementWithUnlockState[]> {
  return apiRequest<AchievementWithUnlockState[]>('/me/achievements');
}