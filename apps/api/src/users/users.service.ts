import { Injectable } from "@nestjs/common";
import type { User, BiologicalSex, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { normalizeEmail } from "../auth/normalize-email.js";

type UserDb = PrismaService | Prisma.TransactionClient;

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

/**
 * Result of a case-insensitive email lookup.
 * `collision` means more than one row matches the normalized address
 * (legacy mixed-case duplicates). Callers must not pick one arbitrarily.
 */
export type EmailLookupResult =
  | { status: "none" }
  | { status: "found"; user: User }
  | { status: "collision"; count: number };

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Exact match on the stored email string (legacy helper).
   * Prefer {@link findByEmailInsensitive} for authentication flows.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Finds a user by normalized email without rewriting stored values.
   * Uses PostgreSQL case-insensitive equality so legacy mixed-case
   * rows remain reachable after input normalization.
   */
  async findByEmailInsensitive(
    email: string,
    db: UserDb = this.prisma,
  ): Promise<EmailLookupResult> {
    const normalized = normalizeEmail(email);
    if (!normalized) {
      return { status: "none" };
    }

    const matches = await db.user.findMany({
      where: {
        email: { equals: normalized, mode: "insensitive" },
      },
      take: 2,
    });

    if (matches.length === 0) {
      return { status: "none" };
    }
    if (matches.length > 1) {
      return { status: "collision", count: matches.length };
    }
    return { status: "found", user: matches[0]! };
  }

  async create(input: CreateUserInput, db: UserDb = this.prisma): Promise<User> {
    return db.user.create({
      data: {
        ...input,
        email: normalizeEmail(input.email),
      },
    });
  }

  async updateHashedPassword(
    userId: string,
    hashedPassword: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedPassword },
    });
  }
}
