import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    // Every story is checked with axe. The Phase 4 specs require an automated
    // accessibility check per story, and this is the thing that provides it.
    '@storybook/addon-a11y',
  ],
  framework: { name: '@storybook/react-vite', options: {} },

  // GitHub Pages serves this from /d3-design-system/, not from the root.
  // Storybook's default relative base breaks a lazily-loaded CSS chunk: the
  // JS lives in /assets/ and asks for './assets/Input-*.css', which resolves
  // to /assets/assets/… and 404s — the story then renders unstyled with no
  // error anyone would notice. An explicit base fixes it, and stays unset for
  // local builds so those keep working from the filesystem.
  // Storybook merges the package's own vite.config.ts, which is a *library*
  // build: `build.lib`, React and Radix externalised, and vite-plugin-dts.
  // Inheriting that is what broke the published Storybook — asset references
  // came out relative to the emitted module rather than to the base, so the
  // preview asked for `assets/assets/style.css`, the story module failed to
  // load, and the page rendered nothing with no error on it.
  //
  // So the app build starts from the library config with the library parts
  // taken back out.
  viteFinal: async (config) => ({
    ...config,
    base: process.env.STORYBOOK_BASE ?? config.base,
    plugins: (config.plugins ?? []).filter((p) => {
      const name = p && typeof p === 'object' && 'name' in p ? String(p.name) : ''
      return !name.includes('dts') && !name.startsWith('d3-')
    }),
    build: {
      ...config.build,
      lib: undefined,
      cssCodeSplit: false,
      rollupOptions: { ...config.build?.rollupOptions, external: [], input: undefined },
    },
  }),
  typescript: { reactDocgen: 'react-docgen-typescript' },
  docs: { autodocs: 'tag' },
}
export default config
