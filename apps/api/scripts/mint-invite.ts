/**
 * Operator tool: mint one closed-beta registration invite.
 * Prints the shareable URL once. Does not log the plaintext.
 * Not invoked by build, migrate, or API bootstrap.
 */
import { PrismaClient } from "@prisma/client";
import { createId } from "../src/auth/create-id.js";
import {
  generateRegistrationInvitePlaintext,
  hashRegistrationInviteToken,
  registrationInviteTtlMs,
} from "../src/auth/invite-token.crypto.js";

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const plaintext = generateRegistrationInvitePlaintext();
  const tokenHash = hashRegistrationInviteToken(plaintext);
  const expiresAt = new Date(Date.now() + registrationInviteTtlMs());
  const publicBase = (process.env.APP_PUBLIC_URL ?? "").trim().replace(/\/$/, "");

  try {
    await prisma.registrationInvite.create({
      data: {
        id: createId(),
        tokenHash,
        expiresAt,
      },
    });
  } finally {
    await prisma.$disconnect();
  }

  const path = `/register?invite=${plaintext}`;
  process.stdout.write("Invite created. Share this link once (plaintext is not stored).\n");
  if (publicBase) {
    process.stdout.write(`${publicBase}${path}\n`);
  } else {
    process.stdout.write(`${path}\n`);
    process.stdout.write("Set APP_PUBLIC_URL to print an absolute URL.\n");
  }
  process.stdout.write(`Expires: ${expiresAt.toISOString()}\n`);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : "invite mint failed";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
