export const SPARK_HEAD = 40;
export const SPARK_CORE = 110;
export const SPARK_TRAIL = 220;

/** Shared path progress: stroke tip and every spark layer meet at `progress * pathLength`. */
export function pulseRevealOffsets(progress: number, pathLength: number) {
  const drawn = Math.min(1, Math.max(0, progress)) * pathLength;
  return {
    drawnLength: drawn,
    drawDashoffset: pathLength - drawn,
    sparkHeadDashoffset: SPARK_HEAD - drawn,
    sparkCoreDashoffset: SPARK_CORE - drawn,
    sparkTrailDashoffset: SPARK_TRAIL - drawn,
  };
}
