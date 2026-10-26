import { Prisma } from "@prisma/client";
import { createId } from "../auth/create-id.js";

export type TimestampClaimColumn = "inboxReadAt" | "celebratedAt";

type QueryRawClient = {
  $queryRaw: <T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: unknown[]
  ) => Promise<T>;
};

/**
 * Insert unlock rows. PostgreSQL `ON CONFLICT DO NOTHING RETURNING`
 * yields only rows this statement inserted — not conflicts from a
 * concurrent GET. Diffing catalogs before/after cannot give that.
 */
export async function insertUserAchievementsIgnoringConflicts(
  prisma: QueryRawClient,
  userId: string,
  rows: Array<{ achievementId: string; unlockedAt: Date }>,
  now = new Date(),
  newId: () => string = createId,
): Promise<string[]> {
  if (rows.length === 0) return [];

  const values = rows.map(
    (row) =>
      Prisma.sql`(${newId()}, ${userId}, ${row.achievementId}, ${row.unlockedAt}, ${now})`,
  );

  const inserted = await prisma.$queryRaw<Array<{ achievementId: string }>>(
    Prisma.sql`
      INSERT INTO "UserAchievement" ("id", "userId", "achievementId", "unlockedAt", "createdAt")
      VALUES ${Prisma.join(values)}
      ON CONFLICT ("userId", "achievementId") DO NOTHING
      RETURNING "achievementId"
    `,
  );

  return inserted.map((row) => row.achievementId);
}

/**
 * Conditional timestamp claim. `RETURNING` is the set this statement
 * actually updated; concurrent callers cannot both receive the same id.
 * Column names are a closed union, never taken from the request body.
 */
export async function claimUserAchievementTimestamp(
  prisma: QueryRawClient,
  input: {
    userId: string;
    achievementIds: string[];
    column: TimestampClaimColumn;
    now?: Date;
  },
): Promise<string[]> {
  const achievementIds = [
    ...new Set(input.achievementIds.filter((id) => id.length > 0)),
  ];
  if (achievementIds.length === 0) return [];

  const now = input.now ?? new Date();
  const inList = Prisma.join(achievementIds);

  const claimed =
    input.column === "inboxReadAt"
      ? await prisma.$queryRaw<Array<{ achievementId: string }>>(
          Prisma.sql`
            UPDATE "UserAchievement"
            SET "inboxReadAt" = ${now}
            WHERE "userId" = ${input.userId}
              AND "achievementId" IN (${inList})
              AND "inboxReadAt" IS NULL
            RETURNING "achievementId"
          `,
        )
      : await prisma.$queryRaw<Array<{ achievementId: string }>>(
          Prisma.sql`
            UPDATE "UserAchievement"
            SET "celebratedAt" = ${now}
            WHERE "userId" = ${input.userId}
              AND "achievementId" IN (${inList})
              AND "celebratedAt" IS NULL
            RETURNING "achievementId"
          `,
        );

  return claimed.map((row) => row.achievementId);
}
