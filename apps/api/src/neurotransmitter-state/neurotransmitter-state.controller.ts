import { Controller, Get, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { NeurotransmitterStateService } from './neurotransmitter-state.service.js';

@Controller('me/neurotransmitter-state')
@UseGuards(JwtAuthGuard)
export class NeurotransmitterStateController {
  constructor(
    private readonly service: NeurotransmitterStateService,
  ) {}

  @Get()
  getState(@CurrentUser() user: Omit<User, 'hashedPassword'>) {
    return this.service.getStateForUser(user.id);
  }
}