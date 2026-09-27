'use client';
import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';

export interface IntentComposerProps {
  value: string;
  onValueChange(value: string): void;
  onSubmit(intent: string): void | Promise<void>;
  /** Explain what submission may do; this is not permission to act externally. */
  scope: string;
  label?: string;
  submitLabel?: string;
  disabled?: boolean;
  blockedReason?: string;
  maxLength?: number;
  className?: string;
}
export function IntentComposer({ value, onValueChange, onSubmit, scope,
  label = 'What would you like to achieve?', submitLabel = 'Prepare proposal',
  disabled = false, blockedReason, maxLength = 4000, className = '',
}: IntentComposerProps) {
  const id = useId();
  const lock = useRef(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const limit = Number.isInteger(maxLength) && maxLength > 0 ? maxLength : 4000;
  const blocked = disabled || pending || Boolean(blockedReason);
  const invalid = !value.trim() || value.length > limit;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || blocked || invalid) return;
    lock.current = true;
    setPending(true);
    setMessage('Preparing your request.');
    try {
      await onSubmit(value.trim());
      setMessage('Request submitted. This does not confirm an external action.');
    } catch {
      setMessage('Submission was not confirmed. Check the task state before resubmitting.');
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  function shortcut(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }
  return <form className={`tun-component tun-composer ${className}`} onSubmit={submit} aria-labelledby={`${id}-label`}>
    <label className="tun-heading" id={`${id}-label`} htmlFor={`${id}-input`}>{label}</label>
    <p className="tun-muted" id={`${id}-scope`}>{scope}</p>
    <textarea id={`${id}-input`} className="tun-input" rows={4} value={value}
      disabled={blocked} maxLength={limit} required
      aria-invalid={value.length > limit || undefined}
      aria-describedby={`${id}-scope ${id}-help ${id}-status`}
      onChange={event => onValueChange(event.target.value)} onKeyDown={shortcut} />
    <div className="tun-row">
      <p className="tun-caption" id={`${id}-help`}>{value.length}/{limit} characters. Ctrl or ⌘ + Enter submits; Enter adds a line.</p>
      <button type="submit" className="tun-button tun-button-primary" disabled={blocked || invalid}>
        {pending ? 'Preparing…' : submitLabel}
      </button>
    </div>
    <p id={`${id}-status`} className="tun-caption" role="status" aria-live="polite">{blockedReason || message}</p>
  </form>;
}
