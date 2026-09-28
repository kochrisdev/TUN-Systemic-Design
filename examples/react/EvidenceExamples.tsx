import { useState } from 'react';
import { MemoryIndicator, SourceView, UncertaintySignal, type MemoryType } from '@tun-systemic/react';
import { evidenceExample, memoryExample, uncertaintyExample, type EvidenceExample } from './evidence-examples.js';

export function EvidenceExamples() {
  const [scenario, setScenario] = useState<EvidenceExample>('supported');
  const [mode, setMode] = useState<MemoryType | 'unavailable'>('M0');
  return <section className="tun-component" aria-label="Evidence and memory examples">
    <h2 className="tun-heading">Explore evidence and memory states</h2>
    <p>Separate synthetic fixtures. These controls do not change the task, its approval, or any stored memory.</p>
    <details className="tun-details">
      <summary>Explore example states</summary>
      <div className="tun-row">
        <label className="theme-picker">Example evidence <select value={scenario} onChange={event => setScenario(event.target.value as EvidenceExample)}>
          <option value="supported">Supported fixture</option><option value="conflicting">Conflicting fixtures</option>
          <option value="unavailable">Unavailable source</option><option value="generated">Generated interpretation</option>
        </select></label>
        <label className="theme-picker">Example memory <select value={mode} onChange={event => setMode(event.target.value as MemoryType | 'unavailable')}>
          <option value="M0">M0 — No memory</option><option value="M1">M1 — Session</option><option value="M2">M2 — Persistent</option>
          <option value="M3">M3 — Operational</option><option value="unavailable">Unavailable</option>
        </select></label>
      </div>
      <MemoryIndicator memory={memoryExample(mode)} title="Example memory use" announce />
      <SourceView evidence={evidenceExample(scenario)} title="Example sources" announce />
      <UncertaintySignal assessment={uncertaintyExample(scenario)} title="Example uncertainty" announce />
    </details>
  </section>;
}
