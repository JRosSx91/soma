import type { ConfidenceLevel } from './evidence.js';

export type { ConfidenceLevel };
export type NeurotransmitterSeverity = 'severe' | 'moderate' | 'mild' | 'normalizing';
export type NeurotransmitterDirection = 'depleted' | 'elevated' | 'oscillating' | 'normalizing';
export type WithdrawalPhase = 'during_use' | 'acute_withdrawal' | 'post_acute' | 'normalizing';

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
  neurotransmitter: string;
  organId: string;
  resultingSeverity: NeurotransmitterSeverity;
  resultingDirection: NeurotransmitterDirection;
  resultingSymptomKey: string;
  confidenceLevel: ConfidenceLevel;
  sources: NTSource[];
}