import type { z } from 'zod';
export function rejectCustomChecks(value: unknown, seen?: WeakSet<object>): void;
export function buildBundle(schemas?: Record<string, z.ZodType>): Record<string, unknown>;
export function renderBundle(bundle: Record<string, unknown>): string;
export function checkOrWrite(write?: boolean): void;
