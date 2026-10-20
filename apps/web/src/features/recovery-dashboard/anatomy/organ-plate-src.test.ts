import assert from "node:assert/strict";
import { test } from "node:test";
import type { AtlasSystem } from "./atlas-types.ts";
import { organPlateSrc } from "./organ-plate-src.ts";

test("hippocampus, testes and ovaries resolve their own plates", () => {
  assert.equal(organPlateSrc("brain-hippocampus"), "/images/anatomy/hippocampus.png");
  assert.equal(organPlateSrc("testes"), "/images/anatomy/testes.png");
  assert.equal(organPlateSrc("ovaries"), "/images/anatomy/ovaries.png");
});

test("unknown organ id does not borrow another plate", () => {
  assert.equal(organPlateSrc("not-an-organ"), null);
  assert.equal(organPlateSrc("dopamine"), null);
  assert.equal(organPlateSrc("brain"), null);
});

test("organ without a plate returns null instead of another organ", () => {
  const systems: readonly AtlasSystem[] = [
    {
      id: "hepatic",
      catalogSystem: "hepatic",
      name: "Sistema hepático",
      plates: { anterior: null, posterior: null },
      organs: [
        {
          id: "liver",
          name: "Hígado",
          plate: null,
          regions: { anterior: null, posterior: null },
        },
      ],
    },
  ];
  assert.equal(organPlateSrc("liver", systems), null);
  assert.equal(organPlateSrc("testes", systems), null);
});
