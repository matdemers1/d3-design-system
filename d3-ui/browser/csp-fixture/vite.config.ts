import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

/**
 * Builds the strict-CSP fixture into `storybook-static/csp/`, so the browser
 * checks' static server serves it beside Storybook (D-072). Storybook itself
 * cannot run under the policy — its manager and preview inject styles — so the
 * fixture is a plain app built from `dist/`.
 *
 * `root` is this folder, so the library's own vite.config.ts (a library build
 * with React externalised) is not merged in.
 */
export default defineConfig({
  root: __dirname,
  base: './',
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, '../../storybook-static/csp'),
    emptyOutDir: true,
    // Assets inlined as data: URIs would still be fine for style-src, but keep
    // every file real so the page is what a strict app ships.
    assetsInlineLimit: 0,
  },
})
