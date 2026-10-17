import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { atlasSystems, bodyAtlasView, unboundAnatomyFiles } from "./atlas-config.ts";

const catalogOrganIds = [
  "liver",
  "heart",
  "lungs",
  "bronchi",
  "kidneys",
  "stomach",
  "pancreas",
  "brain-prefrontal-cortex",
  "brain-hippocampus",
  "brain-vta",
  "brain-nucleus-accumbens",
  "brain-amygdala",
  "skin",
  "testes",
  "ovaries",
  "intestines",
  "spleen",
  "oral-mucosa",
  "nasal-mucosa",
  "teeth",
  "eyes",
] as const;

const catalogSystemIds = [
  "nervous-central",
  "cardiovascular",
  "respiratory",
  "digestive",
  "hepatic",
  "renal",
  "immune",
  "reproductive",
  "integumentary",
  "sensory",
  "endocrine",
  "nervous-peripheral",
] as const;

/** Bound full-body system plates that must exist on disk. */
const expectedSystemPlates: Record<(typeof catalogSystemIds)[number], string | null> = {
  "nervous-central": "/images/anatomy/system-central-nervous.png",
  cardiovascular: "/images/anatomy/system-cardiovascular.png",
  respiratory: "/images/anatomy/respiratory-highlight-anterior.png",
  digestive: "/images/anatomy/system-digestive.png",
  hepatic: "/images/anatomy/system-hepatic.png",
  renal: "/images/anatomy/system-renal.png",
  immune: "/images/anatomy/system-immune.png",
  reproductive: "/images/anatomy/system-reproductive.png",
  integumentary: "/images/anatomy/system-integumentary.png",
  sensory: "/images/anatomy/system-sensory.png",
  endocrine: "/images/anatomy/system-endocrine.png",
  "nervous-peripheral": "/images/anatomy/system-peripheral-nervous.png",
};

const anatomyPublicDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../public/images/anatomy",
);

function publicPathFromSrc(src: string): string {
  return join(anatomyPublicDir, src.replace("/images/anatomy/", ""));
}

test("every atlas organ belongs to the catalog and appears once", () => {
  const ids = atlasSystems.flatMap((system) => system.organs.map((organ) => organ.id));
  assert.deepEqual([...ids].sort(), [...catalogOrganIds].sort());
  assert.equal(new Set(ids).size, ids.length);
});

test("the twelve catalog systems keep their real ids and plate bindings", () => {
  assert.deepEqual(
    atlasSystems.map((system) => system.id),
    [...catalogSystemIds],
  );
  assert.deepEqual(
    atlasSystems.map((system) => system.catalogSystem),
    [...catalogSystemIds],
  );
  for (const system of atlasSystems) {
    const expected = expectedSystemPlates[system.id as (typeof catalogSystemIds)[number]];
    assert.equal(system.plates.anterior?.src ?? null, expected);
    assert.equal(system.plates.posterior, null);
    if (expected) {
      assert.equal(system.plates.anterior?.aspectRatio, "1024 / 1536");
      assert.equal(existsSync(publicPathFromSrc(expected)), true);
    }
  }
});

test("bound atlas plates never point at missing files", () => {
  const sources = atlasSystems.flatMap((system) => [
    system.plates.anterior?.src,
    system.plates.posterior?.src,
    ...system.organs.map((organ) => organ.plate?.src),
  ]);
  sources.push(bodyAtlasView.plates.anterior?.src, bodyAtlasView.plates.posterior?.src);
  for (const src of sources) {
    if (!src) continue;
    assert.equal(existsSync(publicPathFromSrc(src)), true, `missing file for ${src}`);
  }
});

test("immune uses system-immune.png and no lymphatic leftover", () => {
  const immune = atlasSystems.find((system) => system.id === "immune");
  assert.ok(immune);
  assert.equal(immune.plates.anterior?.src, "/images/anatomy/system-immune.png");
  assert.equal(immune.plates.anterior?.aspectRatio, "1024 / 1536");
  assert.equal(existsSync(join(anatomyPublicDir, "system-immune.png")), true);
  assert.equal(existsSync(join(anatomyPublicDir, "system-lymphatic.png")), false);
  assert.equal(
    atlasSystems.some((system) =>
      [system.plates.anterior?.src, system.plates.posterior?.src].some((src) =>
        src?.includes("lymphatic"),
      ),
    ),
    false,
  );
  assert.equal(
    unboundAnatomyFiles.some((file) => file.src.includes("lymphatic")),
    false,
  );
});

test("respiratory system uses the full highlight and lungs keep their own plate", () => {
  const respiratory = atlasSystems.find((system) => system.id === "respiratory");
  assert.ok(respiratory);
  assert.deepEqual(
    respiratory.organs.map((organ) => organ.id),
    ["lungs", "bronchi", "nasal-mucosa"],
  );
  assert.equal(
    respiratory.plates.anterior?.src,
    "/images/anatomy/respiratory-highlight-anterior.png",
  );
  assert.equal(respiratory.plates.anterior?.aspectRatio, "1024 / 1536");
  assert.equal(respiratory.plates.posterior, null);
  for (const organ of respiratory.organs) {
    assert.equal(organ.regions.anterior, null);
    assert.equal(organ.regions.posterior, null);
  }
  assert.equal(respiratory.organs[0]?.plate?.src, "/images/anatomy/lungs.png");
  assert.equal(respiratory.organs[1]?.plate?.src, "/images/anatomy/bronchi.png");
  assert.equal(respiratory.organs[2]?.plate?.src, "/images/anatomy/nasal-mucosa.png");
  assert.equal(
    atlasSystems.some((system) =>
      [system.plates.anterior?.src, system.plates.posterior?.src].some((src) =>
        src?.includes("global-fit"),
      ),
    ),
    false,
  );
});

test("bronchi and nasal mucosa keep their own plate paths", () => {
  const respiratory = atlasSystems.find((system) => system.id === "respiratory");
  assert.ok(respiratory);
  const plateSrc = (id: string) => respiratory.organs.find((organ) => organ.id === id)?.plate?.src;
  assert.equal(plateSrc("bronchi"), "/images/anatomy/bronchi.png");
  assert.equal(plateSrc("nasal-mucosa"), "/images/anatomy/nasal-mucosa.png");
  assert.equal(plateSrc("lungs"), "/images/anatomy/lungs.png");
  assert.equal(
    respiratory.plates.anterior?.src,
    "/images/anatomy/respiratory-highlight-anterior.png",
  );
});

test("organ plates remain available when drilling from system to organ", () => {
  const cardiovascular = atlasSystems.find((system) => system.id === "cardiovascular");
  assert.ok(cardiovascular);
  assert.equal(cardiovascular.plates.anterior?.src, "/images/anatomy/system-cardiovascular.png");
  assert.equal(cardiovascular.organs[0]?.plate?.src, "/images/anatomy/heart.png");

  const hepatic = atlasSystems.find((system) => system.id === "hepatic");
  assert.ok(hepatic);
  assert.equal(hepatic.plates.anterior?.src, "/images/anatomy/system-hepatic.png");
  assert.equal(hepatic.organs[0]?.plate?.src, "/images/anatomy/liver.png");

  const renal = atlasSystems.find((system) => system.id === "renal");
  assert.ok(renal);
  assert.equal(renal.plates.anterior?.src, "/images/anatomy/system-renal.png");
  assert.equal(renal.organs[0]?.plate?.src, "/images/anatomy/kidneys.png");
});

test("the body view uses the anterior master plate and no hit regions", () => {
  assert.equal(bodyAtlasView.plates.anterior?.src, "/images/anatomy/body-master-anterior.png");
  assert.equal(bodyAtlasView.plates.anterior?.aspectRatio, "1024 / 1536");
  assert.equal(bodyAtlasView.plates.posterior, null);
  assert.equal(
    atlasSystems.every((system) => system.organs.every((organ) => organ.regions.anterior === null)),
    true,
  );
});

test("mixed or non-catalog plates stay unbound", () => {
  const bound = new Set(
    atlasSystems.flatMap((system) => [
      system.plates.anterior?.src,
      system.plates.posterior?.src,
      ...system.organs.map((organ) => organ.plate?.src),
    ]),
  );
  for (const file of unboundAnatomyFiles) {
    assert.equal(bound.has(file.src), false);
  }
  assert.equal(
    atlasSystems.some((system) => system.organs.some((organ) => organ.name === "Tiroides")),
    false,
  );
});
