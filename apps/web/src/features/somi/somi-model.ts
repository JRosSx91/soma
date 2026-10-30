export const SOMI_STATES = [
  "idle",
  "celebrating",
  "thinking",
  "sleeping",
  "waving",
  "supportive",
] as const;

export type SomiState = (typeof SOMI_STATES)[number];

export const SOMI_SIZES = ["small", "medium", "large"] as const;

export type SomiSize = (typeof SOMI_SIZES)[number];

export const SOMI_SRC_BY_STATE: Record<SomiState, string> = {
  idle: "/assets/somi/somi-idle.webp",
  celebrating: "/assets/somi/somi-celebrating.webp",
  thinking: "/assets/somi/somi-thinking.webp",
  sleeping: "/assets/somi/somi-sleeping.webp",
  waving: "/assets/somi/somi-waving.webp",
  supportive: "/assets/somi/somi-supportive.webp",
};

export const SOMI_IDLE_SRC = SOMI_SRC_BY_STATE.idle;

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

export function somiSrcFor(state: SomiState | undefined): string {
  return SOMI_SRC_BY_STATE[resolveSomiState(state)];
}
