/**
 * Canonical email form for lookup and storage of new accounts.
 * Does not mutate existing database rows — callers decide how to query legacy values.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
