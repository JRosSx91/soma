import type { AuthUser } from "../types.js";

/** Profile `user` slice compatible with AuthUser (no secrets). */
export type ProfileUserSnapshot = Pick<
  AuthUser,
  "id" | "email" | "displayName" | "biologicalSex" | "birthYear" | "weightKg"
>;

/**
 * Merges personal fields from a successful profile response into the
 * in-memory AuthUser. Does not touch tokens. Refuses cross-user merges.
 */
export function mergeAuthUserFromProfile(
  current: AuthUser,
  profileUser: ProfileUserSnapshot,
): AuthUser {
  if (current.id !== profileUser.id) {
    return current;
  }
  return {
    id: current.id,
    email: profileUser.email,
    displayName: profileUser.displayName,
    biologicalSex: profileUser.biologicalSex,
    birthYear: profileUser.birthYear,
    weightKg: profileUser.weightKg,
  };
}
