/** Evidence and memory presentation contracts; never authority, storage policy, or proof. */
export type MemoryType = 'M0' | 'M1' | 'M2' | 'M3';
export type MemoryState = 'active' | 'inactive' | 'unavailable';
export interface MemoryRecord {
  readonly id: string;
  readonly version: string;
  readonly type: MemoryType;
  readonly state: MemoryState;
  readonly scope: string;
  /** Explain actual influence, not merely information available to the application. */
  readonly influence?: string;
  readonly retentionNotice?: string;
}
/** Navigation to a host-owned inspection surface only; no mutation or permission grant. */
export interface MemoryInspectionRequest { readonly memoryId: string; readonly memoryVersion: string }
export const memoryTypeLabels: Record<MemoryType, string> = {
  M0: 'No AI memory', M1: 'Session context', M2: 'User-controlled persistent memory', M3: 'Operational memory',
};
export type EvidenceAccess = 'available' | 'unavailable' | 'restricted';
export type EvidenceRelationship = 'supports' | 'contradicts' | 'background';
export interface EvidenceExcerpt {
  readonly kind: 'quote' | 'paraphrase' | 'generated';
  readonly text: string;
  readonly location?: string;
}
interface EvidenceSourceBase {
  readonly id: string;
  /** Only supply source identity/metadata the viewer is permitted to see. */
  readonly title: string;
  readonly kind: string;
  readonly relationship: EvidenceRelationship;
  readonly relationshipExplanation: string;
}
export type EvidenceSource = EvidenceSourceBase & (
  | { readonly access: 'available'; readonly excerpt?: EvidenceExcerpt; readonly url?: string;
      readonly observedAt?: string;
      readonly verification: { readonly state: 'verified' | 'unverified'; readonly detail: string } }
  | { readonly access: 'unavailable' | 'restricted'; readonly reason: string }
);
export interface EvidenceCollection {
  readonly id: string;
  readonly version: string;
  readonly claim: string;
  readonly sources: readonly EvidenceSource[];
}
export type EvidenceState = 'verified' | 'partial' | 'conflicting' | 'unavailable';
export const evidenceStateLabels: Record<EvidenceState, string> = {
  verified: 'Evidence checked — application reported', partial: 'Partial evidence',
  conflicting: 'Conflicting evidence', unavailable: 'Evidence unavailable',
};
export const evidenceRelationshipLabels: Record<EvidenceRelationship, string> = {
  supports: 'Supports this claim', contradicts: 'Contradicts this claim', background: 'Background only',
};
export type UncertaintyLevel = 'U0' | 'U1' | 'U2' | 'U3';
export interface UncertaintyAssessment {
  readonly scope: string;
  readonly level: UncertaintyLevel;
  readonly explanation: string;
  /** Required for U0–U2; never a numeric probability or a model's unsupported self-rating. */
  readonly basis?: string;
  readonly nextStep?: string;
}
export const uncertaintyLabels: Record<UncertaintyLevel, string> = {
  U0: 'Confirmed within stated scope', U1: 'High confidence within stated scope',
  U2: 'Inferred', U3: 'Unknown',
};
const hasText = (value: unknown): value is string => typeof value === 'string' && Boolean(value.trim());
/** Bounded checks for typed metadata, not a complete untrusted-JSON validator. */
export function memoryIssues(memory: MemoryRecord): string[] {
  const issues: string[] = [];
  if (![memory.id, memory.version, memory.scope].every(hasText)) issues.push('Memory identity, version, and scope are required.');
  if (!Object.hasOwn(memoryTypeLabels, memory.type) || !['active', 'inactive', 'unavailable'].includes(memory.state)) issues.push('Memory classification is unavailable.');
  if (memory.type === 'M0' && memory.state === 'active') issues.push('No-memory mode cannot report active memory.');
  if (memory.state === 'active' && !hasText(memory.influence)) issues.push('Active memory needs an explanation of its influence.');
  return issues;
}
export function memoryIsInspectable(memory: MemoryRecord): boolean {
  return memoryIssues(memory).length === 0 && memory.type !== 'M0' && memory.state === 'active';
}
export function memoryStatusLabel(memory: MemoryRecord): string {
  if (memoryIssues(memory).length || memory.state === 'unavailable') return 'Memory unavailable';
  if (memory.type === 'M0') return 'No AI memory used for this task';
  return `${memoryTypeLabels[memory.type]} — ${memory.state === 'active' ? 'in use' : 'not used for this task'}`;
}
export function evidenceIssues(evidence: EvidenceCollection): string[] {
  const issues: string[] = [];
  if (![evidence.id, evidence.version, evidence.claim].every(hasText)) issues.push('Evidence identity, version, and claim are required.');
  if (new Set(evidence.sources.map(source => source.id)).size !== evidence.sources.length) issues.push('Source identifiers must be unique.');
  for (const source of evidence.sources) {
    if (![source.id, source.title, source.kind, source.relationshipExplanation].every(hasText)) issues.push('Source identity and relationship explanations are required.');
    if (!Object.hasOwn(evidenceRelationshipLabels, source.relationship) || !['available', 'unavailable', 'restricted'].includes(source.access)) issues.push('Source classification is invalid.');
    if (source.access === 'available') {
      if (!source.verification || !['verified', 'unverified'].includes(source.verification.state)) issues.push('Source check metadata is invalid.');
      if (source.verification?.state === 'verified' && !hasText(source.verification.detail)) issues.push('A reported source check needs a description.');
      if (source.excerpt && (!['quote', 'paraphrase', 'generated'].includes(source.excerpt.kind) || !hasText(source.excerpt.text))) issues.push('Excerpt kind and text must be explicit.');
    } else if (!hasText(source.reason)) issues.push('Unavailable sources need an explanation.');
  }
  return [...new Set(issues)];
}
export function sourceHasReportedCheck(source: EvidenceSource): boolean {
  return source.access === 'available' && source.verification?.state === 'verified' &&
    hasText(source.verification.detail) && Boolean(source.excerpt && hasText(source.excerpt.text) &&
    ['quote', 'paraphrase'].includes(source.excerpt.kind));
}
/** This is a display summary, not an independent truth assessment. */
export function evidenceState(evidence: EvidenceCollection): EvidenceState {
  if (!evidence.sources.some(source => source.access === 'available')) return 'unavailable';
  // Preserve declared contrary evidence even if that particular source cannot now be opened.
  if (evidence.sources.some(source => source.relationship === 'contradicts')) return 'conflicting';
  if (evidenceIssues(evidence).length || !evidence.sources.some(source => source.relationship === 'supports') ||
      !evidence.sources.every(sourceHasReportedCheck)) return 'partial';
  return 'verified';
}
export function uncertaintyIssues(assessment: UncertaintyAssessment): string[] {
  const issues: string[] = [];
  if (!Object.hasOwn(uncertaintyLabels, assessment.level)) issues.push('Uncertainty classification is unavailable.');
  if (![assessment.scope, assessment.explanation].every(hasText)) issues.push('An uncertainty assessment needs scope and explanation.');
  if (assessment.level !== 'U3' && !hasText(assessment.basis)) issues.push('A supporting basis is required before showing this level.');
  return issues;
}
export function effectiveUncertaintyLevel(assessment: UncertaintyAssessment): UncertaintyLevel {
  return uncertaintyIssues(assessment).length ? 'U3' : assessment.level;
}
