import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import type { User } from "@prisma/client";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { ProgressService } from "./progress.service.js";

@Controller("me/progress")
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(
    @Inject(ProgressService) private readonly progress: ProgressService,
  ) {}

  @Get()
  getMine(@CurrentUser() user: Omit<User, "hashedPassword">) {
    return this.progress.getMine(user.id);
  }
}
