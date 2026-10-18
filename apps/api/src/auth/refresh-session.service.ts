import {
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import type { Prisma, RefreshToken } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { createId } from "./create-id.js";
import {
  generateRefreshTokenPlaintext,
  hashClientIp,
  hashRefreshToken,
  truncateUserAgent,
} from "./refresh-token.crypto.js";
import { refreshCookieMaxAgeMs } from "./refresh-cookie.js";

export interface SessionMeta {
  ip?: string;
  userAgent?: string;
}

export interface IssuedRefreshSession {
  /** Plaintext token — set as HttpOnly cookie only; never log. */
  plaintext: string;
  familyId: string;
  expiresAt: Date;
}

type Tx = Prisma.TransactionClient;

/**
 * After a successful rotation, a twin-tab request that still presents the
 * pre-rotation token within this window receives 401 without revoking the
 * family (fail closed, keep the winner's session). Outside the window,
 * presenting a rotated token is treated as reuse and the family is revoked.
 *
 * Importantly: we never mint new credentials from an already-rotated token.
 */
function concurrentRaceMs(): number {
  const raw = process.env.AUTH_REFRESH_CONCURRENT_RACE_MS;
  if (raw === undefined || raw === "") return 2_000;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 2_000;
}

@Injectable()
export class RefreshSessionService {
  private readonly logger = new Logger(RefreshSessionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async issueSession(
    userId: string,
    meta: SessionMeta = {},
  ): Promise<IssuedRefreshSession> {
    const plaintext = generateRefreshTokenPlaintext();
    const tokenHash = hashRefreshToken(plaintext);
    const familyId = createId();
    const expiresAt = new Date(Date.now() + refreshCookieMaxAgeMs());

    await this.prisma.refreshToken.create({
      data: {
        id: createId(),
        userId,
        tokenHash,
        familyId,
        expiresAt,
        userAgent: truncateUserAgent(meta.userAgent),
        ipHash: hashClientIp(meta.ip),
      },
    });

    return { plaintext, familyId, expiresAt };
  }

  /**
   * Atomically rotates a refresh token.
   *
   * Concurrency:
   * - Exactly one caller wins `updateMany` where `revokedAt IS NULL`.
   * - The loser receives 401. No new token is issued from the old plaintext.
   * - Reuse of a rotated token after the concurrent-race window revokes the family.
   */
  async rotateSession(
    plaintext: string,
    meta: SessionMeta = {},
  ): Promise<{ userId: string; session: IssuedRefreshSession }> {
    const tokenHash = hashRefreshToken(plaintext);

    // Family-reuse revoke must COMMIT before we surface 401. Throwing inside
    // $transaction would roll the revoke back and leave the family alive.
    type RotateOutcome =
      | { kind: "ok"; value: { userId: string; session: IssuedRefreshSession } }
      | { kind: "reject" };

    const outcome = await this.prisma.$transaction(async (tx): Promise<RotateOutcome> => {
      const existing = await tx.refreshToken.findUnique({
        where: { tokenHash },
      });

      if (!existing) {
        return { kind: "reject" };
      }

      if (existing.expiresAt.getTime() <= Date.now()) {
        return { kind: "reject" };
      }

      if (existing.revokedAt) {
        await this.handleRevokedPresentation(tx, existing);
        return { kind: "reject" };
      }

      const claimed = await tx.refreshToken.updateMany({
        where: { id: existing.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      if (claimed.count === 0) {
        // Lost the race to another rotator — fail closed, keep winner alive.
        return { kind: "reject" };
      }

      const value = await this.mintReplacement(tx, existing, meta);
      return { kind: "ok", value };
    });

    if (outcome.kind === "reject") {
      throw new UnauthorizedException("Invalid refresh token");
    }
    return outcome.value;
  }

  /**
   * Side effects for presenting an already-revoked token.
   * Must not throw — caller commits then returns 401.
   */
  private async handleRevokedPresentation(
    tx: Tx,
    existing: RefreshToken,
  ): Promise<void> {
    if (!existing.replacedById || !existing.revokedAt) {
      return;
    }

    const windowMs = concurrentRaceMs();
    const revokedAge = Date.now() - existing.revokedAt.getTime();
    // windowMs === 0 disables the concurrent-race grace entirely.
    if (windowMs > 0 && revokedAge <= windowMs) {
      // Twin-tab / in-flight duplicate: do not escalate to family revoke.
      return;
    }

    this.logger.warn(
      `Refresh token reuse detected for family ${existing.familyId}; revoking family`,
    );
    await tx.refreshToken.updateMany({
      where: { familyId: existing.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async mintReplacement(
    tx: Tx,
    previous: Pick<RefreshToken, "id" | "userId" | "familyId">,
    meta: SessionMeta,
  ): Promise<{ userId: string; session: IssuedRefreshSession }> {
    const newPlaintext = generateRefreshTokenPlaintext();
    const newHash = hashRefreshToken(newPlaintext);
    const expiresAt = new Date(Date.now() + refreshCookieMaxAgeMs());
    const newId = createId();

    await tx.refreshToken.create({
      data: {
        id: newId,
        userId: previous.userId,
        tokenHash: newHash,
        familyId: previous.familyId,
        expiresAt,
        userAgent: truncateUserAgent(meta.userAgent),
        ipHash: hashClientIp(meta.ip),
      },
    });

    await tx.refreshToken.update({
      where: { id: previous.id },
      data: { replacedById: newId },
    });

    return {
      userId: previous.userId,
      session: {
        plaintext: newPlaintext,
        familyId: previous.familyId,
        expiresAt,
      },
    };
  }

  /**
   * Revokes the session family for the cookie plaintext.
   * Missing / already-revoked tokens are a no-op (idempotent logout).
   */
  async revokeByPlaintext(plaintext: string | undefined): Promise<void> {
    if (!plaintext) return;
    const tokenHash = hashRefreshToken(plaintext);
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!existing || existing.revokedAt) return;

    await this.prisma.refreshToken.updateMany({
      where: { familyId: existing.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async countActiveForUser(userId: string): Promise<number> {
    return this.prisma.refreshToken.count({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async findByPlaintext(plaintext: string) {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashRefreshToken(plaintext) },
    });
  }
}
