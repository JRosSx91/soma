interface HeroFigureProps {
  className?: string;
  /** Soften cropped edges into the page background. */
  fadeEdges?: boolean;
}

/**
 * Decorative bust. The source faces left, toward the copy, without a CSS flip.
 * Lighten drops the file's black field into the canvas.
 *
 * Side and bottom masks fade the crop into the shell so the anatomy is not
 * sliced by a hard column edge. The asset file is unchanged.
 */
export function HeroFigure({ className, fadeEdges = true }: HeroFigureProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none overflow-hidden ${className ?? "absolute inset-0"} ${
        fadeEdges
          ? "[mask-image:linear-gradient(90deg,transparent_0%,black_14%,black_72%,transparent_100%),linear-gradient(to_bottom,black_74%,transparent_100%)] [mask-composite:intersect] [-webkit-mask-image:linear-gradient(90deg,transparent_0%,black_14%,black_72%,transparent_100%),linear-gradient(to_bottom,black_74%,transparent_100%)] [-webkit-mask-composite:source-in]"
          : ""
      }`}
    >
      <img
        src="/images/anatomy/soma-hero.png"
        alt=""
        draggable={false}
        className="absolute left-1/2 top-0 h-[108%] w-auto max-w-none -translate-x-[42%] object-contain object-left mix-blend-lighten lg:h-[118%] lg:-translate-x-[38%]"
      />
    </div>
  );
}
