/**
 * SERVER-ONLY reading-check keys (GAM-02B.1).
 * Not a Nest module. Do not import from the web app.
 */

import type { MissionId } from "@soma/shared-types";

export const MISSION_CORRECT_OPTION_ID = {
  "edu-dopamine-01": "wanting",
  "edu-serotonin-01": "many_systems",
  "edu-gaba-01": "network_brake",
  "edu-receptors-01": "occupancy",
  "edu-tolerance-01": "sensitivity",
  "edu-neuroadaptation-01": "plasticity",
  "edu-dependence-01": "not_disorder",
  "edu-metabolism-01": "not_reset",
  "edu-glutamate-01": "favours_transmission",
  "edu-norepinephrine-01": "not_blood_map",
  "edu-acetylcholine-01": "mimic_some",
  "edu-adenosine-01": "antagonist",
  "edu-endorphin-01": "own_peptides",
  "edu-endocannabinoid-01": "not_the_ligands",
  "edu-unpublished-01": "wanting",
} as const satisfies Record<MissionId, string>;
