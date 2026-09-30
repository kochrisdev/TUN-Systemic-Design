import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  testDir: './browser', workers: 1, fullyParallel: false, timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:4180', browserName: 'chromium',
    // No traces: they could retain the local bootstrap token entered in the form.
    trace: 'off', launchOptions: { executablePath: process.env.TUN_CHROMIUM_EXECUTABLE },
  },
  outputDir: '../../test-results/host',
  webServer: {
    command: 'python3 examples/host-integration/server.py --ephemeral --quiet --port 4180 --token-file .host-test-access.json',
    cwd: fileURLToPath(new URL('../..', import.meta.url)),
    url: 'http://127.0.0.1:4180/health', reuseExistingServer: false,
  },
  reporter: [['list'], ['json', { outputFile: fileURLToPath(new URL('../../artifacts/host-browser-results.json', import.meta.url)) }]],
});
