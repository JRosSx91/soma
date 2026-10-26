/** Presentation-only. Does not change which achievements are celebrated. */
export type CelebrationMedalLayout = "solo" | "featured" | "grid";

export function celebrationMedalLayout(count: number): CelebrationMedalLayout {
  if (count <= 1) return "solo";
  if (count <= 3) return "featured";
  return "grid";
}
