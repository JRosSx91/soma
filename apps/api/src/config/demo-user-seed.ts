/**
 * Blocks the development demo account from being created or updated
 * when NODE_ENV=production. Does not touch existing database rows.
 */
export function assertDemoUserSeedAllowed(
  env: NodeJS.ProcessEnv = process.env,
): void {
  if ((env.NODE_ENV ?? "").trim() === "production") {
    throw new Error(
      "Demo user seed is disabled when NODE_ENV=production",
    );
  }
}
