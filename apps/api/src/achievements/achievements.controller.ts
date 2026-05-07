import { Controller, Get, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { AchievementsService } from './achievements.service.js';

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
}