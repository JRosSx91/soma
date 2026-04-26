import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SubstancesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the full substance catalog with all related physiological data:
   * damage profiles per organ, recovery curves per organ, and achievements
   * tied to each substance.
   *
   * This is the canonical "give me everything I need to render a substance"
   * endpoint. The frontend uses it to populate substance pickers and to
   * compute organ states for a given user's abstinence timeline.
   */
  async findAll() {
    return this.prisma.substance.findMany({
      include: {
        damageProfiles: {
          include: { organ: true },
        },
        recoveryCurves: {
          include: { organ: true },
        },
        achievements: {
          include: {
            triggerOrgan: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}