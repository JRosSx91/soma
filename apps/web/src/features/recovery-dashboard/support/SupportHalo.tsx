/** Static concentric halo behind an illustration icon. */
export function SupportHalo({ rgb, dim = false, always = false }: { rgb: string; dim?: boolean; always?: boolean }) {
  const ring = (inset: string, alpha: number) => (
    <span
      className={`absolute ${inset} rounded-full border`}
      style={{ borderColor: `rgb(${rgb} / ${dim ? alpha / 2 : alpha})` }}
    />
  );
  return (
    <span
      className={`pointer-events-none absolute left-1/2 top-1/2 aspect-square h-[78%] -translate-x-1/2 -translate-y-1/2 ${
        always ? "block" : "hidden sm:block"
      }`}
    >
      {ring("inset-0", 0.14)}
      {ring("inset-[18%]", 0.24)}
    </span>
  );
}
