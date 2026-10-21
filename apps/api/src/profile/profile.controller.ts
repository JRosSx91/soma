import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Put,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import type { User } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { ProfileService } from "./profile.service.js";
import { UpsertProfileDto } from "./dto/upsert-profile.dto.js";
import { UpdateOnboardingStatusDto } from "./dto/update-onboarding-status.dto.js";
import { UpdateProfileDetailsDto } from "./dto/update-profile-details.dto.js";

/** Explicit expectedType so validation works when design:paramtypes is stripped. */
function bodyOf(type: new (...args: never[]) => object) {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    expectedType: type,
  });
}

@Controller("me/profile")
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    @Inject(ProfileService) private readonly profileService: ProfileService,
  ) {}

  @Get()
  getProfile(@CurrentUser() user: Omit<User, "hashedPassword">) {
    return this.profileService.getProfile(user.id);
  }

  /**
   * Full replace of substance usages. Clients must send the complete
   * desired set — an empty array clears tracking. Does not mutate
   * onboardingStatus.
   */
  @Put()
  upsertProfile(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Body(bodyOf(UpsertProfileDto)) dto: UpsertProfileDto,
  ) {
    return this.profileService.upsertProfile(user.id, dto);
  }

  /**
   * Partial update of personal details (displayName, birthYear,
   * biologicalSex, weightKg). Does not touch usages or onboardingStatus.
   */
  @Patch("details")
  updateProfileDetails(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Body(bodyOf(UpdateProfileDetailsDto)) dto: UpdateProfileDetailsDto,
  ) {
    return this.profileService.updateProfileDetails(user.id, dto);
  }

  /**
   * Explicit onboarding intent (pending | skipped | completed).
   * Independent of usages.length; never auto-derived from page visits.
   */
  @Patch("onboarding-status")
  updateOnboardingStatus(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Body(bodyOf(UpdateOnboardingStatusDto)) dto: UpdateOnboardingStatusDto,
  ) {
    return this.profileService.updateOnboardingStatus(user.id, dto.status);
  }
}
