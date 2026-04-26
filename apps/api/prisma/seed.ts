import { PrismaClient } from '@prisma/client';
import { seedSubstances } from './seed/substances.js';
import { seedOrgans } from './seed/organs.js';
import { seedDamageProfiles } from './seed/damage-profiles.js';
import { seedRecoveryCurves } from './seed/recovery-curves.js';
import { seedAchievements } from './seed/achievements.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seeding Soma database...\n');

  console.log('  - substances');
  await seedSubstances(prisma);

  console.log('  - organs');
  await seedOrgans(prisma);

  console.log('  - damage profiles');
  await seedDamageProfiles(prisma);

  console.log('  - recovery curves');
  await seedRecoveryCurves(prisma);

  console.log('  - achievements');
  await seedAchievements(prisma);

  console.log('\nDone.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });