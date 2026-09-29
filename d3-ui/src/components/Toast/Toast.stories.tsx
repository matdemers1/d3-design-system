import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Toast } from './Toast'
import { ToastRegion, useToast } from './ToastRegion'
import { Button } from '../Button/Button'

const meta = {
  title: 'Layers/Toast',
  component: Toast,
  tags: ['autodocs'],
  args: { message: 'Archived · Re: Acadia over Columbus Day weekend?', duration: 0 },
  parameters: { docs: { description: { component:
    'A transient note about something the user just did, with at most one way to take it back ' +
    '(D-028, D-073).\n\n' +
    '```tsx\n<ToastRegion>{app}</ToastRegion>\n\nconst toast = useToast()\n' +
    "toast.show({ message: 'Archived', action: { label: 'Undo', shortcut: 'z', onAction: undo } })\n```\n\n" +
    '- **One at a time.** A newer toast replaces the one on screen in place, with a short cross-fade.\n' +
    '- **Never takes focus.** The action is reachable by its shortcut — which **the app binds** — and by Tab.\n' +
    '- **Six seconds, paused** while the pointer or focus is inside. `duration: 0` keeps it until closed.\n' +
    '- Rises 16px on `--motion-toast-enter` (200ms spring), leaves on `--motion-toast-exit` (140ms).\n' +
    '- The region is a polite live region that exists before any toast, fixed at the bottom centre ' +
    'so nothing reflows.' } } },
} satisfies Meta<typeof Toast>
export default meta
type Story = StoryObj<typeof meta>

// Rendered in place for review, inside the polite live region a ToastRegion
// would give it. In an app it is fixed at the bottom of the viewport.
const inPlace: Story['decorators'] = [
  (S) => <div aria-live="polite" style={{ width: 520, display: 'flex', justifyContent: 'center' }}><S /></div>,
]

export const Default: Story = { decorators: inPlace }
export const WithAction: Story = {
  decorators: inPlace,
  args: { action: { label: 'Undo', shortcut: 'z', onAction: () => {} } },
}
export const ActionWithoutShortcut: Story = {
  decorators: inPlace,
  args: { message: 'Moved to Receipts', action: { label: 'View', onAction: () => {} } },
}

function Demo() {
  const toast = useToast()
  const [n, setN] = useState(0)
  const [log, setLog] = useState('Nothing yet.')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <Button
        variant="primary"
        onClick={() => {
          const next = n + 1
          setN(next)
          toast.show({
            message: `Archived ${next} conversation${next === 1 ? '' : 's'}`,
            action: { label: 'Undo', shortcut: 'z', onAction: () => setLog(`Undid archive ${next}.`) },
            onDismiss: (reason) => setLog(`Toast ${next} left: ${reason}.`),
          })
        }}
      >
        Archive
      </Button>
      <Button onClick={() => toast.dismiss()}>Dismiss the toast</Button>
      <p style={{ margin: 0, color: 'var(--color-fg-muted)', fontSize: 'var(--text-13)' }}>{log}</p>
    </div>
  )
}

/** Live: press Archive. A second press while one is showing replaces it in place. */
export const InARegion: Story = {
  name: 'useToast in a ToastRegion',
  parameters: { controls: { disable: true } },
  decorators: [(S) => <div style={{ width: 520, minHeight: 200 }}><S /></div>],
  render: () => (
    <ToastRegion>
      <Demo />
    </ToastRegion>
  ),
}
