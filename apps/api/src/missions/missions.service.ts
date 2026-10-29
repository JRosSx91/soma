/**
 * GAM-02C: persist mission completions and grant XP in one transaction.
 * No HTTP. awardXp stays internal. Concurrent (userId, missionId) writes rely
 * on MissionCompletion's unique constraint, not an in-memory lock.
 *
 * `awardXp` status `capped` means this grant would push totalXp past
 * PROGRESS_XP_MAX (the curve ceiling). It is not “max level” by itself.
 * Educational completion still commits; XP is left unchanged.
 * Thrown errors from awardXp abort the whole transaction.
 */

import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  MISSION_CATALOG,
  MISSION_XP_AMOUNT,
  MISSION_XP_SOURCE,
  getMissionById,
  listPublishedMissions,
  missionUserState,
  type MissionAnswerResult,
  type MissionCatalogResponse,
  type MissionDefinition,
  type MissionSubmitRejection,
  type MissionUserProgress,
} from "@soma/shared-types";
import { PrismaService } from "../prisma/prisma.service.js";
import type { AwardXpStatus } from "../progress/progress.types.js";
import { ProgressService } from "../progress/progress.service.js";
import { evaluateReadingCheckAnswer } from "./evaluate-reading-check.js";

export type MissionSubmitOutcome =
  | { ok: true; result: MissionAnswerResult }
  | { ok: false; reason: MissionSubmitRejection };

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

function xpGrantedFromAward(status: AwardXpStatus): number {
  switch (status) {
    case "awarded":
      return MISSION_XP_AMOUNT;
    case "capped":
    case "duplicate":
      return 0;
    default: {
      const unexpected: never = status;
      throw new Error(`Unexpected awardXp status: ${String(unexpected)}`);
    }
  }
}

@Injectable()
export class MissionsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ProgressService) private readonly progress: ProgressService,
  ) {}

  async hasCompleted(userId: string, missionId: string): Promise<boolean> {
    const row = await this.prisma.missionCompletion.findUnique({
      where: { userId_missionId: { userId, missionId } },
      select: { id: true },
    });
    return row !== null;
  }

  async listMine(userId: string): Promise<MissionCatalogResponse> {
    const published = listPublishedMissions();
    const rows = await this.prisma.missionCompletion.findMany({
      where: { userId },
      select: { missionId: true, completedAt: true },
    });
    const done = new Map(rows.map((row) => [row.missionId, row.completedAt] as const));
    return {
      missions: published.map((mission) => {
        const completedAt = done.get(mission.id) ?? null;
        return {
          id: mission.id,
          categoryId: mission.categoryId,
          type: mission.type,
          sortOrder: mission.sortOrder,
          contentVersion: mission.contentVersion,
          sheetId: mission.sheetId,
          options: mission.options,
          titleKey: mission.titleKey,
          summaryKey: mission.summaryKey,
          goalKey: mission.goalKey,
          promptKey: mission.promptKey,
          explainKey: mission.explainKey,
          state: missionUserState(completedAt !== null),
          completedAt: completedAt ? completedAt.toISOString() : null,
        };
      }),
    };
  }

  async listCompleted(userId: string): Promise<MissionUserProgress[]> {
    const rows = await this.prisma.missionCompletion.findMany({
      where: { userId },
      orderBy: [{ completedAt: "asc" }, { missionId: "asc" }],
    });
    return rows.map((row) => ({
      missionId: row.missionId as MissionUserProgress["missionId"],
      state: missionUserState(true),
      completedAt: row.completedAt.toISOString(),
      contentVersion: row.contentVersion,
    }));
  }

  async submitAnswer(
    userId: string,
    input: { missionId: string; selectedOptionId: string },
    options?: { catalog?: readonly MissionDefinition[] },
  ): Promise<MissionSubmitOutcome> {
    const catalog = options?.catalog ?? MISSION_CATALOG;
    const mission = catalog.find((row) => row.id === input.missionId) ?? getMissionById(input.missionId);
    if (!mission) {
      return { ok: false, reason: "unknown_mission" };
    }
    if (mission.status !== "published") {
      return { ok: false, reason: "unpublished_mission" };
    }

    const verdict = evaluateReadingCheckAnswer({
      missionId: mission.id,
      selectedOptionId: input.selectedOptionId,
    });
    if (!verdict.ok) {
      return { ok: false, reason: verdict.reason };
    }
    if (!verdict.correct) {
      return {
        ok: true,
        result: {
          correct: false,
          completed: false,
          alreadyCompleted: false,
          xpGranted: 0,
        },
      };
    }

    const existing = await this.prisma.missionCompletion.findUnique({
      where: { userId_missionId: { userId, missionId: mission.id } },
      select: { id: true },
    });
    if (existing) {
      return { ok: true, result: alreadyCompletedResult() };
    }

    try {
      const awarded = await this.prisma.$transaction(async (tx) => {
        await tx.missionCompletion.create({
          data: {
            userId,
            missionId: mission.id,
            contentVersion: mission.contentVersion,
          },
        });
        return this.progress.awardXp(
          userId,
          { source: MISSION_XP_SOURCE, sourceKey: mission.id },
          tx,
        );
      });
      return {
        ok: true,
        result: {
          correct: true,
          completed: true,
          alreadyCompleted: false,
          xpGranted: xpGrantedFromAward(awarded.status),
        },
      };
    } catch (err) {
      if (isUniqueViolation(err)) {
        return { ok: true, result: alreadyCompletedResult() };
      }
      throw err;
    }
  }
}

function alreadyCompletedResult(): MissionAnswerResult {
  return {
    correct: true,
    completed: true,
    alreadyCompleted: true,
    xpGranted: 0,
  };
}
