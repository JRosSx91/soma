export type MedalDisplaySize = "card" | "detail" | "compact" | "gallery" | "featured";

export function medalFrameClass(size: MedalDisplaySize): {
  frame: string;
  compactLike: boolean;
} {
  if (size === "detail") return { frame: "h-52 sm:h-60", compactLike: false };
  if (size === "compact") return { frame: "h-12 w-12", compactLike: true };
  if (size === "gallery") return { frame: "h-[4.75rem] w-[4.75rem]", compactLike: true };
  if (size === "featured") return { frame: "h-24 w-24", compactLike: true };
  return { frame: "h-36 sm:h-40", compactLike: false };
}
