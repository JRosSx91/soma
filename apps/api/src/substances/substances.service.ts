import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SubstancesService {
  constructor(private readonly prisma: PrismaService) {}

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