import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryIndicator, SourceView, UncertaintySignal, type EvidenceSource } from '../packages/react/src/index.js';
import { evidenceExample, memoryExample, uncertaintyExample } from '../examples/react/evidence-examples.js';

const readable = evidenceExample('supported').sources[0] as Extract<EvidenceSource, { access: 'available' }>;
describe('MemoryIndicator', () => {
  it('separates memory use from retention and permission', () => {
    render(<MemoryIndicator memory={memoryExample('M0')} onInspect={vi.fn()} />);
    expect(screen.getByText('No AI memory used for this task')).toBeVisible();
    expect(screen.getByText(/logging, backup, deletion, or training policy/)).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  for (const mode of ['M1', 'M2', 'M3'] as const) {
    it(`shows active ${mode} with its scope and influence`, () => {
      render(<MemoryIndicator memory={memoryExample(mode)} />);
      expect(screen.getByText(/hypothetical formatting preference/)).toBeVisible();
      expect(screen.getByText(/Separate synthetic example/)).toBeVisible();
    });
  }
  it('only emits a version-bound inspection request on activation', async () => {
    const inspect = vi.fn(); render(<MemoryIndicator memory={memoryExample('M2')} onInspect={inspect} />);
    expect(inspect).not.toHaveBeenCalled();
    const button = screen.getByRole('button', { name: 'Inspect memory' }); button.focus();
    await userEvent.keyboard('{Enter}');
    expect(inspect).toHaveBeenCalledWith({ memoryId: 'example-memory', memoryVersion: 'M2' });
    expect(screen.queryByText('Deleted')).not.toBeInTheDocument();
  });
  for (const state of ['inactive', 'unavailable'] as const) {
    it(`hides influence and inspection for ${state} memory`, () => {
      render(<MemoryIndicator memory={{ ...memoryExample('M2'), state }} onInspect={vi.fn()} />);
      expect(screen.queryByText(/hypothetical formatting preference/)).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  }
  it('does not present an invalid active M0 record as valid memory', () => {
    render(<MemoryIndicator memory={{ ...memoryExample('M0'), state: 'active' }} onInspect={vi.fn()} />);
    expect(screen.getByText('Memory unavailable')).toBeVisible(); expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('opts into polite status instead of announcing everything by default', () => {
    const { rerender } = render(<MemoryIndicator memory={memoryExample('M1')} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    rerender(<MemoryIndicator memory={memoryExample('M1')} announce />);
    expect(screen.getByRole('status')).toHaveTextContent('in use');
  });
  it('reflects supplied inactive state without claiming deletion', () => {
    const { rerender } = render(<MemoryIndicator memory={memoryExample('M2')} onInspect={vi.fn()} />);
    rerender(<MemoryIndicator memory={{ ...memoryExample('M2'), state: 'inactive' }} onInspect={vi.fn()} />);
    expect(screen.getByText(/not used for this task/)).toBeVisible(); expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
describe('SourceView', () => {
  it('labels quotations and the limited application check', () => {
    const { container } = render(<SourceView evidence={evidenceExample('supported')} />);
    expect(screen.getByText('Direct source quotation')).toBeVisible(); expect(container.querySelector('blockquote')).not.toBeNull();
    expect(screen.getByText('Evidence checked — application reported')).toBeVisible();
  });
  it('renders paraphrases without quotation markup', () => {
    const { container } = render(<SourceView evidence={{ ...evidenceExample('supported'), sources: [{ ...readable, excerpt: { kind: 'paraphrase', text: 'Paraphrased material.' } }] }} />);
    expect(screen.getByText('Paraphrase — not a direct quotation')).toBeVisible(); expect(container.querySelector('blockquote')).toBeNull();
  });
  it('never styles generated interpretation as source quotation or checked support', () => {
    const { container } = render(<SourceView evidence={evidenceExample('generated')} />);
    expect(screen.getByText('Generated interpretation — not source text')).toBeVisible();
    expect(screen.getByText('Partial evidence')).toBeVisible(); expect(container.querySelector('blockquote')).toBeNull();
  });
  it('keeps contrary evidence and explanations visible', () => {
    render(<SourceView evidence={evidenceExample('conflicting')} />);
    expect(screen.getByText('Conflicting evidence')).toBeVisible();
    expect(screen.getByText('Contrary synthetic note')).toBeVisible(); expect(screen.getByText('Contradicts this claim.')).toBeVisible();
  });
  for (const access of ['restricted', 'unavailable'] as const) {
    it(`omits unexpected excerpts and links from ${access} records`, () => {
      const source = { ...readable, access, reason: 'Not readable', excerpt: { kind: 'quote', text: 'FORBIDDEN_CONTENT' }, url: 'https://example.com/private' } as unknown as EvidenceSource;
      const { container } = render(<SourceView evidence={{ ...evidenceExample('supported'), sources: [source] }} />);
      expect(container.textContent).not.toContain('FORBIDDEN_CONTENT'); expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  }
  for (const url of ['javascript:alert(1)', 'data:text/html,no', '//example.com', 'https://user:password@example.com']) {
    it(`omits unsupported link ${url}`, () => {
      render(<SourceView evidence={{ ...evidenceExample('supported'), sources: [{ ...readable, url }] }} />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument(); expect(screen.getByText('The source link is unavailable.')).toBeVisible();
    });
  }
  it('gives a safe source link a meaningful name', () => {
    render(<SourceView evidence={{ ...evidenceExample('supported'), sources: [{ ...readable, url: 'https://example.com/note' }] }} />);
    expect(screen.getByRole('link', { name: 'Open source: Synthetic example note' })).toHaveAttribute('href', 'https://example.com/note');
  });
  it('does not fabricate a timestamp', () => {
    const { container } = render(<SourceView evidence={{ ...evidenceExample('supported'), sources: [{ ...readable, observedAt: '2026-02-30T08:00:00Z' }] }} />);
    expect(screen.getByText(/Time unavailable/)).toBeVisible(); expect(container.querySelector('time')).toBeNull();
  });
  it('escapes source text instead of rendering HTML', () => {
    const { container } = render(<SourceView evidence={{ ...evidenceExample('supported'), sources: [{ ...readable, excerpt: { kind: 'quote', text: '<img src=x onerror=alert(1)>' } }] }} />);
    expect(container.querySelector('img')).toBeNull(); expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeVisible();
  });
  it('shows no evidence for an empty list', () => {
    render(<SourceView evidence={{ ...evidenceExample('supported'), sources: [] }} />);
    expect(screen.getByText(/No evidence supplied/)).toBeVisible(); expect(screen.getByText('Evidence unavailable')).toBeVisible();
  });
  it('announces a supplied conflict without creating a verification', () => {
    const { rerender } = render(<SourceView evidence={evidenceExample('supported')} announce />);
    rerender(<SourceView evidence={evidenceExample('conflicting')} announce />);
    expect(screen.getByRole('status')).toHaveTextContent('Conflicting evidence');
  });
});
describe('UncertaintySignal', () => {
  for (const level of ['U0', 'U1', 'U2', 'U3'] as const) {
    it(`shows qualitative ${level} with scope`, () => {
      render(<UncertaintySignal assessment={{ level, scope: 'Specific claim', explanation: 'Limited interpretation', basis: 'Supplied evidence' }} announce />);
      expect(screen.getByRole('status')).toHaveTextContent(level); expect(screen.getByText(/Specific claim/)).toBeVisible();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  }
  it('downgrades an unsupported confirmed badge', () => {
    render(<UncertaintySignal assessment={{ level: 'U0', scope: 'Claim', explanation: 'Unsupported assertion' }} announce />);
    expect(screen.getByRole('status')).toHaveTextContent('U3 · Unknown'); expect(screen.getByText(/Displayed as Unknown/)).toBeVisible();
  });
  it('shows a useful next step without executing it', () => {
    render(<UncertaintySignal assessment={uncertaintyExample('unavailable')} />);
    expect(screen.getByText(/Resolve the conflicting or missing evidence/)).toBeVisible(); expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('can remain quiet when only an informative assessment is displayed', () => {
    render(<UncertaintySignal assessment={uncertaintyExample('supported')} />); expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
it('all evidence components have unique named regions across multiple instances', () => {
  const { container } = render(<><MemoryIndicator memory={memoryExample('M1')} /><MemoryIndicator memory={memoryExample('M1')} />
    <SourceView evidence={evidenceExample('supported')} /><SourceView evidence={evidenceExample('supported')} />
    <UncertaintySignal assessment={uncertaintyExample('supported')} /><UncertaintySignal assessment={uncertaintyExample('supported')} /></>);
  const ids = [...container.querySelectorAll('[id]')].map(element => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(screen.getAllByRole('region', { name: 'Memory use' })).toHaveLength(2);
  for (const region of screen.getAllByRole('region', { name: 'Sources and evidence' })) expect(within(region).getByRole('heading', { level: 2 })).toBeVisible();
});
