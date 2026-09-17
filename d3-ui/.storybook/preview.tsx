import type { Preview } from '@storybook/react'
import '../src/tokens/build/tokens.css'
import '../src/styles/components.css'
import { useLayoutEffect } from 'react'
import { ThemeProvider, useTheme } from '../src/components/Theme'

/*
 * The canvas for a full-screen page (`parameters.canvas: 'app'`, the Patterns
 * stories). A page is not a component on a swatch: no padding, no centring, the
 * full viewport, and the theme owned the way an app owns it — a ThemeProvider
 * writing `data-theme` on <html>, so menus and modals portalled to <body> get
 * the same mode as the page. The toolbar's choice is pushed into the provider,
 * and a choice made inside the story (the account menu's theme radios) repaints
 * the canvas too.
 */
function FollowToolbar({ theme }: { theme: 'dark' | 'light' }) {
  const { setPreference } = useTheme()
  useLayoutEffect(() => { setPreference(theme) }, [theme, setPreference])
  return null
}
function AppCanvas({ children }: { children: React.ReactNode }) {
  const { resolved } = useTheme()
  return (
    <div
      data-theme={resolved}
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        color: 'var(--color-fg)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-14)',
      }}
    >
      {children}
    </div>
  )
}

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
      if (context.parameters.canvas === 'app') {
        const mode = theme === 'light' ? 'light' : 'dark'
        return (
          <ThemeProvider storageKey="d3.story.canvas.theme" defaultPreference={mode}>
            <FollowToolbar theme={mode} />
            <AppCanvas><Story /></AppCanvas>
          </ThemeProvider>
        )
      }
      return (
        <div
          data-theme={theme}
          style={{
            background: 'var(--color-bg)',
            color: 'var(--color-fg)',
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
