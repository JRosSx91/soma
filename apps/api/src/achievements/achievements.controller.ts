import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { User } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { AchievementsService } from "./achievements.service.js";
import { AchievementIdsDto } from "./dto/achievement-ids.dto.js";
import { MarkNotifiedDto } from "./dto/mark-notified.dto.js";

@Controller("me/achievements")
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private readonly service: AchievementsService) {}

  /**
   * Returns the user's full achievement state as an array (unchanged
   * envelope). Triggers unlock detection on every call. Rows this
   * request actually inserted have insertedThisCall=true.
   */
  @Get()
  async getMyAchievements(@CurrentUser() user: Omit<User, "hashedPassword">) {
    const insertedIds = await this.service.detectAndPersistUnlocks(user.id);
    return this.service.getUserAchievements(user.id, insertedIds);
  }

  /**
   * Marks a batch of achievements as notified for this user. Called
   * after the frontend has surfaced trophy unlock toasts.
   * Sets notifiedAt only.
   */
  @Post("mark-notified")
  async markAsNotified(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Body() dto: MarkNotifiedDto,
  ) {
    return this.service.markAsNotified(user.id, dto.achievementIds);
  }

  /**
   * Marks notification-center items as read. Sets inboxReadAt only
   * where it is still null. Does not change notifiedAt or celebratedAt.
   */
  @Post("inbox-read")
  @HttpCode(HttpStatus.OK)
  async markInboxRead(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Body() dto: AchievementIdsDto,
  ) {
    return this.service.markInboxRead(user.id, dto.achievementIds);
  }

  /**
   * Claims celebration presentation. Sets celebratedAt only where it is
   * still null. Response celebratedIds are the ids this request won.
   */
  @Post("celebrate")
  @HttpCode(HttpStatus.OK)
  async claimCelebrations(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Body() dto: AchievementIdsDto,
  ) {
    return this.service.claimCelebrations(user.id, dto.achievementIds);
  }
}
