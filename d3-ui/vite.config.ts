import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

/**
 * Vite's library build *extracts* every `import './Button.css'` into a single
 * `dist/index.css` and then leaves the entry chunk with no reference to it. The
 * package therefore shipped every class name and none of the rules, and the
 * failure is silent: Storybook runs from `src`, where the per-component imports
 * are live, so the library looked correct right up until an app consumed the
 * built artifact and rendered a 25px transparent square where a Button belonged.
 *
 * So the entry re-imports its own stylesheet. The alternative — asking every app
 * to remember `import '@d3cloud/ui/styles.css'` — is the same defect with an
 * extra step, and it fails in exactly the way that is hardest to attribute.
 * `./styles.css` is still exported, for consumers that need to control ordering.
 */
function importOwnStyles(): Plugin {
  return {
    name: 'd3-import-own-styles',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const css = Object.keys(bundle).find((f) => f.endsWith('.css'))
      if (!css) return
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry) {
          chunk.code = `import "./${css}";\n` + chunk.code
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'], exclude: ['**/*.stories.tsx', '**/*.test.*'], rollupTypes: true }),
    importOwnStyles(),
  ],
  build: {
    lib: { entry: resolve(__dirname, 'src/index.ts'), formats: ['es'], fileName: 'index' },
    // React stays a peer: the four apps run 18.2, 18.3 and 19, and two copies of
    // React in one tree breaks hooks.
    rollupOptions: { external: [/^react/, /^react-dom/, /^@radix-ui/, 'lucide-react', 'clsx'] },
    cssCodeSplit: false,
    sourcemap: true,
  },
})
