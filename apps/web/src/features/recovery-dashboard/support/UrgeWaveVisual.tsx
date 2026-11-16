/**
 * Decorative urge-as-wave visual. No clinical values, countdown, or prediction.
 * Soft layered SVG; motion is CSS-only and off under prefers-reduced-motion.
 */
export function UrgeWaveVisual({ label }: { label: string }) {
  return (
    <div
      data-craving-wave
      className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-cyan-400/15 via-[rgb(var(--soma-raised)/0.55)] to-violet-500/20 px-2 py-5 sm:px-4 sm:py-8"
      role="img"
      aria-label={label}
    >
      <style>{`
        @keyframes soma-craving-wave-drift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-4%, -2px, 0); }
        }
        @keyframes soma-craving-wave-drift-alt {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(3%, 2px, 0); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .soma-craving-wave-a {
            animation: soma-craving-wave-drift 9s ease-in-out infinite;
          }
          .soma-craving-wave-b {
            animation: soma-craving-wave-drift-alt 11s ease-in-out infinite;
          }
          .soma-craving-wave-c {
            animation: soma-craving-wave-drift 13s ease-in-out infinite;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .soma-craving-wave-a,
          .soma-craving-wave-b,
          .soma-craving-wave-c {
            animation: none;
          }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgb(103_232_249_/_0.14),transparent_55%),radial-gradient(ellipse_at_70%_80%,rgb(167_139_250_/_0.12),transparent_50%)]"
      />
      <svg
        viewBox="0 0 360 120"
        className="relative mx-auto h-24 w-full max-w-lg sm:h-32"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="soma-craving-wave-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(103 232 249)" stopOpacity="0.25" />
            <stop offset="45%" stopColor="rgb(125 211 252)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="rgb(196 181 253)" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="soma-craving-wave-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(103 232 249)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="rgb(139 92 246)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path
          className="soma-craving-wave-c"
          fill="url(#soma-craving-wave-fill)"
          d="M0 78 C48 78 54 42 102 42 C150 42 156 88 204 88 C252 88 258 50 306 50 C330 50 348 62 360 68 L360 120 L0 120 Z"
        />
        <path
          className="soma-craving-wave-a"
          fill="none"
          stroke="url(#soma-craving-wave-stroke)"
          strokeWidth="2.75"
          strokeLinecap="round"
          d="M0 70 C50 70 56 34 108 34 C160 34 166 86 218 86 C270 86 276 44 328 44 C344 44 354 50 360 54"
        />
        <path
          className="soma-craving-wave-b"
          fill="none"
          stroke="rgb(165 180 252)"
          strokeOpacity="0.45"
          strokeWidth="1.6"
          strokeLinecap="round"
          d="M0 82 C44 82 58 56 104 56 C150 56 164 92 214 92 C264 92 278 60 324 60 C342 60 354 68 360 72"
        />
      </svg>
    </div>
  );
}
