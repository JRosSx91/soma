import assert from "node:assert/strict";
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

test("every atlas organ belongs to the catalog and appears once", () => {
  const ids = atlasSystems.flatMap((system) => system.organs.map((organ) => organ.id));
  assert.deepEqual([...ids].sort(), [...catalogOrganIds].sort());
  assert.equal(new Set(ids).size, ids.length);
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
  assert.equal(
    atlasSystems.find((system) => system.id === "cardiovascular")?.plates.anterior?.src,
    "/images/anatomy/heart.png",
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
