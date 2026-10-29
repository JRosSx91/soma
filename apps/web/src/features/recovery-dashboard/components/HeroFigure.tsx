interface HeroFigureProps {
  className?: string;
  /** Soften cropped edges into the page background. */
  fadeEdges?: boolean;
  /** `rail` fits the bust; `home` enlarges it in the dashboard column. */
  layout?: "wide" | "rail" | "home";
}

/**
 * Decorative bust. The source faces left, toward the copy, without a CSS flip.
 * Lighten drops the file's black field into the canvas.
 *
 * Side and bottom masks fade the crop into the shell so the anatomy is not
 * sliced by a hard column edge. The asset file is unchanged.
 */
export function HeroFigure({ className, fadeEdges = true, layout = "wide" }: HeroFigureProps) {
  const rail = layout === "rail";
  const home = layout === "home";
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none ${home ? "overflow-visible" : "overflow-hidden"} ${className ?? "absolute inset-0"} ${
        fadeEdges
          ? "[mask-image:linear-gradient(90deg,transparent_0%,black_14%,black_72%,transparent_100%),linear-gradient(to_bottom,black_74%,transparent_100%)] [mask-composite:intersect] [-webkit-mask-image:linear-gradient(90deg,transparent_0%,black_14%,black_72%,transparent_100%),linear-gradient(to_bottom,black_74%,transparent_100%)] [-webkit-mask-composite:source-in]"
          : ""
      }`}
    >
      <img
        src="/images/anatomy/soma-hero.png"
        alt=""
        draggable={false}
        className={
          rail
            ? "absolute inset-0 h-full w-full object-contain object-center mix-blend-lighten"
            : home
              ? "absolute left-0 top-2 h-[calc(100%-0.5rem)] w-[140%] max-w-none object-cover object-left-top mix-blend-lighten"
              : "absolute left-1/2 top-0 h-[108%] w-auto max-w-none -translate-x-[42%] object-contain object-left mix-blend-lighten lg:h-[118%] lg:-translate-x-[38%]"
        }
        style={
          home
            ? {
                maskImage:
                  "linear-gradient(to bottom, #000 0%, #000 58%, rgba(0,0,0,0.72) 76%, rgba(0,0,0,0.28) 90%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, #000 0%, #000 58%, rgba(0,0,0,0.72) 76%, rgba(0,0,0,0.28) 90%, transparent 100%)",
              }
            : undefined
        }
      />
    </div>
  );
}
