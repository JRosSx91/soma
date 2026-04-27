# Blender preparation — Z-Anatomy → Soma

This document records the exploration of Z-Anatomy as the source of the
3D anatomical model for Soma's `BodyDiagram3D`, and the decisions taken
during initial inventory.

## Source

- **Repository**: https://github.com/Z-Anatomy/Models-of-human-anatomy
- **License**: CC-BY-SA 4.0 (Z-Anatomy) and CC-BY-SA 2.1 Japan (BodyParts3D, original models).
- **Scope**: human male anatomical atlas. Female model not included.
- **Distribution**: Blender Application Template via `Z-Anatomy.zip`.
- **Blender version used for inventory**: 5.1.1.

## Top-level scene structure

Z-Anatomy organizes the body into nine numbered collections:

1. Skeletal system
2. Muscular insertions
3. Joints
4. Muscular system (~60,000 objects)
5. Cardiovascular system
6. Lymphoid organs
7. Nervous system & Sense organs
8. Visceral systems
9. Regions of human body

Total scene size makes whole-file export non-viable. Soma uses a
selective extraction approach: only the meshes mapped below are
duplicated into an export collection prior to glTF export.

## Organ mapping (Soma → Z-Anatomy)

### Exact mappings (9 organs)

These have a direct, unambiguous mesh in the Z-Anatomy hierarchy:

| Soma OrganId | Z-Anatomy path |
|---|---|
| `liver` | `8 → Visceral systems.g → Digestive system.g → Liver` |
| `heart` | `5 → Arterial system.g → Heart.g` |
| `lungs` | `8 → Visceral systems.g → Respiratory system.g → Lungs.g` |
| `bronchi` | `8 → Visceral systems.g → Respiratory system.g → Tracheobronchial tree.g → Bronchi.g` |
| `kidneys` | `8 → Visceral systems.g → Urinary system.g → Kidney.l + Kidney.r` |
| `stomach` | `8 → Visceral systems.g → Digestive system.g → Digestive canal.g → Stomach` |
| `pancreas` | `8 → Visceral systems.g → Digestive system.g → Pancreas` |
| `brain-amygdala` | `7 → Brain.g → Cerebrum.g → Telencephalon.g → Basal forebrain.g → Amygdaloid body.l + .r` |
| `brain-hippocampus` | `7 → Brain.g → Cerebrum.g → Telencephalon.g → Limbic lobe.g → Hippocampus.l + .r` |
| `testes` | `8 → Genital systems.g → Male genital system.g → Male internal genitalia.g → Testis.l + .r` |
| `skin` | `9 → Regions of human body.g (excluding Hairs.g)` |

### Approximate mappings (2 organs)

These exist in Soma's domain model but Z-Anatomy does not provide them
as isolated meshes. We map to the smallest available containing region
and document the approximation:

| Soma OrganId | Z-Anatomy mesh used | Reason |
|---|---|---|
| `brain-prefrontal-cortex` | `Frontal lobe.g` (whole frontal lobe) | Z-Anatomy does not subdivide the frontal lobe into prefrontal/motor/premotor regions. |
| `brain-vta` | `Tegmentum of midbrain.g` (whole tegmentum) | The ventral tegmental area is a functional region defined by neuron type and projection, not by a discrete anatomical capsule. Atlases of the whole body rarely isolate it. |

### Unmapped (2 organs)

These exist in Soma's domain model but have no mesh in Z-Anatomy:

| Soma OrganId | Status | Plan |
|---|---|---|
| `brain-nucleus-accumbens` | Not modeled. Z-Anatomy includes only the dorsal striatum (caudate + putamen). | Collapse with `brain-vta` for v1. Both share identical recovery curves per substance, and together form the mesolimbic axis. Backend keeps them separate; frontend renders them as a single "reward circuit" node mapped to `Tegmentum of midbrain.g`. |
| `ovaries` | Z-Anatomy is a male-only model. | Female anatomical coverage is out of scope for PR 6. A future PR will source a female model (BodyParts3D or alternative) and add `BodyDiagram3DFemale` as a sibling component. |

## Naming convention for export

Meshes will be renamed to match Soma's `OrganId` using snake_case
(Blender tolerates dashes but underscore is safer for export pipelines):
liver
heart
lungs
bronchi
kidneys
stomach
pancreas
brain_amygdala
brain_hippocampus
brain_prefrontal_cortex
brain_vta_accumbens
testes

Note `brain_vta_accumbens` reflects the v1 collapse of those two
domain entities into a single visual node.

## Pre-export processing (per organ)

For each mapped organ, the export prep pipeline is:

1. **Locate** the mesh(es) in the Z-Anatomy outliner.
2. **Duplicate** them into a new collection `Soma_export`.
3. **Join** all sub-meshes of an organ into a single mesh
   (e.g. left + right hemispheres of hippocampus → one `brain_hippocampus`).
4. **Rename** the joined mesh to the snake_case OrganId.
5. **Apply transforms** (Object → Apply → All Transforms) to bake any
   inherited rotations/scales into the geometry. This avoids
   inconsistent orientations after glTF export.

## Export

- Format: glTF 2.0 binary (`.glb`).
- Scope: only the `Soma_export` collection.
- Destination: `apps/web/public/models/body_male.glb`.
- File size threshold: target < 20 MB. If exceeded, evaluate Git LFS.

## Verification

After export, the `.glb` is inspected with an external viewer
(https://gltf-viewer.donmccurdy.com/) to confirm:

- All 12 named meshes are present.
- Names match the convention exactly.
- No extraneous geometry leaked into the export.

## Followups

- Female anatomical model (PR after 6).
- Manual subdivision of frontal lobe to isolate prefrontal cortex
  (likely a small dedicated PR with neuroanatomical references).
- Manual modeling or sourcing of nucleus accumbens.

## Export

The 13 prepared meshes were exported to glTF 2.0 binary as
`apps/web/public/models/body_male.glb`.

- File size: 7 MB.
- Triangles: 312,464.
- Vertices: 185,471.
- Materials: original Z-Anatomy materials preserved as material slots
  but will be overridden in Three.js at runtime per-mesh based on
  recovery state.
- Verified in donmccurdy gltf-viewer and Babylon.js sandbox: all 13
  named meshes present, anatomically positioned correctly.