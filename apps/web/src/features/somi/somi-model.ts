export const SOMI_STATES = [
  "idle",
  "happy",
  "celebrating",
  "supportive",
  "sleeping",
] as const;

export type SomiState = (typeof SOMI_STATES)[number];

export const SOMI_SIZES = ["small", "medium", "large"] as const;

export type SomiSize = (typeof SOMI_SIZES)[number];

/** First-phase idle sprite. All states share this asset until additional poses exist. */
export const SOMI_IDLE_SRC = "/assets/somi/somi-idle.webp";

export const SOMI_SIZE_PX: Record<SomiSize, number> = {
  small: 72,
  medium: 112,
  large: 160,
};

export function isSomiState(value: unknown): value is SomiState {
  return typeof value === "string" && (SOMI_STATES as readonly string[]).includes(value);
}

export function isSomiSize(value: unknown): value is SomiSize {
  return typeof value === "string" && (SOMI_SIZES as readonly string[]).includes(value);
}

export function resolveSomiState(value: SomiState | undefined): SomiState {
  return value && isSomiState(value) ? value : "idle";
}

export function resolveSomiSize(value: SomiSize | undefined): SomiSize {
  return value && isSomiSize(value) ? value : "medium";
}
