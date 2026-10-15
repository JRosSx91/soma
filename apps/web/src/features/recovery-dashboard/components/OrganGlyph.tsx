import type { SVGProps } from "react";
import { Brain, Heart, Shield } from "lucide-react";
import type { DemoOrganIcon } from "../demo-data.js";

interface OrganGlyphProps {
  icon: DemoOrganIcon;
  className?: string;
}

function LungsGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M12 4v7"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 8c-1.2 0-2.2.6-3.2 1.6C7.2 11.2 6 13 6 15.2 6 18 7.6 20 9.4 20c1.4 0 2.2-.8 2.6-2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8c1.2 0 2.2.6 3.2 1.6C16.8 11.2 18 13 18 15.2 18 18 16.4 20 14.6 20c-1.4 0-2.2-.8-2.6-2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DigestiveGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M9 3c2.2 2 2.2 3.6 0 5.4S6.8 12 9 13.8 11.2 17 9 21"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15 3c2.2 2 2.2 3.6 0 5.4S12.8 12 15 13.8 17.2 17 15 21"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EndocrineGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
      <circle cx="12" cy="5" r="1.4" strokeWidth="1.5" />
      <circle cx="18" cy="15" r="1.4" strokeWidth="1.5" />
      <circle cx="6" cy="15" r="1.4" strokeWidth="1.5" />
    </svg>
  );
}

/** Small original or Lucide marks. Not the photoreal illustrations of the mockup. */
export function OrganGlyph({ icon, className }: OrganGlyphProps) {
  const classes = className ?? "h-8 w-8";
  switch (icon) {
    case "brain":
      return <Brain className={classes} strokeWidth={1.4} aria-hidden="true" />;
    case "lungs":
      return <LungsGlyph className={classes} aria-hidden="true" />;
    case "heart":
      return <Heart className={classes} strokeWidth={1.4} aria-hidden="true" />;
    case "immune":
      return <Shield className={classes} strokeWidth={1.4} aria-hidden="true" />;
    case "digestive":
      return <DigestiveGlyph className={classes} aria-hidden="true" />;
    case "endocrine":
      return <EndocrineGlyph className={classes} aria-hidden="true" />;
  }
}
