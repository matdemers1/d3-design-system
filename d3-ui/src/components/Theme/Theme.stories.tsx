import type { Meta, StoryObj } from '@storybook/react'
import { Settings } from 'lucide-react'
import { ThemeProvider, useTheme } from './ThemeProvider'
import { ThemeSwitch } from './ThemeSwitch'
import { themeBootScript } from './themeBootScript'
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '../Menu/Menu'
import { Button } from '../Button/Button'

const meta = {
  title: 'Frame/Theme',
  component: ThemeSwitch,
  tags: ['autodocs'],
  parameters: { docs: { description: { component:
    'System / Light / Dark, remembered per browser.\n\n' +
    '`ThemeProvider` writes the resolved mode to `data-theme` on `<html>` — always `light` or `dark` — ' +
    'follows the OS live while the preference is `system`, and keeps the choice in `localStorage` ' +
    '(key `d3.theme`). `useTheme()` returns `{ preference, resolved, setPreference }`.\n\n' +
    '**No flash on load.** React runs after the first paint, so an app inlines `themeBootScript()` in ' +
    '`<head>`; it sets the same attribute from the same key before anything is drawn.\n\n' +
    '`ThemeSwitch` renders a `SegmentedControl` on a page and **menu radios inside a menu** — a ' +
    'radiogroup is not allowed inside `role="menu"`, and the menu owns the arrow keys (D-066).\n\n' +
    '(These stories are drawn inside Storybook\'s own theme wrapper, so the switch changes the ' +
    'preview panel below it and the document, not the frame around the story.)' } } },
} satisfies Meta<typeof ThemeSwitch>
export default meta
type Story = StoryObj<typeof meta>

function Preview() {
  const { preference, resolved } = useTheme()
  return (
    <div
      data-theme={resolved}
      style={{
        background: 'var(--color-surface)', color: 'var(--color-fg)', padding: 'var(--space-16)',
        borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-13)', minWidth: 240,
      }}
    >
      Preference <strong>{preference}</strong> · showing <strong data-testid="resolved">{resolved}</strong>
    </div>
  )
}

/** On a settings page. */
export const OnAPage: Story = {
  render: () => (
    <ThemeProvider storageKey="d3.story.theme">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)', alignItems: 'flex-start' }}>
        <ThemeSwitch />
        <Preview />
      </div>
    </ThemeProvider>
  ),
}

/**
 * Inside a menu it becomes a labelled group of `menuitemradio`s. Choosing one
 * keeps the menu open, so the change is seen where it was made.
 */
export const InAMenu: Story = {
  render: () => (
    <ThemeProvider storageKey="d3.story.theme">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)', alignItems: 'flex-start' }}>
        <Menu>
          <MenuTrigger><Button icon={<Settings size={16} strokeWidth={1.8} />}>Preferences</Button></MenuTrigger>
          <MenuContent>
            <ThemeSwitch />
            <MenuSeparator />
            <MenuItem>Keyboard shortcuts</MenuItem>
          </MenuContent>
        </Menu>
        <Preview />
      </div>
    </ThemeProvider>
  ),
}

/** The string an app inlines in `<head>`, ahead of its stylesheet. */
export const BootScript: Story = {
  render: () => (
    <pre style={{
      margin: 0, maxWidth: 520, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
      fontFamily: 'var(--font-mono)', fontSize: 'var(--text-12)', color: 'var(--color-fg-muted)',
    }}>
      {`<script>${themeBootScript()}</script>`}
    </pre>
  ),
}
