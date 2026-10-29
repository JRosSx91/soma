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
} as const satisfies Record<MissionId, string>;
