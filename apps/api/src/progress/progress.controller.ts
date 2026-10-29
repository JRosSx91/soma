import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import type { User } from "@prisma/client";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { PatchProgressDto } from "./dto/patch-progress.dto.js";
import { ProgressService } from "./progress.service.js";

function bodyOf(type: new (...args: never[]) => object) {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    expectedType: type,
  });
}

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

  @Patch()
  equipTitle(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Body(bodyOf(PatchProgressDto)) dto: PatchProgressDto,
  ) {
    return this.progress.equipTitle(user.id, dto.equippedTitleId);
  }
}
