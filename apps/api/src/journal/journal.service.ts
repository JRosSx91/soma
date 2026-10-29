import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { JournalEntry, JournalPersonalMilestone, Prisma } from "@prisma/client";
import { Prisma as PrismaNs } from "@prisma/client";
import { civilDateToUtcDate, utcDateToCivilDate } from "@soma/shared-types";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProgressService } from "../progress/progress.service.js";
import type { CreateJournalEntryDto } from "./dto/create-journal-entry.dto.js";
import type { ListJournalQueryDto } from "./dto/list-journal-query.dto.js";
import {
  JOURNAL_LIST_DEFAULT_LIMIT,
} from "./dto/list-journal-query.dto.js";
import type { CreateJournalMilestoneDto } from "./dto/create-journal-milestone.dto.js";
import type { PatchJournalEntryDto } from "./dto/patch-journal-entry.dto.js";
import type { PatchJournalMilestoneDto } from "./dto/patch-journal-milestone.dto.js";
import {
  decodeJournalCursor,
  encodeJournalCursor,
} from "./journal.cursor.js";
import {
  hasSignificantJournalContent,
  normalizeOptionalText,
  toJournalEntryResponse,
  toJournalMilestoneResponse,
  type JournalEntryResponse,
  type JournalMilestoneResponse,
} from "./journal.mapper.js";

const NOT_FOUND = "Journal entry not found";
const MILESTONE_NOT_FOUND = "Personal milestone not found";

@Injectable()
export class JournalService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ProgressService) private readonly progress: ProgressService,
  ) {}

  async create(
    userId: string,
    dto: CreateJournalEntryDto,
  ): Promise<JournalEntryResponse> {
    const title = normalizeOptionalText(dto.title) ?? null;
    const body = normalizeOptionalText(dto.body) ?? null;
    if (
      !hasSignificantJournalContent({
        mood: dto.mood,
        sleep: dto.sleep,
        energy: dto.energy,
        anxiety: dto.anxiety,
        cravingIntensity: dto.cravingIntensity,
        wellbeingRating: dto.wellbeingRating,
        title,
        body,
        emotionIds: dto.emotionIds,
        triggerIds: dto.triggerIds,
      })
    ) {
      throw new BadRequestException(
        "At least one significant field is required",
      );
    }

    try {
      const row = await this.prisma.$transaction(async (tx) => {
        const created = await tx.journalEntry.create({
          data: {
            userId,
            occurredOn: civilDateToUtcDate(dto.occurredOn),
            mood: dto.mood ?? null,
            sleep: dto.sleep ?? null,
            energy: dto.energy ?? null,
            anxiety: dto.anxiety ?? null,
            cravingIntensity: dto.cravingIntensity ?? null,
            cravingSubstanceId: dto.cravingSubstanceId ?? null,
            wellbeingRating: dto.wellbeingRating ?? null,
            title,
            body,
            highlighted: dto.highlighted ?? false,
            learning: dto.learning ?? false,
            emotionIds: dto.emotionIds ?? [],
            triggerIds: dto.triggerIds ?? [],
          },
        });
        await this.progress.awardXp(
          userId,
          {
            source: "journal_create_day",
            sourceKey: utcDateToCivilDate(created.createdAt),
          },
          tx,
        );
        return created;
      });
      return toJournalEntryResponse(row);
    } catch (err) {
      throw this.mapWriteError(err);
    }
  }

  async getOne(userId: string, id: string): Promise<JournalEntryResponse> {
    const row = await this.findOwned(userId, id);
    return toJournalEntryResponse(row);
  }

  async list(
    userId: string,
    query: ListJournalQueryDto,
  ): Promise<{ items: JournalEntryResponse[]; nextCursor: string | null }> {
    const limit = query.limit ?? JOURNAL_LIST_DEFAULT_LIMIT;
    if (query.from && query.to && query.from > query.to) {
      throw new BadRequestException("from must be on or before to");
    }

    const where: Prisma.JournalEntryWhereInput = { userId };
    if (query.from || query.to) {
      where.occurredOn = {};
      if (query.from) where.occurredOn.gte = civilDateToUtcDate(query.from);
      if (query.to) where.occurredOn.lte = civilDateToUtcDate(query.to);
    }
    if (query.highlighted !== undefined) {
      where.highlighted = query.highlighted;
    }
    if (query.learning !== undefined) {
      where.learning = query.learning;
    }
    if (query.cursor) {
      const cursor = decodeJournalCursor(query.cursor);
      const occurredOn = civilDateToUtcDate(cursor.occurredOn);
      const createdAt = new Date(cursor.createdAt);
      where.AND = [
        {
          OR: [
            { occurredOn: { lt: occurredOn } },
            { occurredOn, createdAt: { lt: createdAt } },
            { occurredOn, createdAt, id: { lt: cursor.id } },
          ],
        },
      ];
    }

    // Keyset is live, not a snapshot: rows created or whose occurredOn
    // changes between pages may appear twice, be skipped, or show up on a
    // later page. Clients should not assume a frozen window.
    const rows = await this.prisma.journalEntry.findMany({
      where,
      orderBy: [
        { occurredOn: "desc" },
        { createdAt: "desc" },
        { id: "desc" },
      ],
      take: limit + 1,
    });
    const extra = rows.length > limit;
    const page = extra ? rows.slice(0, limit) : rows;
    const last = page[page.length - 1];
    return {
      items: page.map(toJournalEntryResponse),
      nextCursor:
        extra && last
          ? encodeJournalCursor({
              occurredOn: utcDateToCivilDate(last.occurredOn),
              createdAt: last.createdAt.toISOString(),
              id: last.id,
            })
          : null,
    };
  }

  /**
   * Returns every row for the owner. Personal journals are expected far
   * below tens of thousands of rows; we load them in one query rather than
   * silently cap. If memory becomes a problem, stream NDJSON in a later
   * hito — never truncate.
   */
  async exportAll(userId: string): Promise<{
    exportedAt: string;
    entries: JournalEntryResponse[];
    personalMilestones: JournalMilestoneResponse[];
  }> {
    const [rows, milestones] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where: { userId },
        orderBy: [
          { occurredOn: "desc" },
          { createdAt: "desc" },
          { id: "desc" },
        ],
      }),
      this.prisma.journalPersonalMilestone.findMany({
        where: { userId },
        orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      }),
    ]);
    return {
      exportedAt: new Date().toISOString(),
      entries: rows.map(toJournalEntryResponse),
      personalMilestones: milestones.map(toJournalMilestoneResponse),
    };
  }

  async patch(
    userId: string,
    id: string,
    dto: PatchJournalEntryDto,
  ): Promise<JournalEntryResponse> {
    const current = await this.findOwned(userId, id);
    const next = this.mergePatch(current, dto);
    if (!hasSignificantJournalContent(next)) {
      throw new BadRequestException(
        "At least one significant field is required",
      );
    }

    try {
      const row = await this.prisma.journalEntry.update({
        where: { id: current.id },
        data: {
          occurredOn: next.occurredOn,
          mood: next.mood,
          sleep: next.sleep,
          energy: next.energy,
          anxiety: next.anxiety,
          cravingIntensity: next.cravingIntensity,
          cravingSubstanceId: next.cravingSubstanceId,
          wellbeingRating: next.wellbeingRating,
          title: next.title,
          body: next.body,
          highlighted: next.highlighted,
          learning: next.learning,
          emotionIds: next.emotionIds,
          triggerIds: next.triggerIds,
        },
      });
      return toJournalEntryResponse(row);
    } catch (err) {
      throw this.mapWriteError(err);
    }
  }

  async remove(userId: string, id: string): Promise<void> {
    const current = await this.findOwned(userId, id);
    await this.prisma.journalEntry.delete({ where: { id: current.id } });
  }

  async wipeAll(userId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.journalPersonalMilestone.deleteMany({ where: { userId } }),
      this.prisma.journalEntry.deleteMany({ where: { userId } }),
    ]);
  }

  async listMilestones(userId: string): Promise<JournalMilestoneResponse[]> {
    const rows = await this.prisma.journalPersonalMilestone.findMany({
      where: { userId },
      orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    });
    return rows.map(toJournalMilestoneResponse);
  }

  async createMilestone(
    userId: string,
    dto: CreateJournalMilestoneDto,
  ): Promise<JournalMilestoneResponse> {
    const row = await this.prisma.$transaction(async (tx) => {
      const created = await tx.journalPersonalMilestone.create({
        data: {
          userId,
          kind: dto.kind,
          occurredOn: civilDateToUtcDate(dto.occurredOn),
          note: normalizeOptionalText(dto.note) ?? null,
        },
      });
      await this.progress.awardXp(
        userId,
        {
          source: "personal_milestone",
          sourceKey: created.kind,
        },
        tx,
      );
      return created;
    });
    return toJournalMilestoneResponse(row);
  }

  async getMilestone(
    userId: string,
    id: string,
  ): Promise<JournalMilestoneResponse> {
    const row = await this.findOwnedMilestone(userId, id);
    return toJournalMilestoneResponse(row);
  }

  async patchMilestone(
    userId: string,
    id: string,
    dto: PatchJournalMilestoneDto,
  ): Promise<JournalMilestoneResponse> {
    const current = await this.findOwnedMilestone(userId, id);
    const row = await this.prisma.journalPersonalMilestone.update({
      where: { id: current.id },
      data: {
        kind: dto.kind === undefined ? current.kind : dto.kind,
        occurredOn:
          dto.occurredOn === undefined
            ? current.occurredOn
            : civilDateToUtcDate(dto.occurredOn),
        note:
          dto.note === undefined
            ? current.note
            : (normalizeOptionalText(dto.note) ?? null),
      },
    });
    return toJournalMilestoneResponse(row);
  }

  async removeMilestone(userId: string, id: string): Promise<void> {
    const current = await this.findOwnedMilestone(userId, id);
    await this.prisma.journalPersonalMilestone.delete({
      where: { id: current.id },
    });
  }

  private async findOwned(userId: string, id: string): Promise<JournalEntry> {
    const row = await this.prisma.journalEntry.findFirst({
      where: { id, userId },
    });
    if (!row) {
      throw new NotFoundException(NOT_FOUND);
    }
    return row;
  }

  private async findOwnedMilestone(
    userId: string,
    id: string,
  ): Promise<JournalPersonalMilestone> {
    const row = await this.prisma.journalPersonalMilestone.findFirst({
      where: { id, userId },
    });
    if (!row) {
      throw new NotFoundException(MILESTONE_NOT_FOUND);
    }
    return row;
  }

  private mergePatch(current: JournalEntry, dto: PatchJournalEntryDto) {
    const title =
      dto.title === undefined
        ? current.title
        : (normalizeOptionalText(dto.title) ?? null);
    const body =
      dto.body === undefined
        ? current.body
        : (normalizeOptionalText(dto.body) ?? null);
    return {
      occurredOn:
        dto.occurredOn === undefined
          ? current.occurredOn
          : civilDateToUtcDate(dto.occurredOn),
      mood: dto.mood === undefined ? current.mood : dto.mood,
      sleep: dto.sleep === undefined ? current.sleep : dto.sleep,
      energy: dto.energy === undefined ? current.energy : dto.energy,
      anxiety: dto.anxiety === undefined ? current.anxiety : dto.anxiety,
      cravingIntensity:
        dto.cravingIntensity === undefined
          ? current.cravingIntensity
          : dto.cravingIntensity,
      wellbeingRating:
        dto.wellbeingRating === undefined
          ? current.wellbeingRating
          : dto.wellbeingRating,
      cravingSubstanceId:
        dto.cravingSubstanceId === undefined
          ? current.cravingSubstanceId
          : dto.cravingSubstanceId,
      title,
      body,
      highlighted:
        dto.highlighted === undefined ? current.highlighted : dto.highlighted,
      learning: dto.learning === undefined ? current.learning : dto.learning,
      emotionIds:
        dto.emotionIds === undefined
          ? current.emotionIds
          : (dto.emotionIds ?? []),
      triggerIds:
        dto.triggerIds === undefined
          ? current.triggerIds
          : (dto.triggerIds ?? []),
    };
  }

  private mapWriteError(err: unknown): never {
    if (
      err instanceof PrismaNs.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      throw new BadRequestException("Invalid cravingSubstanceId");
    }
    throw err;
  }
}
