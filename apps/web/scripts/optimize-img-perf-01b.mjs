/**
 * IMG-PERF-01B — WebP derivatives for educational process plates and the
 * Explore missions banner. Does not replace PNG masters. Re-runnable.
 */
import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const magick =
  process.env.MAGICK_BIN ??
  "C:\\Program Files\\ImageMagick-7.1.2-Q16-HDRI\\magick.exe";

if (!existsSync(magick)) {
  console.error("ImageMagick not found:", magick);
  process.exit(1);
}

const ART_QUALITY = "86";
const PROCESS_THUMB = 240;
const MISSIONS_STEP = 960;

const processes = [
  "receptors",
  "tolerance",
  "dependence",
  "neuroadaptation",
  "metabolism",
];

const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const only = onlyArg ? onlyArg.slice("--only=".length) : "all";

function run(args) {
  const result = spawnSync(magick, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`magick failed: ${args.join(" ")}`);
  }
}

function kb(path) {
  return (statSync(path).size / 1024).toFixed(1);
}

function webpArgs(png, extraResize = []) {
  return [
    png,
    "-strip",
    "-background",
    "none",
    "-alpha",
    "set",
    ...extraResize,
    "-quality",
    ART_QUALITY,
    "-define",
    "webp:method=6",
    "-define",
    "webp:alpha-quality=90",
  ];
}

function emitProcess(id) {
  const png = join(webRoot, "public/images/processes", `process-${id}.png`);
  const native = join(webRoot, "public/images/processes", `process-${id}.webp`);
  const thumb = join(webRoot, "public/images/processes", `process-${id}-${PROCESS_THUMB}.webp`);
  run([...webpArgs(png), native]);
  console.log(`process-${id}.webp (native) ${kb(native)} KB`);
  run([...webpArgs(png, ["-resize", `${PROCESS_THUMB}x`]), thumb]);
  console.log(`process-${id}-${PROCESS_THUMB}.webp ${kb(thumb)} KB`);
}

function emitMissions() {
  const png = join(webRoot, "public/images/missions", "educational-missions.png");
  const native = join(webRoot, "public/images/missions", "educational-missions.webp");
  const step = join(webRoot, "public/images/missions", `educational-missions-${MISSIONS_STEP}.webp`);
  run([...webpArgs(png), native]);
  console.log(`educational-missions.webp (native) ${kb(native)} KB`);
  run([...webpArgs(png, ["-resize", `${MISSIONS_STEP}x`]), step]);
  console.log(`educational-missions-${MISSIONS_STEP}.webp ${kb(step)} KB`);
}

console.log("IMG-PERF-01B using", magick, only === "all" ? "" : `(only=${only})`);
if (only === "all" || only === "processes") {
  for (const id of processes) emitProcess(id);
}
if (only === "all" || only === "missions") {
  emitMissions();
}
console.log("done");
