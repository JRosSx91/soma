import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ProfileService } from './profile.service.js';
import { UpsertProfileDto } from './dto/upsert-profile.dto.js';

@Controller('me/profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@CurrentUser() user: Omit<User, 'hashedPassword'>) {
    return this.profileService.getProfile(user.id);
  }

  @Put()
  upsertProfile(
    @CurrentUser() user: Omit<User, 'hashedPassword'>,
    @Body() dto: UpsertProfileDto,
  ) {
    return this.profileService.upsertProfile(user.id, dto);
  }
}