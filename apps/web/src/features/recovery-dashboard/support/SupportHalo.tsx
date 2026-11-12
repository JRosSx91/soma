/** Static concentric halo around the breathing circle. */
export function SupportHalo({ rgb, className = "" }: { rgb: string; className?: string }) {
  const ring = (inset: string, alpha: number) => (
    <span className={`absolute ${inset} rounded-full border`} style={{ borderColor: `rgb(${rgb} / ${alpha})` }} />
  );
  return (
    <span
      className={`pointer-events-none absolute left-1/2 top-1/2 aspect-square h-[78%] -translate-x-1/2 -translate-y-1/2 ${className}`}
    >
      {ring("inset-0", 0.14)}
      {ring("inset-[18%]", 0.24)}
    </span>
  );
}
