import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import type { User } from "@prisma/client";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { CreateJournalEntryDto } from "./dto/create-journal-entry.dto.js";
import { ListJournalQueryDto } from "./dto/list-journal-query.dto.js";
import { PatchJournalEntryDto } from "./dto/patch-journal-entry.dto.js";
import { WipeJournalDto } from "./dto/wipe-journal.dto.js";
import {
  JOURNAL_EXPORT_THROTTLE,
  JOURNAL_WIPE_THROTTLE,
  JOURNAL_WRITE_THROTTLE,
} from "./journal-throttle.js";
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
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: JOURNAL_WRITE_THROTTLE.limit,
      ttl: JOURNAL_WRITE_THROTTLE.ttl,
    },
  })
  create(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Body(bodyOf(CreateJournalEntryDto)) dto: CreateJournalEntryDto,
  ) {
    return this.journal.create(user.id, dto);
  }

  @Get()
  list(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Query(queryOf(ListJournalQueryDto)) query: ListJournalQueryDto,
  ) {
    return this.journal.list(user.id, query);
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
