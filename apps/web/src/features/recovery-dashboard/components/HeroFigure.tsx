interface HeroFigureProps {
  className?: string;
  /** Soften the cropped lower edge into the page background. Off by default. */
  fadeBottom?: boolean;
}

/**
 * Decorative bust. The source faces left, toward the copy, without a CSS flip.
 * Lighten drops the file's black field into the canvas.
 *
 * The body sits on the left of the frame. Overflow only clips empty space on
 * the right. The face stays inside the left edge, so the anatomy is not sliced.
 */
export function HeroFigure({ className, fadeBottom = false }: HeroFigureProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none overflow-hidden ${className ?? "absolute right-0 top-0"} ${
        fadeBottom
          ? "[mask-image:linear-gradient(to_bottom,black_70%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
          : ""
      }`}
    >
      <img
        src="/images/anatomy/soma-hero.png"
        alt=""
        draggable={false}
        className="absolute left-0 top-0 h-full w-auto max-w-none object-contain object-left mix-blend-lighten"
      />
    </div>
  );
}
