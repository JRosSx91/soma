export type Neurotransmitter =
  | 'dopamine'
  | 'serotonin'
  | 'gaba'
  | 'glutamate'
  | 'acetylcholine'
  | 'norepinephrine'
  | 'endocannabinoid'
  | 'endorphin'
  | 'adenosine';

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

/** @deprecated — usar ComposedNTState. Mantenido hasta migración completa. */
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

export interface NTSource {
  substanceId: string;
  mechanismKey: string | null;
  phase: WithdrawalPhase;
  direction: NeurotransmitterDirection;
  severity: NeurotransmitterSeverity;
  symptomKey: string;
  daysSinceLastUse: number;
  confidenceLevel: ConfidenceLevel;
}

export interface ComposedNTState {
  neurotransmitter: Neurotransmitter;
  organId: string;
  resultingSeverity: NeurotransmitterSeverity;
  resultingDirection: NeurotransmitterDirection;
  resultingSymptomKey: string;
  confidenceLevel: ConfidenceLevel;
  sources: NTSource[];
}