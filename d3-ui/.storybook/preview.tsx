import type { Preview } from '@storybook/react'
import '../src/tokens/build/tokens.css'
import '../src/styles/components.css'

const preview: Preview = {
  parameters: {
    // The surface hugs the content. The earlier narrow-strip bug was not caused
    // by `centered` — it was `min-height: 100vh` inside a shrink-wrapped
    // container. Removing the forced height is the fix; forcing fullscreen just
    // traded a strip for an acre of empty canvas around a 32px avatar.
    layout: 'centered',
    controls: { expanded: true },
    backgrounds: { disable: true },
    a11y: {
      // Fail the run rather than warn. The Phase 4 specs are contracts.
      test: 'error',
      config: { rules: [{ id: 'color-contrast', enabled: true }] },
    },
  },
  globalTypes: {
    theme: {
      description: 'Colour mode',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'light', title: 'Light', icon: 'sun' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    // The theme is applied to a wrapper element, not to documentElement.
    // Mutating the document during render is not guaranteed to be flushed before
    // the a11y addon measures — which produced a phantom 1.67:1 contrast failure
    // where dark's text-muted was measured against light's background. Scoped
    // theming (D-037) makes the mode part of the render, so there is no race.
    (Story, context) => {
      const theme = (context.globals.theme as string) ?? 'dark'
      return (
        <div
          data-theme={theme}
          style={{
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-14)',
            // Generous padding so a component is never judged flush against an
            // edge, and a floor so a 20px avatar still reads as sitting on a
            // surface rather than floating in a swatch.
            padding: 'var(--space-32)',
            borderRadius: 'var(--radius-lg)',
            minWidth: 160,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Story />
        </div>
      )
    },
  ],
}
export default preview
