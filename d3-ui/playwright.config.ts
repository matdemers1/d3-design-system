import { defineConfig, devices } from '@playwright/test'

/**
 * Browser checks against the built Storybook.
 *
 * The unit suite is good at semantics and blind to geometry, and three defects
 * shipped past it: Input 2px taller than Button (no box-sizing reset), motion
 * tests asserting on empty strings, and a package with no CSS. Each was found by
 * somebody measuring the rendered page by hand. This is that measuring, in CI.
 *
 * Pixel baselines exist only inside `mcr.microsoft.com/playwright:v1.63.0-noble`.
 * Rendering differs between machines on antialiasing alone, and a comparison
 * that fails on a laptop gets switched off — so `npm run test:browser` runs in
 * that image, and the geometry checks carry the coverage.
 */
export default defineConfig({
  testDir: 'browser',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:6007',
    viewport: { width: 1000, height: 800 },
    deviceScaleFactor: 1,
  },
  expect: {
    // Tuned against a real miss. A checkbox lost its tick and the comparison still
    // passed twice: first because 0.2% of a 430x400 story is ~350 pixels, then —
    // with an absolute count of 12 — because the tick is an 11px antialiased
    // stroke, and most of its 25 changed pixels fell under the default per-pixel
    // colour threshold of 0.2. Rendering inside one pinned image is deterministic
    // — identical across repeated runs — so the pixel budget is zero, and a
    // tick-sized change (5 pixels at this threshold) fails.
    toHaveScreenshot: { threshold: 0.05, maxDiffPixels: 0, animations: 'disabled', caret: 'hide' },
  },
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1000, height: 800 }, deviceScaleFactor: 1 } }],
  webServer: {
    command: 'node scripts/serve-static.mjs storybook-static 6007',
    url: 'http://127.0.0.1:6007/index.json',
    reuseExistingServer: !process.env.CI,
  },
})
