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
  viteFinal: async (config) => ({
    ...config,
    base: process.env.STORYBOOK_BASE ?? config.base,
  }),
  typescript: { reactDocgen: 'react-docgen-typescript' },
  docs: { autodocs: 'tag' },
}
export default config
