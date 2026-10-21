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
  CodedConflictException,
  CodedForbiddenException,
} from "../common/exceptions/coded-exception.js";
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
