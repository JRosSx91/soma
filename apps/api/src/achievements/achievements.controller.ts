import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { AchievementsService } from './achievements.service.js';
import { MarkNotifiedDto } from './dto/mark-notified.dto.js';

@Controller('me/achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private readonly service: AchievementsService) {}

  /**
   * Returns the user's full achievement state. Triggers unlock
   * detection on every call: any thresholds crossed since the last
   * call are persisted before the response is built.
   */
  @Get()
  async getMyAchievements(@CurrentUser() user: Omit<User, 'hashedPassword'>) {
    await this.service.detectAndPersistUnlocks(user.id);
    return this.service.getUserAchievements(user.id);
  }

  /**
   * Marks a batch of achievements as notified for this user. Called
   * after the frontend has surfaced trophy unlock toasts.
   */
  @Post('mark-notified')
  async markAsNotified(
    @CurrentUser() user: Omit<User, 'hashedPassword'>,
    @Body() dto: MarkNotifiedDto,
  ) {
    return this.service.markAsNotified(user.id, dto.achievementIds);
  }
}