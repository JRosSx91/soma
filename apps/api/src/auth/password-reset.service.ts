import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service.js";
import { UsersService } from "../users/users.service.js";
import { normalizeEmail } from "./normalize-email.js";
import { createId } from "./create-id.js";
import {
  generatePasswordResetPlaintext,
  hashPasswordResetToken,
  passwordResetTtlMs,
} from "./password-reset.crypto.js";
import {
  buildPasswordResetUrl,
  PasswordResetUrlError,
} from "./password-reset-url.js";
import {
  PASSWORD_RESET_MAILER,
  assertPasswordResetMailerForRuntime,
  type PasswordResetMailer,
} from "./password-reset.mailer.js";
import type { ForgotPasswordDto } from "./dto/forgot-password.dto.js";
import type { ResetPasswordDto } from "./dto/reset-password.dto.js";

const SALT_ROUNDS = 10;

/**
 * Generic public body for forgot-password — identical for all outcomes.
 * Wording does not assert that a message was delivered, only that
 * instructions may arrive if an account exists.
 */
export const FORGOT_PASSWORD_RESPONSE = {
  ok: true as const,
  message:
    "If an account exists for that email, you will receive password reset instructions shortly.",
};

/** Generic body for successful reset (no user fields). */
export const RESET_PASSWORD_RESPONSE = {
  ok: true as const,
};

const GENERIC_RESET_ERROR = "Invalid or expired reset token";

function forgotMinMs(): number {
  const raw = process.env.AUTH_PASSWORD_RESET_MIN_MS;
  if (raw === undefined || raw === "") return 200;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 200;
}

async function holdUntil(startedAt: number, minMs: number): Promise<void> {
  const elapsed = Date.now() - startedAt;
  if (elapsed < minMs) {
    await new Promise((r) => setTimeout(r, minMs - elapsed));
  }
}

@Injectable()
export class PasswordResetService implements OnModuleInit {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    @Inject(PASSWORD_RESET_MAILER)
    private readonly mailer: PasswordResetMailer,
  ) {}

  onModuleInit(): void {
    assertPasswordResetMailerForRuntime(this.mailer);
    if (!this.mailer.canAcceptSend()) {
      this.logger.warn(
        `Password reset mailer kind="${this.mailer.kind}" cannot accept send; ` +
          `forgot-password will not mint or invalidate tokens`,
      );
    }
  }

  /**
   * Always returns the same generic payload (no account enumeration).
   *
   * Compensation policy (minimal):
   * - If the mailer cannot accept send (disabled / unconfigured): do nothing
   *   to tokens (no mint, no invalidate of prior links).
   * - If mint succeeds but accept-send fails: invalidate only the new token;
   *   prior unused tokens remain valid.
   * - If accept-send succeeds: invalidate other pending tokens for the user.
   * - Downstream provider delivery failures after accept are out of band;
   *   we never claim the email was delivered.
   *
   * Access JWTs remain valid until expiry (~15m) after a later successful reset.
   */
  async requestReset(
    dto: ForgotPasswordDto,
  ): Promise<typeof FORGOT_PASSWORD_RESPONSE> {
    const startedAt = Date.now();
    const minMs = forgotMinMs();

    try {
      const email = normalizeEmail(dto.email);
      if (!email) {
        await holdUntil(startedAt, minMs);
        return FORGOT_PASSWORD_RESPONSE;
      }

      if (!this.mailer.canAcceptSend()) {
        // Service unavailable for outbound reset mail — do not churn tokens.
        await holdUntil(startedAt, minMs);
        return FORGOT_PASSWORD_RESPONSE;
      }

      const lookup = await this.usersService.findByEmailInsensitive(email);

      if (lookup.status === "collision") {
        this.logger.error(
          `Email collision on password reset request (${lookup.count} rows). No token issued.`,
        );
        await holdUntil(startedAt, minMs);
        return FORGOT_PASSWORD_RESPONSE;
      }

      if (lookup.status === "none") {
        await holdUntil(startedAt, minMs);
        return FORGOT_PASSWORD_RESPONSE;
      }

      const user = lookup.user;
      const plaintext = generatePasswordResetPlaintext();
      const tokenHash = hashPasswordResetToken(plaintext);
      const expiresAt = new Date(Date.now() + passwordResetTtlMs());
      const tokenId = createId();

      // Mint first without touching prior tokens — only supersede after accept.
      await this.prisma.passwordResetToken.create({
        data: {
          id: tokenId,
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      let resetUrl: string;
      try {
        resetUrl = buildPasswordResetUrl(plaintext);
      } catch (err) {
        await this.invalidateTokenById(tokenId);
        if (err instanceof PasswordResetUrlError) {
          this.logger.error(`Password reset URL misconfigured: ${err.message}`);
        } else {
          this.logger.error("Password reset URL construction failed");
        }
        await holdUntil(startedAt, minMs);
        return FORGOT_PASSWORD_RESPONSE;
      }

      try {
        await this.mailer.sendPasswordReset({
          to: user.email,
          resetUrl,
        });
      } catch (err) {
        // Accept failed: drop only this attempt; keep earlier live tokens.
        await this.invalidateTokenById(tokenId);
        this.logger.error(
          `Password reset mailer reject (${err instanceof Error ? err.name : "error"}); new token discarded; prior tokens untouched`,
        );
        await holdUntil(startedAt, minMs);
        return FORGOT_PASSWORD_RESPONSE;
      }

      // Accept succeeded (not proof of inbox delivery): supersede older tokens.
      await this.prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
          id: { not: tokenId },
        },
        data: { usedAt: new Date() },
      });
    } catch (err) {
      this.logger.error(
        `Password reset request failed unexpectedly (${err instanceof Error ? err.name : "error"})`,
      );
    }

    await holdUntil(startedAt, minMs);
    return FORGOT_PASSWORD_RESPONSE;
  }

  /**
   * Consumes a reset token, updates the password hash, invalidates other
   * reset tokens, and revokes all refresh sessions — in one transaction.
   *
   * Does not issue a new session; the client must log in again.
   * Access JWTs issued before the reset remain usable until they expire.
   */
  async resetPassword(
    dto: ResetPasswordDto,
  ): Promise<typeof RESET_PASSWORD_RESPONSE> {
    const tokenHash = hashPasswordResetToken(dto.token);
    const hashedPassword = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    try {
      await this.prisma.$transaction(async (tx) => {
        const existing = await tx.passwordResetToken.findUnique({
          where: { tokenHash },
        });

        if (
          !existing ||
          existing.usedAt ||
          existing.expiresAt.getTime() <= Date.now()
        ) {
          throw new BadRequestException(GENERIC_RESET_ERROR);
        }

        const claimed = await tx.passwordResetToken.updateMany({
          where: {
            id: existing.id,
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          data: { usedAt: new Date() },
        });

        if (claimed.count === 0) {
          throw new BadRequestException(GENERIC_RESET_ERROR);
        }

        await tx.user.update({
          where: { id: existing.userId },
          data: { hashedPassword },
        });

        await tx.passwordResetToken.updateMany({
          where: {
            userId: existing.userId,
            usedAt: null,
          },
          data: { usedAt: new Date() },
        });

        await tx.refreshToken.updateMany({
          where: { userId: existing.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      });
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error(
        `Password reset failed (${err instanceof Error ? err.name : "error"})`,
      );
      throw new BadRequestException(GENERIC_RESET_ERROR);
    }

    return RESET_PASSWORD_RESPONSE;
  }

  private async invalidateTokenById(id: string): Promise<void> {
    await this.prisma.passwordResetToken
      .updateMany({
        where: { id, usedAt: null },
        data: { usedAt: new Date() },
      })
      .catch(() => undefined);
  }
}
