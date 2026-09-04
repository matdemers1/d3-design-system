import type { Meta, StoryObj } from '@storybook/react'
import { Images, Film, FileLock2 } from 'lucide-react'
import { Tabs, TabPanel } from './Tabs'

const VIEWS = [
  { value: 'inbox', label: 'Inbox', count: 48 },
  { value: 'in_review', label: 'In Review', count: 12 },
  { value: 'awaiting', label: 'Awaiting' },
  { value: 'backlog', label: 'Backlog' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'all', label: 'All' },
]

const meta = {
  title: 'Layers/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: { items: VIEWS, 'aria-label': 'Inbox views' },
  argTypes: { activationMode: { control: 'inline-radio', options: ['automatic', 'manual'] } },
  parameters: { docs: { description: { component:
    'Switching between sibling views of the same subject.\n\n' +
    '**Activation mode is a real fork, decided per app.** `automatic` (the WAI-ARIA default) ' +
    'switches the panel as the arrow keys move — correct when panels are in memory. `manual` ' +
    'moves focus and waits for Enter or Space, and is **required when switching fires a network ' +
    'request**: App A’s six view tabs each refetch, so arrowing from Inbox to All under automatic ' +
    'activation would fire five requests nobody asked for and announce five loading states.\n\n' +
    'Tabs scroll when they overflow. Never wrap to a second row, never collapse into a Select.' } } },
} satisfies Meta<typeof Tabs>
export default meta
type Story = StoryObj<typeof meta>

export const Automatic: Story = {
  args: { activationMode: 'automatic' },
  render: (args) => (
    <Tabs {...args}>
      {VIEWS.map((v) => (
        <TabPanel key={v.value} value={v.value}>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            {v.label} panel — local state, so arrowing between tabs is free.
          </span>
        </TabPanel>
      ))}
    </Tabs>
  ),
}
export const Manual: Story = {
  args: { activationMode: 'manual' },
  parameters: { docs: { description: { story:
    'What App A must use. Arrow keys move focus; Enter or Space activates — so arrowing across ' +
    'six tabs fires one request, not five.' } } },
  render: (args) => (
    <Tabs {...args}>
      {VIEWS.map((v) => (
        <TabPanel key={v.value} value={v.value}>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            {v.label} panel — each of these refetches.
          </span>
        </TabPanel>
      ))}
    </Tabs>
  ),
}
export const Overflowing: Story = {
  name: 'Narrow — scrolls, never wraps',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ width: 300 }}>
      <Tabs {...args}>
        <TabPanel value="inbox" />
      </Tabs>
    </div>
  ),
}

/** Icons are decorative — the label carries the name, and the count joins it. */
export const WithIcons: Story = {
  args: {
    'aria-label': 'What is in the vault',
    items: [
      { value: 'photos', label: 'Photos', count: 128, icon: <Images size={14} /> },
      { value: 'videos', label: 'Videos', count: 4, icon: <Film size={14} /> },
      { value: 'documents', label: 'Documents', count: 12, icon: <FileLock2 size={14} /> },
    ],
  },
  render: (args) => (
    <Tabs {...args}>
      {args.items.map((i) => <TabPanel key={i.value} value={i.value}>{i.label} panel</TabPanel>)}
    </Tabs>
  ),
}

