import { SUPPORT_ILLUSTRATION_SIZE, supportIllustrationSrc } from "./support-visuals.js";

/**
 * Decorative card illustration (the card title names it). Fills its
 * positioned parent; the parent sets the size, so loading never shifts layout.
 */
export function SupportIllustration({
  name,
  loading = "lazy",
  className = "",
}: {
  name: string;
  loading?: "eager" | "lazy";
  className?: string;
}) {
  return (
    <picture className="contents">
      <source type="image/webp" srcSet={supportIllustrationSrc(name, "webp")} />
      <img
        src={supportIllustrationSrc(name, "png")}
        alt=""
        width={SUPPORT_ILLUSTRATION_SIZE.width}
        height={SUPPORT_ILLUSTRATION_SIZE.height}
        loading={loading}
        decoding="async"
        draggable={false}
        data-illustration={name}
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
      />
    </picture>
  );
}
