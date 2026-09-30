import { describe, expect, it } from 'vitest';
import { decodeSnapshot, receiptFor } from '../examples/host-integration/client.js';
const actor = {id:'operator',name:'Operator',type:'human'};
const recovery = {kind:'reversible',description:'Separately approved local withdrawal.'};
const receipt = {id:'operation-one',action:'Publish local project update',actor,target:'Local board',timestamp:'2026-09-30T00:00:00Z',status:'completed',summary:'Server readback',verification:{state:'verified',detail:'Matched canonical operation'},recovery};
function snapshot(state='authorized', record: unknown=null) { return {session:{id:'operator',tenant:'local',canWrite:true,canAdmin:false},proposals:[],operations:[{id:'operation-one',proposalId:'p',proposalVersion:'1',state,receipt:record}],events:[]}; }
describe('host receipt boundary', () => {
  it('accepts an authorized operation without manufacturing a receipt', () => { expect(receiptFor(decodeSnapshot(snapshot()).operations[0])).toBeNull(); });
  it('rejects a successful-looking receipt before server verification', () => { expect(() => decodeSnapshot(snapshot('pending-verification',receipt))).toThrow(); });
  it('rejects verified status without a supplied receipt', () => { expect(() => decodeSnapshot(snapshot('verified'))).toThrow(); });
  it('rejects a receipt bound to another operation', () => { expect(() => decodeSnapshot(snapshot('verified',{...receipt,id:'other'}))).toThrow(); });
  it('rejects unknown verification and invalid timestamps', () => {
    expect(() => decodeSnapshot(snapshot('verified',{...receipt,verification:{state:'pending',detail:'Waiting'}}))).toThrow();
    expect(() => decodeSnapshot(snapshot('verified',{...receipt,timestamp:'2026-02-30T00:00:00Z'}))).toThrow();
  });
  it('renders only the supplied matching verified receipt', () => { expect(receiptFor(decodeSnapshot(snapshot('verified',receipt)).operations[0])).toEqual(receipt); });
  it('rejects malformed nested responses and unsupported states', () => {
    for (const value of [null,{},snapshot('success'),{...snapshot(),operations:[null]}, {...snapshot(),session:{id:'fake',canWrite:'yes'}}]) expect(() => decodeSnapshot(value)).toThrow();
  });
});
