/**
 * GAM-03: canonical map of user actions to rewards.
 *
 * Encodes rules already approved in JRN-01, GAM-01, GAM-02 and ACH-01.
 * Not a Prisma table, not a second economy, not a client grant path.
 * Amounts come only from PROGRESS_XP_AMOUNT.
 *
 * Two different sources for two different actions (journal vs mission) are
 * legitimate. Duplicate processing of the same (userId, source, sourceKey)
 * is the defect this map exists to prevent.
 *
 * `achievement_eligible`, `onboarding_complete` and `referral_qualified`
 * stay reserved: GAM-01 does not grant them. Medals never write XpGrant.
 */

import {
  PROGRESS_XP_AMOUNT,
  type ProgressXpSource,
} from "./progress.js";
import { MISSION_XP_AMOUNT, MISSION_XP_SOURCE } from "./missions.js";

export const GAMIFICATION_USER_ACTIONS = [
  "journal_create",
  "journal_patch",
  "journal_delete",
  "personal_milestone_create",
  "personal_milestone_patch",
  "personal_milestone_delete",
  "mission_submit_correct_first",
  "mission_submit_correct_repeat",
  "mission_submit_incorrect",
  "achievement_detect",
  "relapse_last_use_change",
  "special_category_withdraw",
  "feedback_submit",
] as const;

export type GamificationUserAction =
  (typeof GAMIFICATION_USER_ACTIONS)[number];

export type GamificationXpRule =
  | {
      grants: true;
      source: ProgressXpSource;
      amount: number;
      sourceKey: string;
      idempotency: string;
    }
  | { grants: false; reason: string };

export type GamificationEventRule = {
  action: GamificationUserAction;
  derived: string;
  xp: GamificationXpRule;
  missionProgress: string;
  medalUnlock: string;
  circularRisk: "none" | "guarded";
};

export const GAMIFICATION_EVENT_RULES: readonly GamificationEventRule[] = [
  {
    action: "journal_create",
    derived: "JournalEntry insert",
    xp: {
      grants: true,
      source: "journal_create_day",
      amount: PROGRESS_XP_AMOUNT.journal_create_day,
      sourceKey: "UTC civil date of createdAt (not occurredOn)",
      idempotency: "XpGrant unique (userId, journal_create_day, UTC day)",
    },
    missionProgress: "none",
    medalUnlock: "none",
    circularRisk: "none",
  },
  {
    action: "journal_patch",
    derived: "JournalEntry update",
    xp: { grants: false, reason: "edits do not grant or revoke XP" },
    missionProgress: "none",
    medalUnlock: "none",
    circularRisk: "none",
  },
  {
    action: "journal_delete",
    derived: "JournalEntry delete",
    xp: { grants: false, reason: "deletes do not revoke XP (permanent ledger)" },
    missionProgress: "none",
    medalUnlock: "none",
    circularRisk: "none",
  },
  {
    action: "personal_milestone_create",
    derived: "JournalPersonalMilestone insert",
    xp: {
      grants: true,
      source: "personal_milestone",
      amount: PROGRESS_XP_AMOUNT.personal_milestone,
      sourceKey: "milestone kind id",
      idempotency: "XpGrant unique (userId, personal_milestone, kind)",
    },
    missionProgress: "none",
    medalUnlock: "none",
    circularRisk: "none",
  },
  {
    action: "personal_milestone_patch",
    derived: "JournalPersonalMilestone update",
    xp: { grants: false, reason: "edits do not grant or revoke XP" },
    missionProgress: "none",
    medalUnlock: "none",
    circularRisk: "none",
  },
  {
    action: "personal_milestone_delete",
    derived: "JournalPersonalMilestone delete",
    xp: { grants: false, reason: "deletes do not revoke XP" },
    missionProgress: "none",
    medalUnlock: "none",
    circularRisk: "none",
  },
  {
    action: "mission_submit_correct_first",
    derived: "MissionCompletion insert",
    xp: {
      grants: true,
      source: MISSION_XP_SOURCE,
      amount: MISSION_XP_AMOUNT,
      sourceKey: "published mission id",
      idempotency:
        "MissionCompletion unique (userId, missionId) + XpGrant unique (userId, mission_complete, missionId)",
    },
    missionProgress: "completed once",
    medalUnlock: "none",
    circularRisk: "none",
  },
  {
    action: "mission_submit_correct_repeat",
    derived: "existing MissionCompletion",
    xp: { grants: false, reason: "alreadyCompleted; xpGranted 0" },
    missionProgress: "unchanged",
    medalUnlock: "none",
    circularRisk: "none",
  },
  {
    action: "mission_submit_incorrect",
    derived: "no completion row",
    xp: { grants: false, reason: "wrong answer does not complete or grant" },
    missionProgress: "none",
    medalUnlock: "none",
    circularRisk: "none",
  },
  {
    action: "achievement_detect",
    derived: "UserAchievement insert from usage/curve/temporal rules",
    xp: {
      grants: false,
      reason:
        "achievement_eligible is reserved; GAM-01 does not grant XP for medals",
    },
    missionProgress: "none",
    medalUnlock: "insert-only ON CONFLICT (userId, achievementId) DO NOTHING",
    circularRisk: "none",
  },
  {
    action: "relapse_last_use_change",
    derived: "SubstanceUsage lastUseDate / status write",
    xp: { grants: false, reason: "relapse does not revoke XP" },
    missionProgress: "none",
    medalUnlock: "existing UserAchievement rows are kept (ACH-01)",
    circularRisk: "none",
  },
  {
    action: "special_category_withdraw",
    derived: "purge journal, usages, medals, special-category XpGrant rows",
    xp: {
      grants: false,
      reason:
        "recompute totalXp from remaining grants; mission_complete is kept",
    },
    missionProgress: "MissionCompletion rows kept",
    medalUnlock: "UserAchievement rows deleted (consent purge, not relapse)",
    circularRisk: "none",
  },
  {
    action: "feedback_submit",
    derived: "FeedbackReport insert",
    xp: { grants: false, reason: "FBK-01 does not award XP" },
    missionProgress: "none",
    medalUnlock: "none",
    circularRisk: "none",
  },
] as const;

export const GAMIFICATION_RESERVED_UNGRANTED_SOURCES = [
  "onboarding_complete",
  "achievement_eligible",
  "referral_qualified",
] as const satisfies readonly ProgressXpSource[];

export function gamificationRuleFor(
  action: GamificationUserAction,
): GamificationEventRule {
  const rule = GAMIFICATION_EVENT_RULES.find((row) => row.action === action);
  if (!rule) {
    throw new RangeError(`Unknown gamification action: ${action}`);
  }
  return rule;
}

export function isLegitimateDistinctXpPair(
  left: ProgressXpSource,
  right: ProgressXpSource,
): boolean {
  return left !== right;
}
