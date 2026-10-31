/**
 * FBK-01C: owner-only feedback persistence.
 * Never log title or body. Never award XP. Duplicate window is 24h, not unique.
 */
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import {
  FEEDBACK_DUPLICATE_WINDOW_MS,
  FEEDBACK_LIST_DEFAULT_LIMIT,
  type FeedbackItem,
  type FeedbackListResponse,
} from "@soma/shared-types";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CreateFeedbackDto } from "./dto/create-feedback.dto.js";
import type { ListFeedbackQueryDto } from "./dto/list-feedback-query.dto.js";
import {
  decodeFeedbackCursor,
  encodeFeedbackCursor,
} from "./feedback.cursor.js";
import { feedbackFingerprint } from "./feedback.hash.js";
import { toFeedbackItem } from "./feedback.mapper.js";

export interface CreateFeedbackResult {
  created: boolean;
  item: FeedbackItem;
}

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    dto: CreateFeedbackDto,
  ): Promise<CreateFeedbackResult> {
    const fingerprint = feedbackFingerprint(dto.category, dto.title, dto.body);
    const since = new Date(Date.now() - FEEDBACK_DUPLICATE_WINDOW_MS);

    const existing = await this.prisma.feedbackReport.findFirst({
      where: {
        userId,
        fingerprint,
        createdAt: { gte: since },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    if (existing) {
      this.logger.log(
        `duplicate id=${existing.id} category=${existing.category}`,
      );
      return { created: false, item: toFeedbackItem(existing) };
    }

    const row = await this.prisma.feedbackReport.create({
      data: {
        userId,
        category: dto.category,
        title: dto.title,
        body: dto.body,
        status: "open",
        fingerprint,
      },
    });
    this.logger.log(`created id=${row.id} category=${row.category}`);
    return { created: true, item: toFeedbackItem(row) };
  }

  async list(
    userId: string,
    query: ListFeedbackQueryDto,
  ): Promise<FeedbackListResponse> {
    const limit = FEEDBACK_LIST_DEFAULT_LIMIT;
    const where: Prisma.FeedbackReportWhereInput = { userId };
    if (query.cursor) {
      const cursor = decodeFeedbackCursor(query.cursor);
      const createdAt = new Date(cursor.createdAt);
      where.AND = [
        {
          OR: [
            { createdAt: { lt: createdAt } },
            { createdAt, id: { lt: cursor.id } },
          ],
        },
      ];
    }

    const rows = await this.prisma.feedbackReport.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });
    const extra = rows.length > limit;
    const page = extra ? rows.slice(0, limit) : rows;
    const last = page[page.length - 1];
    return {
      items: page.map(toFeedbackItem),
      nextCursor:
        extra && last
          ? encodeFeedbackCursor({
              createdAt: last.createdAt.toISOString(),
              id: last.id,
            })
          : null,
    };
  }
}
