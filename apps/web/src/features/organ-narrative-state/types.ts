export type WithdrawalPhase =
  | 'during_use'
  | 'acute_withdrawal'
  | 'post_acute'
  | 'normalizing';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface OrganNarrativeStateEntry {
  organId: string;
  sourceSubstanceId: string;
  phase: WithdrawalPhase;
  narrativeKey: string;
  daysSinceLastUse: number;
  confidenceLevel: ConfidenceLevel;
}