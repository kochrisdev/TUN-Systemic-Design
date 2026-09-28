'use client';
import { ControlAction, type ControlActionProps } from './ControlAction.js';
import { interventionLabels, interventionCompletionLabels, type InterventionOperation } from './supervision-contracts.js';
export interface HumanOverrideProps extends Omit<ControlActionProps, 'operation' | 'family' | 'title' | 'requestLabel' | 'completedLabel'> { operation: InterventionOperation; title?: string }
export function HumanOverride({ title = 'Human override', ...props }: HumanOverrideProps) {
  return <ControlAction {...props} family="intervention" title={title}
    requestLabel={interventionLabels[props.operation.kind] ?? 'Request unavailable'}
    completedLabel={interventionCompletionLabels[props.operation.kind] ?? 'Outcome not verified'} />;
}
