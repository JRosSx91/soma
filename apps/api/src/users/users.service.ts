import { Injectable } from '@nestjs/common';
import type { User, BiologicalSex } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * Encapsulates all access to the User table. Other modules (auth,
 * future profile module) interact with users through this service.
 *
 * Never returns or accepts plaintext passwords — that lives in the
 * AuthService boundary.
 */
export interface CreateUserInput {
  email: string;
  hashedPassword: string;
  displayName: string;
  biologicalSex: BiologicalSex;
  birthYear: number;
  weightKg?: number;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({ data: input });
  }
}