import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  TEMPORAL_THRESHOLDS,
  type MissionCatalogItem,
  type TemporalMilestoneState,
} from "@soma/shared-types";
import { buildDemoMissions } from "../../missions/missions-demo.ts";
import { DEMO_PROGRESS } from "../../progress/progress-demo.ts";
import {
  buildExpeditionBoard,
  buildKnowledgeNodes,
  buildPerseveranceNodes,
  formatRatio,
  KNOWLEDGE_NODE_IDS,
  PERSEVERANCE_SUBSTANCE_IDS,
  pickKnowledgeGoal,
  pickRecommendedNodeId,
  temporalNodeProgress,
} from "./expedition-model.ts";

const model = readFileSync(new URL("./expedition-model.ts", import.meta.url), "utf8");

function upcoming(
  substanceId: string,
  daysAbstinent: number,
): TemporalMilestoneState {
  const nextThreshold =
    TEMPORAL_THRESHOLDS.find((days) => days > daysAbstinent) ?? 365;
  return {
    substanceId,
    status: "upcoming",
    daysAbstinent,
    next: {
      achievementId: `${substanceId}-temporal-${nextThreshold}`,
      titleKey: `${substanceId}-temporal-${nextThreshold}.title`,
      thresholdDays: nextThreshold,
      dueAt: new Date(),
      remainingMs: 86_400_000,
      progress: daysAbstinent / nextThreshold,
      tier: "bronze",
    },
  };
}

test("knowledge nodes use published mission counts and never invent 6/12 or 6/18", () => {
  const missions = buildDemoMissions(new Set(["edu-dopamine-01"]));
  const nodes = buildKnowledgeNodes("/app", missions, 2);
  assert.deepEqual(
    nodes.map((node) => node.id),
    [...KNOWLEDGE_NODE_IDS],
  );
  const neuro = nodes.find((node) => node.id === "neurotransmitters");
  const processes = nodes.find((node) => node.id === "processes");
  const anatomy = nodes.find((node) => node.id === "orientation");
  const substances = nodes.find((node) => node.id === "substances");
  const recovery = nodes.find((node) => node.id === "recovery");
  assert.equal(neuro?.total, 9);
  assert.equal(neuro?.completed, 1);
  assert.equal(neuro?.status, "in_progress");
  assert.equal(processes?.total, 5);
  assert.equal(processes?.completed, 0);
  assert.equal(processes?.status, "available");
  assert.equal(anatomy?.completed, null);
  assert.equal(anatomy?.total, null);
  assert.equal(anatomy?.status, "upcoming");
  assert.equal(anatomy?.href, "/app/anatomy");
  assert.equal(substances?.status, "upcoming");
  assert.equal(substances?.href, "/app/explore");
  assert.equal(recovery?.completed, null);
  assert.equal(recovery?.total, null);
  assert.equal(recovery?.status, "available");
  assert.equal(recovery?.href, "/app/recovery");
  assert.equal(formatRatio(6, 12), "6 / 12");
  assert.equal(
    nodes.some((node) => formatRatio(node.completed, node.total) === "6 / 12"),
    false,
  );
  assert.equal(
    nodes.some((node) => formatRatio(node.completed, node.total) === "6 / 18"),
    false,
  );
});

test("knowledge recovery never copies temporal medal counts", () => {
  const missions = buildDemoMissions(new Set());
  const nodes = buildKnowledgeNodes("/preview", missions, 0);
  const recovery = nodes.find((node) => node.id === "recovery");
  assert.equal(recovery?.status, "waiting");
  assert.equal(recovery?.completed, null);
  assert.equal(JSON.stringify(recovery).includes("temporal"), false);
});

test("empty mission categories stay upcoming without a fake denominator", () => {
  const empty: MissionCatalogItem[] = [];
  const nodes = buildKnowledgeNodes("/app", empty, 1);
  for (const id of ["orientation", "substances"] as const) {
    const node = nodes.find((item) => item.id === id);
    assert.equal(node?.status, "upcoming");
    assert.equal(node?.completed, null);
    assert.equal(node?.total, null);
  }
});

test("perseverance uses ten temporal thresholds and active-use has no fake fill", () => {
  const nodes = buildPerseveranceNodes(
    "/app",
    [
      upcoming("nicotine", 15),
      { substanceId: "alcohol", status: "active_use", daysAbstinent: null, next: null },
    ],
    ["nicotine", "alcohol"],
  );
  assert.deepEqual(
    nodes.filter((node) => node.substanceId).map((node) => node.substanceId),
    [...PERSEVERANCE_SUBSTANCE_IDS],
  );
  const nicotine = nodes.find((node) => node.id === "nicotine");
  const alcohol = nodes.find((node) => node.id === "alcohol");
  const cannabis = nodes.find((node) => node.id === "cannabis");
  assert.equal(nicotine?.total, 10);
  assert.equal(nicotine?.completed, 4);
  assert.equal(nicotine?.status, "in_progress");
  assert.equal(nicotine?.href, "/app/recovery?substance=nicotine");
  assert.equal(alcohol?.status, "active_use");
  assert.equal(alcohol?.completed, null);
  assert.equal(cannabis?.status, "waiting");
  assert.equal(cannabis?.completed, null);
  assert.equal(temporalNodeProgress(undefined).status, "waiting");
});

test("board stats prefer real XP, mission and medal denominators", () => {
  const missions = buildDemoMissions(new Set(["edu-dopamine-01", "edu-receptors-01"]));
  const board = buildExpeditionBoard({
    base: "/preview",
    route: "knowledge",
    missions,
    progress: DEMO_PROGRESS,
    substanceIds: ["cannabis", "nicotine"],
    temporalStates: [upcoming("cannabis", 42), upcoming("nicotine", 15)],
    unlockedMedals: 18,
    reachableMedals: 149,
  });
  const level = board.stats.find((row) => row.id === "level");
  const knowledge = board.stats.find((row) => row.id === "knowledge");
  const perseverance = board.stats.find((row) => row.id === "perseverance");
  const medals = board.stats.find((row) => row.id === "medals");
  assert.equal(level?.level, DEMO_PROGRESS.level);
  assert.equal(level?.titleId, DEMO_PROGRESS.equippedTitleId);
  assert.equal(knowledge?.completed, 2);
  assert.equal(knowledge?.total, 14);
  assert.equal(perseverance?.completed, 2);
  assert.equal(perseverance?.total, 2);
  assert.equal(medals?.completed, 18);
  assert.equal(medals?.total, 149);
  assert.notEqual(formatRatio(knowledge?.completed ?? null, knowledge?.total ?? null), "6 / 12");
  assert.equal(board.goal.kind, "mission_category");
  if (board.goal.kind === "mission_category") {
    assert.equal(board.goal.categoryId, "neurotransmitters");
    assert.equal(board.goal.href, "/preview/missions");
  }
});

test("DEMO and LIVE share the same node ids; LIVE medals hide without a verified denominator", () => {
  const missions = buildDemoMissions(new Set());
  const demo = buildExpeditionBoard({
    base: "/preview",
    route: "perseverance",
    missions,
    progress: DEMO_PROGRESS,
    substanceIds: ["cannabis"],
    temporalStates: [upcoming("cannabis", 42)],
    unlockedMedals: null,
    reachableMedals: null,
  });
  const liveEmpty = buildExpeditionBoard({
    base: "/app",
    route: "perseverance",
    missions,
    progress: null,
    substanceIds: [],
    temporalStates: [],
    unlockedMedals: null,
    reachableMedals: 149,
  });
  assert.equal(demo.nodes.length, 5);
  assert.equal(demo.nodes.length, liveEmpty.nodes.length);
  assert.equal(demo.stats.find((row) => row.id === "medals")?.total, null);
  assert.equal(liveEmpty.goal.kind, "empty");
  if (liveEmpty.goal.kind === "empty") {
    assert.equal(liveEmpty.goal.reason, "waiting");
  }
  assert.equal(demo.goal.kind, "temporal");
});

test("recommended node is the first actionable stop, not a ranking", () => {
  const missions = buildDemoMissions(new Set());
  const nodes = buildKnowledgeNodes("/app", missions, 1);
  assert.equal(nodes.length, 5);
  assert.equal(
    nodes.some((node) => node.id === ("start" as never)),
    false,
  );
  assert.equal(pickRecommendedNodeId(nodes), "neurotransmitters");
  const goal = pickKnowledgeGoal("/app", missions);
  assert.equal(goal.kind, "mission_category");
});

test("the view-model does not grant XP or invent a second economy", () => {
  assert.equal(model.includes("awardXp"), false);
  assert.equal(model.includes("patchEquippedTitle"), false);
  assert.equal(model.includes("postMissionAnswer"), false);
  assert.equal(model.includes("XpGrant"), false);
  assert.match(model, /No XP grants/);
});
