import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

@Injectable()
export class RegistrationInviteService {
  /**
   * Atomically marks an unused, unrevoked, unexpired invite as used.
   * Returns the row id, or null without distinguishing why the claim failed.
   * Caller must not log tokenHash.
   */
  async claimUnused(tx: Tx, tokenHash: string, now = new Date()): Promise<{ id: string } | null> {
    const existing = await tx.registrationInvite.findUnique({
      where: { tokenHash },
      select: { id: true, usedAt: true, revokedAt: true, expiresAt: true },
    });

    if (!existing) return null;
    if (existing.usedAt) return null;
    if (existing.revokedAt) return null;
    if (existing.expiresAt.getTime() <= now.getTime()) return null;

    const claimed = await tx.registrationInvite.updateMany({
      where: {
        id: existing.id,
        usedAt: null,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    });

    if (claimed.count === 0) return null;
    return { id: existing.id };
  }

  async attachUser(tx: Tx, inviteId: string, userId: string): Promise<void> {
    await tx.registrationInvite.update({
      where: { id: inviteId },
      data: { usedByUserId: userId },
    });
  }
}
