import {
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { UsersService } from "../users/users.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { RegisterDto } from "./dto/register.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import {
  CodedBadRequestException,
  CodedConflictException,
  CodedForbiddenException,
} from "../common/exceptions/coded-exception.js";
import {
  AUTH_ACCEPTANCE_REQUIRED_CODE,
  AUTH_ACCEPTANCE_REQUIRED_MESSAGE,
  assertProductionAllowsRegistration,
  assertRegistrationAcceptance,
  persistRegistrationAcceptances,
} from "./registration-acceptance.js";
import {
  persistSpecialCategoryGrant,
  persistSpecialCategoryWithdrawal,
  purgeSpecialCategoryProductData,
} from "./special-category-consent.js";
import { isCurrentSpecialCategoryGrant } from "@soma/shared-types";
import type { GrantSpecialCategoryDto } from "../account/dto/grant-special-category.dto.js";
import { normalizeEmail } from "./normalize-email.js";
import {
  RefreshSessionService,
  type IssuedRefreshSession,
  type SessionMeta,
} from "./refresh-session.service.js";
import { RegistrationInviteService } from "./registration-invite.service.js";
import {
  hashRegistrationInviteToken,
  isRegistrationInviteTokenFormat,
} from "./invite-token.crypto.js";
import {
  REGISTRATION_UNAVAILABLE_CODE,
  REGISTRATION_UNAVAILABLE_MESSAGE,
  resolveRegistrationMode,
} from "./registration-mode.js";

const SALT_ROUNDS = 10;

/**
 * The JWT payload Soma stores in tokens. Kept minimal:
 *   sub: the user id (standard JWT claim).
 *   email: convenience for displaying current user without an extra
 *          query when handling requests.
 */
export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthenticatedResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
  };
}

/** Internal: JSON body for the SPA plus plaintext refresh for the cookie layer. */
export interface AuthenticatedSessionResult extends AuthenticatedResponse {
  refresh: IssuedRefreshSession;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly refreshSessions: RefreshSessionService,
    private readonly prisma: PrismaService,
    private readonly invites: RegistrationInviteService,
  ) {}

  async register(
    dto: RegisterDto,
    meta: SessionMeta = {},
  ): Promise<AuthenticatedSessionResult> {
    assertRegistrationAcceptance(dto);
    assertProductionAllowsRegistration();
    const mode = resolveRegistrationMode();
    if (mode === "invite") {
      return this.registerWithInvite(dto, meta);
    }
    return this.registerOpen(dto, meta);
  }

  private registrationUnavailable(): CodedForbiddenException {
    return new CodedForbiddenException(
      REGISTRATION_UNAVAILABLE_CODE,
      REGISTRATION_UNAVAILABLE_MESSAGE,
    );
  }

  private async registerOpen(
    dto: RegisterDto,
    meta: SessionMeta,
  ): Promise<AuthenticatedSessionResult> {
    const email = normalizeEmail(dto.email);
    const existing = await this.usersService.findByEmailInsensitive(email);

    if (existing.status === "collision") {
      this.logger.error(
        `Email collision on register (${existing.count} rows). Refusing new account.`,
      );
      throw new CodedConflictException(
        "AUTH_EMAIL_EXISTS",
        "Email already registered",
      );
    }

    if (existing.status === "found") {
      throw new CodedConflictException(
        "AUTH_EMAIL_EXISTS",
        "Email already registered",
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.usersService.create({
      email,
      hashedPassword,
      displayName: dto.displayName,
      biologicalSex: dto.biologicalSex,
      birthYear: dto.birthYear,
      weightKg: dto.weightKg,
    });
    await persistRegistrationAcceptances(this.prisma, user.id);

    return this.buildSession(user.id, user.email, user.displayName, meta);
  }

  private async registerWithInvite(
    dto: RegisterDto,
    meta: SessionMeta,
  ): Promise<AuthenticatedSessionResult> {
    const inviteToken = dto.inviteToken ?? "";
    if (!isRegistrationInviteTokenFormat(inviteToken)) {
      throw this.registrationUnavailable();
    }

    const email = normalizeEmail(dto.email);
    const tokenHash = hashRegistrationInviteToken(inviteToken);
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const claimed = await this.invites.claimUnused(tx, tokenHash);
        if (!claimed) {
          throw this.registrationUnavailable();
        }

        const existing = await this.usersService.findByEmailInsensitive(
          email,
          tx,
        );
        if (existing.status !== "none") {
          throw this.registrationUnavailable();
        }

        const created = await this.usersService.create(
          {
            email,
            hashedPassword,
            displayName: dto.displayName,
            biologicalSex: dto.biologicalSex,
            birthYear: dto.birthYear,
            weightKg: dto.weightKg,
          },
          tx,
        );
        await persistRegistrationAcceptances(tx, created.id);
        await this.invites.attachUser(tx, claimed.id, created.id);
        return created;
      });

      return this.buildSession(user.id, user.email, user.displayName, meta);
    } catch (err) {
      if (err instanceof CodedForbiddenException) {
        throw err;
      }
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw this.registrationUnavailable();
      }
      throw err;
    }
  }

  async login(
    dto: LoginDto,
    meta: SessionMeta = {},
  ): Promise<AuthenticatedSessionResult> {
    const email = normalizeEmail(dto.email);
    const lookup = await this.usersService.findByEmailInsensitive(email);

    if (lookup.status === "collision") {
      this.logger.error(
        `Email collision on login (${lookup.count} rows). Refusing authentication.`,
      );
      throw new UnauthorizedException("Invalid credentials");
    }

    if (lookup.status === "none") {
      throw new UnauthorizedException("Invalid credentials");
    }

    const user = lookup.user;
    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.hashedPassword,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.buildSession(user.id, user.email, user.displayName, meta);
  }

  async refreshFromCookie(
    plaintext: string | undefined,
    meta: SessionMeta = {},
  ): Promise<AuthenticatedSessionResult> {
    if (!plaintext) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const { userId, session } = await this.refreshSessions.rotateSession(
      plaintext,
      meta,
    );
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    return {
      ...this.buildAuthResponse(user.id, user.email, user.displayName),
      refresh: session,
    };
  }

  async logout(plaintext: string | undefined): Promise<void> {
    await this.refreshSessions.revokeByPlaintext(plaintext);
  }

  /**
   * Records an explicit special-category grant for the JWT subject.
   * Append-only. Idempotent while already active on the current version.
   */
  async grantSpecialCategoryConsent(
    userId: string,
    dto: GrantSpecialCategoryDto,
  ): Promise<void> {
    if (!isCurrentSpecialCategoryGrant(dto)) {
      throw new CodedBadRequestException(
        AUTH_ACCEPTANCE_REQUIRED_CODE,
        AUTH_ACCEPTANCE_REQUIRED_MESSAGE,
      );
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        const locked = await tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE
        `;
        if (locked.length === 0) {
          throw this.invalidCredentials();
        }
        await persistSpecialCategoryGrant(tx, userId);
      });
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw err;
    }
  }

  /**
   * Withdraws special-category consent in the live database.
   * Keeps the account and refresh session. Idempotent.
   */
  async withdrawSpecialCategoryConsent(
    userId: string,
    password: string,
  ): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const locked = await tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE
        `;
        if (locked.length === 0) {
          throw this.invalidCredentials();
        }

        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) {
          throw this.invalidCredentials();
        }

        const passwordMatches = await bcrypt.compare(
          password,
          user.hashedPassword,
        );
        if (!passwordMatches) {
          throw this.invalidCredentials();
        }

        await persistSpecialCategoryWithdrawal(tx, userId);
        await purgeSpecialCategoryProductData(tx, userId);
      });
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw this.invalidCredentials();
      }
      throw err;
    }
  }

  /**
   * Deletes the authenticated user's personal data.
   * Identity comes from the JWT subject only — never from the request body.
   */
  async deleteOwnAccount(userId: string, password: string): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const locked = await tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE
        `;
        if (locked.length === 0) {
          throw this.invalidCredentials();
        }

        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) {
          throw this.invalidCredentials();
        }

        const passwordMatches = await bcrypt.compare(
          password,
          user.hashedPassword,
        );
        if (!passwordMatches) {
          throw this.invalidCredentials();
        }

        await tx.registrationInvite.deleteMany({
          where: { usedByUserId: userId },
        });
        await tx.user.delete({ where: { id: userId } });
      });
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw this.invalidCredentials();
      }
      throw err;
    }
  }

  private invalidCredentials(): UnauthorizedException {
    return new UnauthorizedException("Invalid credentials");
  }

  private async buildSession(
    userId: string,
    email: string,
    displayName: string,
    meta: SessionMeta,
  ): Promise<AuthenticatedSessionResult> {
    const refresh = await this.refreshSessions.issueSession(userId, meta);
    return {
      ...this.buildAuthResponse(userId, email, displayName),
      refresh,
    };
  }

  private buildAuthResponse(
    userId: string,
    email: string,
    displayName: string,
  ): AuthenticatedResponse {
    const payload: JwtPayload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: userId,
        email,
        displayName,
      },
    };
  }
}
