import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  assertSpecialCategoryProcessingAllowed,
  loadSpecialCategoryConsentActive,
  loadSpecialCategoryProcessingWithdrawn,
} from "../auth/special-category-consent.js";
import type {
  BiologicalSex,
  OnboardingStatus,
  SubstanceUsage,
  User,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { UpsertProfileDto } from "./dto/upsert-profile.dto.js";
import type { UpdateProfileDetailsDto } from "./dto/update-profile-details.dto.js";
import { isOnboardingTransitionAllowed } from "./onboarding-status.js";

export interface ProfileResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    biologicalSex: string;
    birthYear: number;
    weightKg: number | null;
  };
  /** Explicit onboarding intent — independent of usages.length. */
  onboardingStatus: OnboardingStatus;
  specialCategoryConsentActive: boolean;
  specialCategoryConsentWithdrawn: boolean;
  usages: SubstanceUsage[];
}

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<ProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { usages: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const [specialCategoryConsentActive, specialCategoryConsentWithdrawn] =
      await Promise.all([
        loadSpecialCategoryConsentActive(this.prisma, userId),
        loadSpecialCategoryProcessingWithdrawn(this.prisma, userId),
      ]);
    return this.toResponse(
      user,
      specialCategoryConsentActive,
      specialCategoryConsentWithdrawn,
    );
  }

  /**
   * Atomically replaces the user's substance usages with the new set.
   *
   * Contract (clients must send the full desired list):
   * - Old usages are deleted, then the provided rows are inserted.
   * - An empty `usages: []` clears all tracking rows.
   * - A partial client payload therefore risks accidental data loss —
   *   always read-modify-write the complete set.
   *
   * Does NOT change `onboardingStatus`. Intent updates go through
   * {@link updateOnboardingStatus} only.
   */
  async upsertProfile(
    userId: string,
    dto: UpsertProfileDto,
  ): Promise<ProfileResponse> {
    // Defense in depth: never treat missing/null usages as [].
    // ValidationPipe should already reject these; this blocks accidental clears
    // if a caller bypasses the DTO layer.
    if (!Array.isArray(dto.usages)) {
      throw new BadRequestException(
        "usages must be an array (omit/null are not allowed; use [] to clear)",
      );
    }

    if (dto.usages.length > 0) {
      await assertSpecialCategoryProcessingAllowed(this.prisma, userId);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.substanceUsage.deleteMany({ where: { userId } });

      if (dto.usages.length > 0) {
        await tx.substanceUsage.createMany({
          data: dto.usages.map((u) => ({
            userId,
            substanceId: u.substanceId,
            yearStarted: u.yearStarted,
            // status defaults to 'abstinent' if the client doesn't send
            // it (backwards compatibility). When the user is in active
            // consumption, lastUseDate is null — there's no "last use".
            status: u.status ?? "abstinent",
            lastUseDate:
              u.status === "active" || !u.lastUseDate
                ? null
                : new Date(u.lastUseDate),
            frequency: u.frequency,
          })),
        });
      }
    });

    return this.getProfile(userId);
  }

  /**
   * Partial update of editable personal fields only.
   * Never mutates email, password, onboardingStatus, or SubstanceUsage rows.
   * Omitted DTO properties are left unchanged; `weightKg: null` clears weight.
   */
  async updateProfileDetails(
    userId: string,
    dto: UpdateProfileDetailsDto,
  ): Promise<ProfileResponse> {
    // Explicit allow-list — never spread the DTO into Prisma.
    const data: {
      displayName?: string;
      biologicalSex?: BiologicalSex;
      birthYear?: number;
      weightKg?: number | null;
    } = {};

    if (dto.displayName !== undefined) {
      data.displayName = dto.displayName;
    }
    if (dto.biologicalSex !== undefined) {
      data.biologicalSex = dto.biologicalSex;
    }
    if (dto.birthYear !== undefined) {
      data.birthYear = dto.birthYear;
    }
    if (dto.weightKg !== undefined) {
      data.weightKg = dto.weightKg;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        "At least one editable field is required (displayName, biologicalSex, birthYear, or weightKg)",
      );
    }

    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return this.getProfile(userId);
  }

  /**
   * Explicitly updates onboarding intent for the authenticated user.
   * Never derives status from usages.length.
   */
  async updateOnboardingStatus(
    userId: string,
    next: OnboardingStatus,
  ): Promise<ProfileResponse> {
    const allowedValues: OnboardingStatus[] = [
      "pending",
      "skipped",
      "completed",
    ];
    if (!allowedValues.includes(next)) {
      throw new BadRequestException("Invalid onboarding status");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, onboardingStatus: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!isOnboardingTransitionAllowed(user.onboardingStatus, next)) {
      throw new BadRequestException(
        `Invalid onboarding status transition: ${user.onboardingStatus} → ${next}`,
      );
    }

    if (next === "completed") {
      await assertSpecialCategoryProcessingAllowed(this.prisma, userId);
    }

    if (user.onboardingStatus !== next) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { onboardingStatus: next },
      });
    }

    return this.getProfile(userId);
  }

  private toResponse(
    user: User & { usages: SubstanceUsage[] },
    specialCategoryConsentActive: boolean,
    specialCategoryConsentWithdrawn: boolean,
  ): ProfileResponse {
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        biologicalSex: user.biologicalSex,
        birthYear: user.birthYear,
        weightKg: user.weightKg,
      },
      onboardingStatus: user.onboardingStatus,
      specialCategoryConsentActive,
      specialCategoryConsentWithdrawn,
      usages: user.usages,
    };
  }
}
