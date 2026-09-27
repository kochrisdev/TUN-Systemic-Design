import { defineConfig } from 'vitest/config';
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: { environment: 'jsdom', include: ['tests/components.test.tsx'], setupFiles: ['tests/setup.ts'] },
});
