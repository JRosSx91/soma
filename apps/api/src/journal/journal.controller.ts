import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import type { Response } from "express";
import { CodedBadRequestException } from "../common/exceptions/coded-exception.js";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import type { User } from "@prisma/client";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { CreateJournalEntryDto } from "./dto/create-journal-entry.dto.js";
import { CreateJournalMilestoneDto } from "./dto/create-journal-milestone.dto.js";
import { ListJournalQueryDto } from "./dto/list-journal-query.dto.js";
import { PatchJournalEntryDto } from "./dto/patch-journal-entry.dto.js";
import { PatchJournalMilestoneDto } from "./dto/patch-journal-milestone.dto.js";
import { WipeJournalDto } from "./dto/wipe-journal.dto.js";
import {
  JOURNAL_EXPORT_THROTTLE,
  JOURNAL_WIPE_THROTTLE,
  JOURNAL_WRITE_THROTTLE,
} from "./journal-throttle.js";
import {
  INVALID_IDEMPOTENCY_KEY,
  isInvalidIdempotencyKey,
  parseJournalIdempotencyKey,
} from "./journal-idempotency.js";
import { JournalService } from "./journal.service.js";

/** Explicit expectedType so validation works when design:paramtypes is stripped. */
function bodyOf(type: new (...args: never[]) => object) {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    expectedType: type,
  });
}

function queryOf(type: new (...args: never[]) => object) {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    expectedType: type,
  });
}

@Controller("me/journal")
@UseGuards(JwtAuthGuard)
export class JournalController {
  constructor(
    @Inject(JournalService) private readonly journal: JournalService,
  ) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: JOURNAL_WRITE_THROTTLE.limit,
      ttl: JOURNAL_WRITE_THROTTLE.ttl,
    },
  })
  async create(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Body(bodyOf(CreateJournalEntryDto)) dto: CreateJournalEntryDto,
    @Headers("idempotency-key") rawKey: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const clientOpId = parseJournalIdempotencyKey(rawKey);
    if (isInvalidIdempotencyKey(clientOpId)) {
      throw new CodedBadRequestException(
        INVALID_IDEMPOTENCY_KEY,
        "Idempotency-Key must be a UUID v4",
      );
    }
    const result = await this.journal.create(user.id, dto, clientOpId);
    res.status(result.replay ? HttpStatus.OK : HttpStatus.CREATED);
    return result.entry;
  }

  @Get()
  list(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Query(queryOf(ListJournalQueryDto)) query: ListJournalQueryDto,
  ) {
    return this.journal.list(user.id, query);
  }

  @Get("milestones")
  listMilestones(@CurrentUser() user: Omit<User, "hashedPassword">) {
    return this.journal.listMilestones(user.id);
  }

  @Post("milestones")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: JOURNAL_WRITE_THROTTLE.limit,
      ttl: JOURNAL_WRITE_THROTTLE.ttl,
    },
  })
  createMilestone(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Body(bodyOf(CreateJournalMilestoneDto)) dto: CreateJournalMilestoneDto,
  ) {
    return this.journal.createMilestone(user.id, dto);
  }

  @Get("milestones/:id")
  getMilestone(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Param("id") id: string,
  ) {
    return this.journal.getMilestone(user.id, id);
  }

  @Patch("milestones/:id")
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: JOURNAL_WRITE_THROTTLE.limit,
      ttl: JOURNAL_WRITE_THROTTLE.ttl,
    },
  })
  patchMilestone(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Param("id") id: string,
    @Body(bodyOf(PatchJournalMilestoneDto)) dto: PatchJournalMilestoneDto,
  ) {
    return this.journal.patchMilestone(user.id, id, dto);
  }

  @Delete("milestones/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: JOURNAL_WRITE_THROTTLE.limit,
      ttl: JOURNAL_WRITE_THROTTLE.ttl,
    },
  })
  async removeMilestone(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Param("id") id: string,
  ): Promise<void> {
    await this.journal.removeMilestone(user.id, id);
  }

  @Get("export")
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: JOURNAL_EXPORT_THROTTLE.limit,
      ttl: JOURNAL_EXPORT_THROTTLE.ttl,
    },
  })
  exportAll(@CurrentUser() user: Omit<User, "hashedPassword">) {
    return this.journal.exportAll(user.id);
  }

  @Get(":id")
  getOne(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Param("id") id: string,
  ) {
    return this.journal.getOne(user.id, id);
  }

  @Patch(":id")
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: JOURNAL_WRITE_THROTTLE.limit,
      ttl: JOURNAL_WRITE_THROTTLE.ttl,
    },
  })
  patch(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Param("id") id: string,
    @Body(bodyOf(PatchJournalEntryDto)) dto: PatchJournalEntryDto,
  ) {
    return this.journal.patch(user.id, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: JOURNAL_WRITE_THROTTLE.limit,
      ttl: JOURNAL_WRITE_THROTTLE.ttl,
    },
  })
  async remove(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Param("id") id: string,
  ): Promise<void> {
    await this.journal.remove(user.id, id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: JOURNAL_WIPE_THROTTLE.limit,
      ttl: JOURNAL_WIPE_THROTTLE.ttl,
    },
  })
  async wipe(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Body(bodyOf(WipeJournalDto)) dto: WipeJournalDto,
  ): Promise<void> {
    void dto;
    await this.journal.wipeAll(user.id);
  }
}
