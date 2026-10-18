import { randomBytes } from "node:crypto";

/** Opaque id compatible with Prisma String @id fields (cuid-like entropy). */
export function createId(): string {
  return `c${randomBytes(16).toString("hex")}`;
}
