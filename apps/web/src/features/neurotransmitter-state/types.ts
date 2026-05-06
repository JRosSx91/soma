/**
 * Neurotransmitter state types for the frontend.
 *
 * Mirrors the response shape of GET /me/neurotransmitter-state
 * from the backend. Kept in the frontend rather than imported from
 * @soma/shared-types because these enums are tied to backend Prisma
 * enums; if we eventually unify, we'll move them.
 */

export type Neurotransmitter =
  | 'dopamine'
  | 'serotonin'
  | 'gaba'
  | 'glutamate'
  | 'acetylcholine'
  | 'norepinephrine'
  | 'endocannabinoid'
  | 'endorphin';

export type WithdrawalPhase =
  | 'during_use'
  | 'acute_withdrawal'
  | 'post_acute'
  | 'normalizing';

export type NeurotransmitterDirection =
  | 'depleted'
  | 'elevated'
  | 'oscillating'
  | 'normalizing';

export type NeurotransmitterSeverity =
  | 'severe'
  | 'moderate'
  | 'mild'
  | 'normalizing';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface NeurotransmitterStateEntry {
  neurotransmitter: Neurotransmitter;
  organId: string;
  phase: WithdrawalPhase;
  direction: NeurotransmitterDirection;
  severity: NeurotransmitterSeverity;
  symptomKey: string;
  daysSinceLastUse: number;
  sourceSubstanceId: string;
  confidenceLevel: ConfidenceLevel;
}