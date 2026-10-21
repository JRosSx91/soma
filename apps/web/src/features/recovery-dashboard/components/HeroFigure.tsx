interface HeroFigureProps {
  className?: string;
  /** Soften the cropped lower edge into the page background. Off by default. */
  fadeBottom?: boolean;
}

/**
 * Decorative bust. The source faces right; scaleX turns it toward the copy.
 * Lighten drops the file's black field into the canvas.
 *
 * After the flip the body occupies the left three quarters of the image and
 * the rest is empty black. The wrapper is sized to that body, and its
 * overflow only clips the empty tail on the right. The face stays inside
 * the left edge, so the anatomy is not sliced.
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
        className="absolute left-0 top-0 h-full w-auto max-w-none -scale-x-100 object-contain object-left mix-blend-lighten"
      />
    </div>
  );
}
