interface HeroFigureProps {
  className?: string;
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
export function HeroFigure({ className }: HeroFigureProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute right-0 top-0 hidden overflow-hidden md:block ${className ?? ""}`}
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
