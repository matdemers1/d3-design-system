import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import type { AtRule, Plugin as PostcssPlugin } from 'postcss'

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

/**
 * Component CSS ships inside `@layer d3-ui`, placed after Tailwind's `base` and
 * before its `utilities`.
 *
 * Unlayered, it beat every layered rule whatever the specificity, and Tailwind
 * v4 puts every utility in `@layer utilities`: in Bindery `<Input className="w-72">`
 * rendered full width and `<CardBody className="mb-3">` had no margin, with no
 * error. Layered, an app's utilities and its own unlayered CSS override a
 * component, and Tailwind's preflight (in `base`) still cannot reset one.
 *
 * The order statement travels with every stylesheet because layer order is
 * fixed by first mention anywhere in the document. If Tailwind's own statement
 * came first and ours named `d3-ui` for the first time later, `d3-ui` would be
 * appended after `utilities` and win again. theme.css declares the same order
 * ahead of `@import "tailwindcss"` for the same reason.
 *
 * Applied through `css.postcss`, so Storybook — and the browser checks that run
 * against it — get the same cascade the package ships. Tokens are not layered
 * (see check-tokens rule 0); only component rules are.
 */
export const LAYER_ORDER = 'theme, base, d3-ui, components, utilities'

function layerComponentCss(): PostcssPlugin {
  return {
    postcssPlugin: 'd3ui-layer-components',
    Once(root, { AtRule }) {
      const file = (root.source?.input.file ?? '').replace(/\\/g, '/')
      if (!/\/src\/(components|styles)\/[^?]*\.css$/.test(file)) return
      if (root.nodes.some((n) => n.type === 'atrule' && (n as AtRule).name === 'layer')) return
      const layer = new AtRule({ name: 'layer', params: 'd3-ui' })
      layer.append(root.nodes.map((n) => n.clone()))
      root.removeAll()
      root.append(new AtRule({ name: 'layer', params: LAYER_ORDER }), layer)
    },
  }
}

export default defineConfig({
  css: { postcss: { plugins: [layerComponentCss()] } },
  plugins: [
    react(),
    dts({ include: ['src'], exclude: ['**/*.stories.tsx', '**/*.test.*'], rollupTypes: true }),
    importOwnStyles(),
  ],
  build: {
    lib: { entry: resolve(__dirname, 'src/index.ts'), formats: ['es'], fileName: 'index' },
    // React stays a peer: the four apps run 18.2, 18.3 and 19, and two copies of
    // React in one tree breaks hooks.
    // `get-nonce` must stay external: bundled, `setStyleNonce` would set a private
    // copy that the style singleton inside Radix never reads (D-072).
    rollupOptions: { external: [/^react/, /^react-dom/, /^@radix-ui/, 'lucide-react', 'clsx', 'get-nonce'] },
    cssCodeSplit: false,
    sourcemap: true,
  },
})
