import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.browser');
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, workers: 1,
  reporter: [['list'], ['json', { outputFile: 'evidence/browser-results.json' }]],
  use: { baseURL: 'http://127.0.0.1:3106', browserName: 'chromium', headless: true, trace: 'retain-on-failure' },
  webServer: { command: 'node scripts/e2e-server.mjs', url: 'http://127.0.0.1:3106/api/health', reuseExistingServer: false, timeout: 30000 },
});
