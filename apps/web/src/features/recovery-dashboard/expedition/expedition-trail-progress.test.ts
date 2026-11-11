import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { buildDemoMissions } from "../../missions/missions-demo.ts";
import {
  NEUROSCIENCE_TRAIL_D,
  PROCESSES_TRAIL_D,
  TRAIL_VIEWBOX_HEIGHT,
  TRAIL_VIEWBOX_WIDTH,
} from "./expedition-trail-layout.ts";
import {
  knowledgeFillForRoute,
  knowledgeTrailFill,
  perseveranceHaloTicks,
  TRAIL_HALO_TICKS,
} from "./expedition-trail-progress.ts";
import {
  buildKnowledgeNodes,
  buildPerseveranceNodes,
  type ExpeditionNode,
} from "./expedition-model.ts";

const trailSource = readFileSync(
  new URL("./ExpeditionTrail.tsx", import.meta.url),
  "utf8",
);
const mapSource = readFileSync(new URL("./ExpeditionMap.tsx", import.meta.url), "utf8");
const layoutSource = readFileSync(
  new URL("./expedition-trail-layout.ts", import.meta.url),
  "utf8",
);
const expeditionImages = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../public/images/expedition",
);
const progressSource = readFileSync(
  new URL("./expedition-trail-progress.ts", import.meta.url),
  "utf8",
);

function knowledgeFromDemo(completedIds: string[] = []): ExpeditionNode[] {
  return buildKnowledgeNodes("/preview", buildDemoMissions(new Set(completedIds)), 2);
}

test("0/0 and upcoming categories do not light the trail", () => {
  const empty: ExpeditionNode[] = [
    {
      id: "neurotransmitters",
      route: "knowledge",
      status: "upcoming",
      completed: null,
      total: null,
      href: "/preview/missions",
    },
    {
      id: "processes",
      route: "knowledge",
      status: "upcoming",
      completed: 0,
      total: 0,
      href: "/preview/missions",
    },
  ];
  assert.deepEqual(knowledgeTrailFill(empty), {
    neurotransmitters: 0,
    processes: 0,
  });
});

test("published neuro and processes fill independently; anatomy is ignored", () => {
  const partial = knowledgeFromDemo(["edu-dopamine-01"]);
  const fill = knowledgeTrailFill(partial);
  assert.equal(fill.neurotransmitters, Math.round((1 * 100) / 9));
  assert.equal(fill.processes, 0);
  const anatomy = partial.find((node) => node.id === "orientation");
  const substances = partial.find((node) => node.id === "substances");
  const recovery = partial.find((node) => node.id === "recovery");
  assert.equal(anatomy?.total, null);
  assert.equal(substances?.total, null);
  assert.equal(recovery?.completed, null);
  assert.equal(fill.neurotransmitters > 0 && fill.processes === 0, true);
});

test("complete neurotransmitters is 100 without lighting processes", () => {
  const missions = buildDemoMissions(
    new Set(
      buildDemoMissions(new Set())
        .filter((row) => row.categoryId === "neurotransmitters")
        .map((row) => row.id),
    ),
  );
  const fill = knowledgeTrailFill(buildKnowledgeNodes("/preview", missions, 1));
  assert.equal(fill.neurotransmitters, 100);
  assert.equal(fill.processes, 0);
});

test("selection is not an input to knowledge fill", () => {
  assert.equal(knowledgeTrailFill.length, 1);
  assert.equal(progressSource.includes("selectedId"), false);
});

test("perseverance route yields no knowledge overlay fill", () => {
  const nodes = buildPerseveranceNodes("/preview", [], ["nicotine"]);
  assert.deepEqual(knowledgeFillForRoute("perseverance", nodes), {
    neurotransmitters: 0,
    processes: 0,
  });
});

test("perseverance halo uses that substance clock only", () => {
  const nodes = buildPerseveranceNodes(
    "/preview",
    [
      {
        substanceId: "nicotine",
        status: "upcoming",
        daysAbstinent: 14,
        next: null,
      },
      {
        substanceId: "alcohol",
        status: "complete",
        daysAbstinent: 400,
        next: null,
      },
    ],
    ["nicotine", "alcohol"],
  );
  const nicotine = nodes.find((node) => node.id === "nicotine");
  const alcohol = nodes.find((node) => node.id === "alcohol");
  const waiting = nodes.find((node) => node.id === "cannabis");
  assert.equal(perseveranceHaloTicks(nicotine).completed, 4);
  assert.equal(perseveranceHaloTicks(nicotine).total, TRAIL_HALO_TICKS);
  assert.equal(perseveranceHaloTicks(alcohol).completed, 10);
  assert.equal(perseveranceHaloTicks(waiting).completed, 0);
  const active: ExpeditionNode = {
    id: "cocaine",
    route: "perseverance",
    status: "active_use",
    completed: null,
    total: 10,
    href: "/preview/recovery?substance=cocaine",
    substanceId: "cocaine",
  };
  assert.equal(perseveranceHaloTicks(active).completed, 0);
});

test("neuroscience overlay is one combined path, not two independent dashes", () => {
  assert.equal((NEUROSCIENCE_TRAIL_D.match(/M /g) ?? []).length, 1);
  assert.match(trailSource, /NEUROSCIENCE_TRAIL_D/);
  assert.equal((trailSource.match(/d=\{NEUROSCIENCE_TRAIL_D\}/g) ?? []).length, 1);
  assert.match(trailSource, /NEUROSCIENCE_LIGHT_SRC/);
  assert.match(trailSource, /PROCESSES_LIGHT_SRC/);
  assert.equal(trailSource.includes("#e8c35a"), false);
  assert.match(trailSource, /mix-blend-screen/);
  assert.match(trailSource, /maskUnits="userSpaceOnUse"/);
});

test("layout stays on the 1672×941 gold and never cuts tree-to-valley", () => {
  assert.equal(TRAIL_VIEWBOX_WIDTH, 1672);
  assert.equal(TRAIL_VIEWBOX_HEIGHT, 941);
  assert.equal(layoutSource.includes("540 470"), false);
  assert.equal(layoutSource.includes("C 620 340"), false);
  assert.match(NEUROSCIENCE_TRAIL_D, /274 406/);
  assert.match(NEUROSCIENCE_TRAIL_D, /654 280/);
  assert.match(NEUROSCIENCE_TRAIL_D, /160 449/);
  assert.match(PROCESSES_TRAIL_D, /1235 610/);
  assert.equal(NEUROSCIENCE_TRAIL_D.includes("975 561"), false);
  assert.equal(NEUROSCIENCE_TRAIL_D.includes("1235 610"), false);
});

test("overlay is decorative and reduced-motion safe; no cyan road", () => {
  assert.match(trailSource, /aria-hidden="true"/);
  assert.match(trailSource, /pointer-events-none/);
  assert.match(trailSource, /motion-reduce:transition-none/);
  assert.match(mapSource, /ExpeditionTrail/);
  assert.match(trailSource, /strokeDasharray/);
  assert.match(trailSource, /fill <= 0/);
  assert.equal(mapSource.includes("strokeDasharray"), false);
  assert.equal(layoutSource.toLowerCase().includes("cyan"), false);
  assert.equal(layoutSource.includes("PERSEVERANCE_TRAIL"), false);
  assert.equal(NEUROSCIENCE_TRAIL_D.includes("1235 610"), false);
  assert.match(layoutSource, /trail-neuro-light\.webp/);
  assert.match(layoutSource, /trail-processes-light\.webp/);
  assert.equal(layoutSource.includes("trail-neuro-light.png"), false);
  assert.equal(layoutSource.includes("trail-processes-light.png"), false);
  assert.equal(existsSync(join(expeditionImages, "trail-neuro-light.webp")), true);
  assert.equal(existsSync(join(expeditionImages, "trail-processes-light.webp")), true);
  assert.equal(existsSync(join(expeditionImages, "trail-neuro-light.png")), true);
  assert.equal(existsSync(join(expeditionImages, "trail-processes-light.png")), true);
});
