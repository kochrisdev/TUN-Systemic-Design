/** Client/server compatibility samples, exercised with both runtime and type majors. */
import { StrictMode } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApprovalGate } from '../packages/react/src/index.js';
import { proposal, specimens } from './consumer/consumer.js';

describe('React peer compatibility', () => {
  it('hydrates all fourteen exported specimens with stable unique labelled ids', async () => {
    const tree = <StrictMode>{Object.entries(specimens).map(([name, specimen]) => <div key={name}>{specimen}</div>)}</StrictMode>;
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree, { identifierPrefix: 'compat-' });
    document.body.appendChild(container);
    const ids = () => [...container.querySelectorAll('[id]')].map(node => node.id);
    const before = ids(); const recoverable = vi.fn(); const errors = vi.spyOn(console, 'error');
    let root: Root | undefined;
    try {
      await act(async () => { root = hydrateRoot(container, tree, { identifierPrefix: 'compat-', onRecoverableError: recoverable }); });
      expect(container.querySelectorAll('.tun-component')).toHaveLength(14);
      expect(ids()).toEqual(before); expect(new Set(ids()).size).toBe(ids().length);
      for (const region of container.querySelectorAll('[aria-labelledby]')) {
        for (const id of region.getAttribute('aria-labelledby')!.split(/\s+/)) expect(document.getElementById(id)).not.toBeNull();
      }
      expect(recoverable).not.toHaveBeenCalled();
      // Do not suppress a React-version-specific hydration warning.
      expect(errors).not.toHaveBeenCalled();
    } finally {
      if (root) await act(async () => root!.unmount());
      errors.mockRestore(); container.remove();
    }
  });
  it('StrictMode keeps a decision single-shot and a changed target blocked', async () => {
    const decision = vi.fn();
    const view = (target: string) => <StrictMode><ApprovalGate proposal={{ ...proposal, target }} status="awaiting" approveLabel="Approve fixture" onDecision={decision} /></StrictMode>;
    const { rerender } = render(view('Original target'));
    const button = screen.getByRole('button', { name: 'Approve fixture' });
    fireEvent.click(button); fireEvent.click(button);
    await waitFor(() => expect(decision).toHaveBeenCalledTimes(1));
    expect(button).toBeDisabled();
    rerender(view('Changed target'));
    expect(screen.getByRole('button', { name: 'Approve fixture' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('changed without a new version');
  });
  it('StrictMode does not turn an unconfirmed decision into permission to retry', async () => {
    const decision = vi.fn(async () => { throw new Error('private test payload'); });
    render(<StrictMode><ApprovalGate proposal={proposal} status="awaiting" approveLabel="Approve fixture" onDecision={decision} /></StrictMode>);
    const button = screen.getByRole('button', { name: 'Approve fixture' });
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Decision outcome is unknown'));
    expect(button).toBeDisabled(); fireEvent.click(button);
    expect(decision).toHaveBeenCalledTimes(1); expect(screen.queryByText('private test payload')).not.toBeInTheDocument();
  });
});
