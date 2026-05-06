import { Controller, Get, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { OrganNarrativeStateService } from './organ-narrative-state.service.js';

@Controller('me/organ-narrative-state')
@UseGuards(JwtAuthGuard)
export class OrganNarrativeStateController {
  constructor(
    private readonly service: OrganNarrativeStateService,
  ) {}

  @Get()
  getState(@CurrentUser() user: Omit<User, 'hashedPassword'>) {
    return this.service.getStateForUser(user.id);
  }
}