import { Injectable, NotFoundException } from '@nestjs/common';
import type { SubstanceUsage, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpsertProfileDto } from './dto/upsert-profile.dto.js';

export interface ProfileResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    biologicalSex: string;
    birthYear: number;
    weightKg: number | null;
  };
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
      throw new NotFoundException('User not found');
    }

    return this.toResponse(user);
  }

  /**
   * Atomically replaces the user's substance usages with the new set.
   * Old usages are deleted, new ones are inserted. Wrapped in a
   * transaction to keep the profile consistent.
   */
  async upsertProfile(
    userId: string,
    dto: UpsertProfileDto,
  ): Promise<ProfileResponse> {
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
            status: u.status ?? 'abstinent',
            lastUseDate:
              u.status === 'active' || !u.lastUseDate
                ? null
                : new Date(u.lastUseDate),
            frequency: u.frequency,
          })),
        });
      }
    });

    return this.getProfile(userId);
  }

  private toResponse(
    user: User & { usages: SubstanceUsage[] },
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
      usages: user.usages,
    };
  }
}