import test from 'node:test';
import assert from 'node:assert/strict';
import { contextState, effectivePlanStatus, effectivePlanStepStatus, planFingerprint, planIssues,
  proposalFingerprint, proposalBlockReason, reviewBasisMatches } from '../packages/react/dist/contracts.js';
const source = { id: 'notes', label: 'Notes', kind: 'note', scope: 'Task', persistence: 'session', provenance: 'provided', availability: 'available', usage: 'not-used' };
const context = { id: 'context', version: '1', scope: 'Task', sources: [source] };
const plan = { id: 'plan', version: '1', context: { id: 'context', version: '1' }, objective: 'Draft update', status: 'proposed', expectedOutputs: ['Draft'],
  steps: [{ id: 'read', title: 'Read notes', detail: 'Read the permitted note.', status: 'pending' },
    { id: 'send', title: 'Send', detail: 'Wait for separate approval.', status: 'waiting-approval', dependsOn: ['read'], approvalRequired: true }] };
const proposal = { id: 'p', version: '1', action: 'Send update', actor: { id: 'a', name: 'Agent', type: 'agent' }, target: 'Workspace', effect: 'Send once.', authority: 'One send.', consequence: 'C3',
  recovery: { kind: 'irreversible', description: 'Recipients may retain copies.' }, reviewBasis: { context: plan.context, plan: { id: plan.id, version: plan.version } }, contentPreview: 'The exact reviewed text.' };
test('all sources available does not require them to be used', () => assert.equal(contextState(context), 'Active context'));
test('no sources is no context', () => assert.equal(contextState({ ...context, sources: [] }), 'No context'));
for (const [availability, label] of [['restricted', 'Restricted context'], ['missing', 'Missing context'], ['stale', 'Partial context']]) {
  test(`context state ${availability}`, () => assert.equal(contextState({ ...context, sources: [{ ...source, availability }] }), label));
}
test('mixed source availability is partial', () => assert.equal(contextState({ ...context, sources: [source, { ...source, id: 'b', availability: 'restricted' }] }), 'Partial context'));
test('valid plan has no structural issues', () => assert.deepEqual(planIssues(plan), []));
test('duplicate identifiers are invalid', () => assert.match(planIssues({ ...plan, steps: [plan.steps[0], plan.steps[0]] }).join(), /unique/));
test('missing dependencies are visible', () => assert.match(planIssues({ ...plan, steps: [{ ...plan.steps[0], dependsOn: ['absent'] }] }).join(), /unknown step/));
test('cyclic dependencies are invalid', () => assert.match(planIssues({ ...plan, steps: [{ ...plan.steps[0], dependsOn: ['send'] }, plan.steps[1]] }).join(), /cycle/));
test('self dependency is invalid', () => assert.match(planIssues({ ...plan, steps: [{ ...plan.steps[0], dependsOn: ['read'] }] }).join(), /cycle/));
test('changed plan must describe its change', () => assert.match(planIssues({ ...plan, status: 'changed' }).join(), /change summary/));
test('empty expected outputs are invalid', () => assert.match(planIssues({ ...plan, expectedOutputs: [] }).join(), /outputs/));
test('unverified completed step is downgraded', () => assert.equal(effectivePlanStepStatus({ ...plan.steps[0], status: 'completed' }), 'unverified'));
test('verified completed step remains completed', () => assert.equal(effectivePlanStepStatus({ ...plan.steps[0], status: 'completed', completionEvidence: 'Readback' }), 'completed'));
test('completed plan without evidence is downgraded', () => assert.equal(effectivePlanStatus({ ...plan, status: 'completed' }), 'unverified'));
test('completed plan with pending steps is downgraded', () => assert.equal(effectivePlanStatus({ ...plan, status: 'completed', completionEvidence: 'Claimed done' }), 'unverified'));
test('complete plan requires all completed step evidence', () => assert.equal(effectivePlanStatus({ ...plan, status: 'completed', completionEvidence: 'Output readback', steps: plan.steps.map(s => ({ ...s, status: 'completed', completionEvidence: 'Observed' })) }), 'completed'));
test('material plan content changes its fingerprint', () => assert.notEqual(planFingerprint(plan), planFingerprint({ ...plan, objective: 'Delete notes' })));
test('progress alone does not change material plan fingerprint', () => assert.equal(planFingerprint(plan), planFingerprint({ ...plan, status: 'in-progress', steps: plan.steps.map(s => ({ ...s, status: 'completed', completionEvidence: 'Observed' })) })));
test('current review basis matches', () => assert.equal(reviewBasisMatches(proposal, context, plan), true));
test('missing basis does not match', () => assert.equal(reviewBasisMatches({ ...proposal, reviewBasis: undefined }, context, plan), false));
test('changed context invalidates review basis', () => assert.equal(reviewBasisMatches(proposal, { ...context, version: '2' }, plan), false));
test('changed plan invalidates review basis', () => assert.equal(reviewBasisMatches(proposal, context, { ...plan, version: '2' }), false));
test('plan built for a different context cannot match', () => assert.equal(reviewBasisMatches(proposal, context, { ...plan, context: { id: 'other', version: '1' } }), false));
test('content preview changes the proposal fingerprint', () => assert.notEqual(proposalFingerprint(proposal), proposalFingerprint({ ...proposal, contentPreview: 'Changed text' })));
test('context reference changes the proposal fingerprint', () => assert.notEqual(proposalFingerprint(proposal), proposalFingerprint({ ...proposal, reviewBasis: { ...proposal.reviewBasis, context: { id: 'context', version: '2' } } })));
test('plan reference changes the proposal fingerprint', () => assert.notEqual(proposalFingerprint(proposal), proposalFingerprint({ ...proposal, reviewBasis: { ...proposal.reviewBasis, plan: { id: 'plan', version: '2' } } })));
test('blank supplied preview blocks approval', () => assert.match(proposalBlockReason({ ...proposal, contentPreview: ' ' }, Date.now()), /preview is incomplete/));
test('blank supplied basis blocks approval', () => assert.match(proposalBlockReason({ ...proposal, reviewBasis: { ...proposal.reviewBasis, plan: { id: '', version: '1' } } }, Date.now()), /basis is incomplete/));
test('legacy proposals remain valid without the optional fields', () => assert.equal(proposalBlockReason({ ...proposal, contentPreview: undefined, reviewBasis: undefined }, Date.now()), null));
