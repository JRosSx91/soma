import { PROTOTYPE_TAP_DRAG_CANCEL_PX } from "./knowledge-prototype-game-config.js";

const CANCEL_DISTANCE_SQ = PROTOTYPE_TAP_DRAG_CANCEL_PX * PROTOTYPE_TAP_DRAG_CANCEL_PX;

/** A drag past 8 px is map movement, not a rewarded tap. Equality at 8 px still counts. */
export function pointerDragCancelsTap(dx: number, dy: number) {
  return dx * dx + dy * dy > CANCEL_DISTANCE_SQ;
}

export function isBackgroundTapKey(key: string) {
  return key === " " || key === "Enter";
}

/** Keyboard sparks fire only when the map surface itself has focus, not a card or control inside it. */
export function keyboardTapTargetsBackground(target: EventTarget | null, surface: EventTarget | null) {
  return target !== null && surface !== null && target === surface;
}
