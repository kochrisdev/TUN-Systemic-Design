'use client';
import { ControlAction, type ControlActionProps } from './ControlAction.js';
import { recoveryActionLabels, recoveryCompletionLabels, type RecoveryOperation } from './supervision-contracts.js';
export interface RecoveryControlProps extends Omit<ControlActionProps, 'operation' | 'family' | 'title' | 'requestLabel' | 'completedLabel'> { operation: RecoveryOperation; title?: string }
export function RecoveryControl({ title = 'Recovery control', ...props }: RecoveryControlProps) {
  return <ControlAction {...props} family="recovery" title={title}
    requestLabel={recoveryActionLabels[props.operation.kind] ?? 'Request unavailable'}
    completedLabel={recoveryCompletionLabels[props.operation.kind] ?? 'Outcome not verified'} />;
}
