import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

/**
 * Seeds a single demo user with a known credential set, useful for
 * development and testing of the auth flow. Idempotent: re-seeding
 * does not duplicate the user or their substance usages.
 *
 * Demo credentials:
 *   email:    demo@soma.dev
 *   password: soma123
 *
 * The user has staggered last-use dates across the four modeled
 * substances so the body diagram displays a varied recovery state.
 *
 * NOTE: This is development-only data. Production seeding must not
 * run this module.
 */
const SALT_ROUNDS = 10;
const DAY_MS = 1000 * 60 * 60 * 24;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_MS);
}

export async function seedUsers(prisma: PrismaClient): Promise<void> {
  const hashedPassword = await bcrypt.hash('soma123', SALT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email: 'demo@soma.dev' },
    update: {
      // On re-seed, refresh the password and profile fields but keep
      // the same row (so foreign keys from usages remain valid).
      hashedPassword,
      displayName: 'Demo user',
      biologicalSex: 'male',
      birthYear: 1990,
      weightKg: 78,
    },
    create: {
      email: 'demo@soma.dev',
      hashedPassword,
      displayName: 'Demo user',
      biologicalSex: 'male',
      birthYear: 1990,
      weightKg: 78,
    },
  });

  // Define the staggered usage profile mirroring the previous
  // hard-coded MOCK_PROFILE in the frontend.
  const usages = [
    {
      substanceId: 'nicotine',
      yearStarted: 2010,
      lastUseDate: daysAgo(21),
      frequency: 'daily' as const,
    },
    {
      substanceId: 'cannabis',
      yearStarted: 2012,
      lastUseDate: daysAgo(90),
      frequency: 'daily' as const,
    },
    {
      substanceId: 'alcohol',
      yearStarted: 2008,
      lastUseDate: daysAgo(180),
      frequency: 'weekly' as const,
    },
    {
      substanceId: 'cocaine',
      yearStarted: 2015,
      lastUseDate: daysAgo(300),
      frequency: 'occasional' as const,
    },
  ];

  for (const usage of usages) {
    // Use composite (userId, substanceId) lookup. Currently the schema
    // does not declare a composite unique index on SubstanceUsage, so
    // we emulate upsert via deleteMany + create. When the composite
    // unique is added, switch to a true upsert.
    await prisma.substanceUsage.deleteMany({
      where: {
        userId: user.id,
        substanceId: usage.substanceId,
      },
    });

    await prisma.substanceUsage.create({
      data: {
        userId: user.id,
        ...usage,
      },
    });
  }
}