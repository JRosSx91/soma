import { useId } from "react";

/**
 * Geometry copied from public/images/decoration/lineas.svg.
 * ViewBox stays 700×210 so the fan is scaled uniformly.
 */
const fan = [
  ["M 110 207 C 170 145, 330 190, 420 20", "1.5", "0.25"],
  ["M 118 207 C 175 142, 333 182, 424 25", "0.8", "0.36"],
  ["M 126 207 C 180 139, 336 174, 428 30", "0.8", "0.47"],
  ["M 134 207 C 185 136, 339 166, 432 35", "1.5", "0.58"],
  ["M 142 207 C 190 133, 342 158, 436 40", "0.8", "0.69"],
  ["M 150 207 C 195 130, 345 150, 440 45", "0.8", "0.25"],
  ["M 158 207 C 200 127, 348 142, 444 50", "1.5", "0.36"],
  ["M 166 207 C 205 124, 351 134, 448 55", "0.8", "0.47"],
  ["M 174 207 C 210 121, 354 126, 452 60", "0.8", "0.58"],
  ["M 182 207 C 215 118, 357 118, 456 65", "1.5", "0.69"],
  ["M 190 207 C 220 115, 360 110, 460 70", "0.8", "0.25"],
  ["M 198 207 C 225 112, 363 102, 464 75", "0.8", "0.36"],
  ["M 206 207 C 230 109, 366 94, 468 80", "1.5", "0.47"],
] as const;

const wisps = [
  ["M 240 210 Q 450 100 690 75", "0.12"],
  ["M 251 210 Q 458 90 690 85", "0.145"],
  ["M 262 210 Q 466 80 690 95", "0.17"],
  ["M 273 210 Q 474 70 690 105", "0.195"],
  ["M 284 210 Q 482 60 690 115", "0.22"],
  ["M 295 210 Q 490 50 690 125", "0.245"],
  ["M 306 210 Q 498 40 690 135", "0.27"],
  ["M 317 210 Q 506 30 690 145", "0.295"],
] as const;

export function HeroFilaments() {
  const gradientId = `fiber-${useId().replace(/:/g, "")}`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-0 hidden overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_22%,black_82%,transparent)] md:block md:right-0 md:top-6 md:h-32 md:w-40 lg:top-2 lg:h-40 lg:w-52 xl:right-[-1rem] xl:top-0 xl:h-52 xl:w-64 2xl:right-[-4rem] 2xl:h-60 2xl:w-72 min-[1650px]:right-[-8rem] min-[1650px]:h-64 min-[1650px]:w-[24rem]"
    >
      <svg
        viewBox="0 0 700 210"
        className="absolute h-56 w-auto max-w-none md:left-[-18rem] md:top-[-1.5rem] lg:left-[-22rem] lg:h-72 xl:left-[-28rem] xl:top-[-1rem] xl:h-80 2xl:left-[-34rem] 2xl:h-[24rem] min-[1650px]:left-[-44.75rem] min-[1650px]:top-[-0.5rem] min-[1650px]:h-[26rem]"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0678BD" stopOpacity="0" />
            <stop offset="45%" stopColor="#1484D5" stopOpacity="0.35" />
            <stop offset="80%" stopColor="#2FC9EE" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#2FC9EE" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g>
          {fan.map(([d, strokeWidth, opacity]) => (
            <path
              key={d}
              d={d}
              stroke={`url(#${gradientId})`}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          ))}
          {wisps.map(([d, opacity]) => (
            <path
              key={d}
              d={d}
              stroke="#1375BA"
              strokeWidth="0.7"
              opacity={opacity}
            />
          ))}
          <circle cx="477" cy="95" r="2" fill="#48D9ED" />
          <circle cx="560" cy="118" r="1.5" fill="#48D9ED" opacity="0.7" />
        </g>
      </svg>
    </div>
  );
}
