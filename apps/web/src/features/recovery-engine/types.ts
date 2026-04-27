import type { RecoveryCurveShape } from '@soma/shared-types';

export interface RecoveryInput {
  shape: RecoveryCurveShape;
  daysTo95Recovery: number;
  recoveryCeiling: number;
  lastUseDate: string;
}

export interface RecoveryOutput {
  daysAbstinent: number;
  progressFraction: number;
  absoluteRecovery: number;
}