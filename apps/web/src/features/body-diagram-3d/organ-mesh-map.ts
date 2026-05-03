import type { OrganId } from '@soma/shared-types';

/**
 * Mapping from Soma's OrganId (backend domain) to mesh name in
 * the glTF file (apps/web/public/models/body_male.glb).
 *
 * Most mappings are 1:1 with snake_case substitution. Two domain
 * entities (`brain-vta` and `brain-nucleus-accumbens`) collapse onto
 * the same mesh in v1 — the visual "reward circuit" — as documented
 * in `docs/blender-prep.md`.
 *
 * Some OrganIds intentionally have no mesh:
 *   - `brain-nucleus-accumbens`: collapsed onto brain_vta_accumbens.
 *   - (Future) `ovaries`: not in the male model.
 */
export const ORGAN_TO_MESH_NAME: Record<OrganId, string | null> = {
  liver: 'liver',
  heart: 'heart',
  lungs: 'lungs',
  bronchi: 'bronchi',
  kidneys: 'kidneys',
  stomach: 'stomach',
  pancreas: 'pancreas',
  'brain-prefrontal-cortex': 'brain_prefrontal_cortex',
  'brain-hippocampus': 'brain_hippocampus',
  'brain-vta': 'brain_vta_accumbens',
  'brain-nucleus-accumbens': 'brain_vta_accumbens',
  'brain-amygdala': 'brain_amygdala',
  skin: 'skin',
  testes: 'testes',
  ovaries: null,
};

/**
 * Reverse lookup: given a mesh name from the glTF, returns all
 * OrganIds that map to it. Used in raycasting (we hit a mesh, we
 * need to know which domain entity that represents).
 *
 * Note that one mesh can map to multiple OrganIds. For interactivity
 * v1 we use the first match — the user can't distinguish VTA from
 * accumbens visually anyway since they share a mesh.
 */
export const MESH_NAME_TO_ORGAN: Map<string, OrganId> = new Map(
  Object.entries(ORGAN_TO_MESH_NAME)
    .filter(([, mesh]) => mesh !== null)
    .map(([organId, mesh]) => [mesh as string, organId as OrganId]),
);