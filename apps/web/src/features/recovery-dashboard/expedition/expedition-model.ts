/**
 * GAME-07: compose existing progress, missions and temporal clocks.
 * No XP grants, no medal unlocks, no HTTP.
 */

import {
  MISSION_CATEGORY_IDS,
  TEMPORAL_THRESHOLDS,
  type MissionCatalogItem,
  type MissionCategoryId,
  type TemporalMilestoneState,
} from "@soma/shared-types";
import {
  categoryProgress,
  countCompletedMissions,
  FUTURE_MISSION_CATEGORY_IDS,
} from "../../missions/missions-view.js";
import type { ProgressView } from "../../progress/progress-model.js";
import type { ShellBase } from "../shell-base.js";

export const EXPEDITION_ROUTE_IDS = ["knowledge", "perseverance"] as const;
export type ExpeditionRouteId = (typeof EXPEDITION_ROUTE_IDS)[number];

export const KNOWLEDGE_NODE_IDS = [
  "neurotransmitters",
  "orientation",
  "substances",
  "processes",
  "recovery",
] as const;
export type KnowledgeNodeId = (typeof KNOWLEDGE_NODE_IDS)[number];

/** GAME-07 perseverance order (not TEMPORAL_SUBSTANCES catalog order). */
export const PERSEVERANCE_SUBSTANCE_IDS = [
  "alcohol",
  "nicotine",
  "cannabis",
  "cocaine",
  "caffeine",
] as const;
export type PerseveranceSubstanceId = (typeof PERSEVERANCE_SUBSTANCE_IDS)[number];

export const PERSEVERANCE_NODE_IDS = PERSEVERANCE_SUBSTANCE_IDS;
export type PerseveranceNodeId = (typeof PERSEVERANCE_NODE_IDS)[number];

export type ExpeditionNodeId = KnowledgeNodeId | PerseveranceNodeId;

export type ExpeditionNodeStatus =
  | "complete"
  | "in_progress"
  | "available"
  | "upcoming"
  | "active_use"
  | "waiting";

export interface ExpeditionNode {
  id: ExpeditionNodeId;
  route: ExpeditionRouteId;
  status: ExpeditionNodeStatus;
  completed: number | null;
  total: number | null;
  href: string;
  categoryId?: MissionCategoryId;
  substanceId?: PerseveranceSubstanceId;
}

export interface ExpeditionStat {
  id: "level" | "knowledge" | "perseverance" | "medals";
  percent: number | null;
  completed: number | null;
  total: number | null;
  level: number | null;
  titleId: string | null;
  xpIntoLevel: number | null;
  xpForNextLevel: number | null;
}

export type ExpeditionGoal =
  | {
      kind: "mission_category";
      categoryId: MissionCategoryId;
      completed: number;
      total: number;
      remaining: number;
      href: string;
    }
  | {
      kind: "temporal";
      substanceId: string;
      thresholdDays: number;
      href: string;
    }
  | { kind: "empty"; reason: "complete" | "waiting" | "active_use" | "none" };

export interface ExpeditionBoard {
  route: ExpeditionRouteId;
  nodes: readonly ExpeditionNode[];
  stats: readonly ExpeditionStat[];
  goal: ExpeditionGoal;
  recommendedNodeId: ExpeditionNodeId;
}

export interface ExpeditionBoardInput {
  base: ShellBase;
  route: ExpeditionRouteId;
  missions: readonly MissionCatalogItem[] | null;
  progress: ProgressView | null;
  substanceIds: readonly string[];
  temporalStates: readonly TemporalMilestoneState[];
  unlockedMedals: number | null;
  reachableMedals: number | null;
}

const THRESHOLD_COUNT = TEMPORAL_THRESHOLDS.length;

export function isExpeditionRouteId(value: string): value is ExpeditionRouteId {
  return (EXPEDITION_ROUTE_IDS as readonly string[]).includes(value);
}

export function knowledgeHref(base: ShellBase, id: KnowledgeNodeId): string {
  if (id === "orientation") return `${base}/anatomy`;
  if (id === "substances") return `${base}/explore`;
  if (id === "recovery") return `${base}/recovery`;
  return `${base}/missions`;
}

export function perseveranceHref(
  base: ShellBase,
  id: PerseveranceNodeId,
): string {
  return `${base}/recovery?substance=${id}`;
}

function categoryStatus(
  stats: ReturnType<typeof categoryProgress>,
): ExpeditionNodeStatus {
  if (stats.upcoming || stats.total === 0) return "upcoming";
  if (stats.completed >= stats.total) return "complete";
  if (stats.completed > 0) return "in_progress";
  return "available";
}

export function buildKnowledgeNodes(
  base: ShellBase,
  missions: readonly MissionCatalogItem[] | null,
  substanceCount: number,
): ExpeditionNode[] {
  const rows = missions ?? [];
  return KNOWLEDGE_NODE_IDS.map((id) => {
    if (id === "recovery") {
      return {
        id,
        route: "knowledge" as const,
        status: substanceCount > 0 ? "available" : "waiting",
        completed: null,
        total: null,
        href: knowledgeHref(base, id),
      };
    }
    const categoryId = id as MissionCategoryId;
    const stats = categoryProgress(rows, categoryId);
    return {
      id,
      route: "knowledge" as const,
      status: categoryStatus(stats),
      completed: stats.total > 0 ? stats.completed : null,
      total: stats.total > 0 ? stats.total : null,
      href: knowledgeHref(base, id),
      categoryId,
    };
  });
}

export function temporalNodeProgress(
  state: TemporalMilestoneState | undefined,
): Pick<ExpeditionNode, "status" | "completed" | "total"> {
  if (!state) {
    return { status: "waiting", completed: null, total: THRESHOLD_COUNT };
  }
  if (state.status === "complete") {
    return {
      status: "complete",
      completed: THRESHOLD_COUNT,
      total: THRESHOLD_COUNT,
    };
  }
  if (state.status === "upcoming" && state.daysAbstinent != null) {
    const completed = TEMPORAL_THRESHOLDS.filter(
      (days) => days <= state.daysAbstinent!,
    ).length;
    return {
      status: completed > 0 ? "in_progress" : "available",
      completed,
      total: THRESHOLD_COUNT,
    };
  }
  if (state.status === "active_use") {
    return { status: "active_use", completed: null, total: THRESHOLD_COUNT };
  }
  return { status: "waiting", completed: null, total: THRESHOLD_COUNT };
}

export function buildPerseveranceNodes(
  base: ShellBase,
  temporalStates: readonly TemporalMilestoneState[],
  substanceIds: readonly string[],
): ExpeditionNode[] {
  const tracked = new Set(substanceIds);
  const byId = new Map(temporalStates.map((row) => [row.substanceId, row]));
  return PERSEVERANCE_NODE_IDS.map((id) => {
    const trackedHere = tracked.has(id);
    const progress = temporalNodeProgress(
      trackedHere ? byId.get(id) : undefined,
    );
    return {
      id,
      route: "perseverance" as const,
      status: trackedHere ? progress.status : "waiting",
      completed: trackedHere ? progress.completed : null,
      total: THRESHOLD_COUNT,
      href: perseveranceHref(base, id),
      substanceId: id,
    };
  });
}

function levelStat(progress: ProgressView | null): ExpeditionStat {
  if (!progress) {
    return {
      id: "level",
      percent: null,
      completed: null,
      total: null,
      level: null,
      titleId: null,
      xpIntoLevel: null,
      xpForNextLevel: null,
    };
  }
  const atCap = progress.xpToNextLevel === 0;
  return {
    id: "level",
    percent: atCap ? 100 : progress.percentToNextLevel,
    completed: null,
    total: null,
    level: progress.level,
    titleId: progress.equippedTitleId,
    xpIntoLevel: progress.xpIntoLevel,
    xpForNextLevel: atCap ? progress.totalXp : progress.xpForNextLevel,
  };
}

function knowledgeStat(
  missions: readonly MissionCatalogItem[] | null,
): ExpeditionStat {
  if (!missions) {
    return emptyStat("knowledge");
  }
  const summary = countCompletedMissions(missions);
  return {
    id: "knowledge",
    percent: summary.percent,
    completed: summary.completed,
    total: summary.total,
    level: null,
    titleId: null,
    xpIntoLevel: null,
    xpForNextLevel: null,
  };
}

function perseveranceClockCount(
  temporalStates: readonly TemporalMilestoneState[],
  substanceIds: readonly string[],
): { completed: number; total: number } | null {
  if (substanceIds.length === 0) return null;
  const tracked = new Set(substanceIds);
  let running = 0;
  for (const state of temporalStates) {
    if (!tracked.has(state.substanceId)) continue;
    if (state.status === "upcoming" || state.status === "complete") running += 1;
  }
  return { completed: running, total: substanceIds.length };
}

function perseveranceStat(
  temporalStates: readonly TemporalMilestoneState[],
  substanceIds: readonly string[],
): ExpeditionStat {
  const summary = perseveranceClockCount(temporalStates, substanceIds);
  if (!summary) return emptyStat("perseverance");
  return {
    id: "perseverance",
    percent:
      summary.total === 0
        ? null
        : Math.round((summary.completed * 100) / summary.total),
    completed: summary.completed,
    total: summary.total,
    level: null,
    titleId: null,
    xpIntoLevel: null,
    xpForNextLevel: null,
  };
}

function medalsStat(
  unlockedMedals: number | null,
  reachableMedals: number | null,
): ExpeditionStat {
  if (unlockedMedals == null || reachableMedals == null || reachableMedals < 1) {
    return emptyStat("medals");
  }
  return {
    id: "medals",
    percent: Math.round((unlockedMedals * 100) / reachableMedals),
    completed: unlockedMedals,
    total: reachableMedals,
    level: null,
    titleId: null,
    xpIntoLevel: null,
    xpForNextLevel: null,
  };
}

function emptyStat(id: ExpeditionStat["id"]): ExpeditionStat {
  return {
    id,
    percent: null,
    completed: null,
    total: null,
    level: null,
    titleId: null,
    xpIntoLevel: null,
    xpForNextLevel: null,
  };
}

export function pickKnowledgeGoal(
  base: ShellBase,
  missions: readonly MissionCatalogItem[] | null,
): ExpeditionGoal {
  if (!missions || missions.length === 0) {
    return { kind: "empty", reason: "none" };
  }
  const published = MISSION_CATEGORY_IDS.filter(
    (id) => !FUTURE_MISSION_CATEGORY_IDS.includes(id),
  );
  const open = published
    .map((categoryId) => {
      const stats = categoryProgress(missions, categoryId);
      return { categoryId, ...stats, remaining: stats.total - stats.completed };
    })
    .filter((row) => row.total > 0 && row.remaining > 0);
  const preferred =
    open.find((row) => row.completed > 0) ?? open[0] ?? null;
  if (!preferred) {
    return { kind: "empty", reason: "complete" };
  }
  return {
    kind: "mission_category",
    categoryId: preferred.categoryId,
    completed: preferred.completed,
    total: preferred.total,
    remaining: preferred.remaining,
    href: `${base}/missions`,
  };
}

export function pickPerseveranceGoal(
  nodes: readonly ExpeditionNode[],
): ExpeditionGoal {
  const substances = nodes.filter((node) => node.substanceId);
  const next = substances.find(
    (node) => node.status === "in_progress" || node.status === "available",
  );
  if (next?.substanceId) {
    const index = next.completed ?? 0;
    const threshold = TEMPORAL_THRESHOLDS[index] ?? TEMPORAL_THRESHOLDS[0];
    return {
      kind: "temporal",
      substanceId: next.substanceId,
      thresholdDays: threshold,
      href: next.href,
    };
  }
  if (substances.every((node) => node.status === "waiting")) {
    return { kind: "empty", reason: "waiting" };
  }
  if (substances.some((node) => node.status === "complete")) {
    return { kind: "empty", reason: "complete" };
  }
  if (substances.some((node) => node.status === "active_use")) {
    return { kind: "empty", reason: "active_use" };
  }
  return { kind: "empty", reason: "none" };
}

export function pickRecommendedNodeId(
  nodes: readonly ExpeditionNode[],
): ExpeditionNodeId {
  const preferred = nodes.find(
    (node) => node.status === "in_progress" || node.status === "available",
  );
  if (preferred) return preferred.id;
  const upcoming = nodes.find((node) => node.status === "upcoming");
  if (upcoming) return upcoming.id;
  return nodes[0]?.id ?? "neurotransmitters";
}

export function buildExpeditionBoard(input: ExpeditionBoardInput): ExpeditionBoard {
  const nodes =
    input.route === "knowledge"
      ? buildKnowledgeNodes(input.base, input.missions, input.substanceIds.length)
      : buildPerseveranceNodes(
          input.base,
          input.temporalStates,
          input.substanceIds,
        );
  const goal =
    input.route === "knowledge"
      ? pickKnowledgeGoal(input.base, input.missions)
      : pickPerseveranceGoal(nodes);
  return {
    route: input.route,
    nodes,
    stats: [
      levelStat(input.progress),
      knowledgeStat(input.missions),
      perseveranceStat(input.temporalStates, input.substanceIds),
      medalsStat(input.unlockedMedals, input.reachableMedals),
    ],
    goal,
    recommendedNodeId: pickRecommendedNodeId(nodes),
  };
}

export function formatRatio(
  completed: number | null,
  total: number | null,
): string | null {
  if (completed == null || total == null || total < 1) return null;
  return `${completed} / ${total}`;
}
