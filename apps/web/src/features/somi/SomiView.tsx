import "./somi.css";
import {
  SOMI_IDLE_SRC,
  SOMI_SIZE_PX,
  resolveSomiSize,
  resolveSomiState,
  type SomiSize,
  type SomiState,
} from "./somi-model.js";

export interface SomiProps {
  state?: SomiState;
  size?: SomiSize;
  className?: string;
  animated?: boolean;
  /**
   * Accessible name when Somi is the only cue. Omit when adjacent text
   * already names the companion so the image stays decorative.
   */
  label?: string;
}

/**
 * CHR-01 first-phase companion sprite. One idle WebP for every mood.
 * CSS transform-only motion; no XP, events, or persistence.
 */
export function Somi({
  state = "idle",
  size = "medium",
  className,
  animated = true,
  label,
}: SomiProps) {
  const resolvedState = resolveSomiState(state);
  const resolvedSize = resolveSomiSize(size);
  const px = SOMI_SIZE_PX[resolvedSize];
  const decorative = label == null || label.length === 0;
  const motionClass =
    animated === false ? "" : `somi-motion-${resolvedState}`;

  return (
    <span
      className={["somi-frame", className].filter(Boolean).join(" ")}
      style={{ width: px, height: px }}
    >
      <span className={["somi-motion", motionClass].filter(Boolean).join(" ")}>
        <img
          src={SOMI_IDLE_SRC}
          width={px}
          height={px}
          alt={decorative ? "" : label}
          aria-hidden={decorative ? true : undefined}
          decoding="async"
          draggable={false}
          className="somi-sprite"
        />
      </span>
    </span>
  );
}
