import "./somi.css";
import {
  SOMI_SIZE_PX,
  resolveSomiSize,
  resolveSomiState,
  somiSrcFor,
  type SomiSize,
  type SomiState,
} from "./somi-model.js";

export interface SomiProps {
  state?: SomiState;
  size?: SomiSize;
  className?: string;
  /**
   * Accessible name when Somi is the only cue. Omit when adjacent text
   * already names the companion so the image stays decorative.
   */
  label?: string;
}

/**
 * CHR-01 static companion illustration. One WebP per mood; no CSS motion.
 */
export function Somi({
  state = "idle",
  size = "medium",
  className,
  label,
}: SomiProps) {
  const resolvedState = resolveSomiState(state);
  const resolvedSize = resolveSomiSize(size);
  const px = SOMI_SIZE_PX[resolvedSize];
  const decorative = label == null || label.length === 0;

  return (
    <span
      className={["somi-frame", className].filter(Boolean).join(" ")}
      style={{ width: px }}
    >
      <img
        src={somiSrcFor(resolvedState)}
        width={px}
        height={px}
        alt={decorative ? "" : label}
        aria-hidden={decorative ? true : undefined}
        decoding="async"
        draggable={false}
        className="somi-sprite"
      />
    </span>
  );
}
