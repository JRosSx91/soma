/**
 * Decorative craving visual.
 * Expanding ripples as a conceptual metaphor.
 * CSS-only motion with a reduced-motion alternative.
 */
export function UrgeWaveVisual({ label }: { label: string }) {
  return (
    <div
      data-craving-wave
      className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-cyan-400/[0.12] via-[rgb(var(--soma-raised)/0.55)] to-violet-500/[0.16] px-3 py-4 sm:px-5 sm:py-6"
      role="img"
      aria-label={label}
    >
      <style>{`
        @keyframes soma-ripple {
          0% {
            transform: scale(0.35);
            opacity: 0;
          }

          20% {
            opacity: 0.85;
          }

          100% {
            transform: scale(1.65);
            opacity: 0;
          }
        }

        .soma-ripple {
          transform-box: view-box;
          transform-origin: center;
        }

        @media (prefers-reduced-motion: no-preference) {
          .soma-ripple {
            animation: soma-ripple 10s ease-out infinite;
          }

          .soma-ripple-1 { animation-delay: 0s; }
          .soma-ripple-2 { animation-delay: -2.5s; }
          .soma-ripple-3 { animation-delay: -5s; }
          .soma-ripple-4 { animation-delay: -7.5s; }
        }

        @media (prefers-reduced-motion: reduce) {
          .soma-ripple {
            animation: none;
          }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="relative mx-auto flex h-56 w-full items-center justify-center sm:h-60"
      >
        <svg
          viewBox="0 0 240 240"
          className="h-full w-full max-w-60"
          aria-hidden="true"
          focusable="false"
        >
          {[
            { color: "#67e8f9", scale: 0.45, opacity: 0.75 },
            { color: "#7dd3fc", scale: 0.8, opacity: 0.55 },
            { color: "#c4b5fd", scale: 1.15, opacity: 0.35 },
            { color: "#a5f3fc", scale: 1.5, opacity: 0.15 },
          ].map((ring, index) => (
            <circle
              key={index}
              className={`soma-ripple soma-ripple-${index + 1}`}
              cx="120"
              cy="120"
              r="64"
              fill="none"
              stroke={ring.color}
              strokeWidth="1.3"
              style={{
                transform: `scale(${ring.scale})`,
                opacity: ring.opacity,
              }}
            />
          ))}

          <circle
            cx="120"
            cy="120"
            r="6"
            fill="#a5f3fc"
            style={{
              filter: "drop-shadow(0 0 8px #67e8f9)",
            }}
          />
        </svg>
      </div>
    </div>
  );
}