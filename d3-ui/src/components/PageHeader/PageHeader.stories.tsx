import type { Meta, StoryObj } from '@storybook/react'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { Button } from '../Button/Button'

const meta = {
  title: 'Patterns/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  args: { title: 'Inbox', focusOnMount: false },
  parameters: { docs: { description: { component:
    'The top of a page: what this is, how much of it there is, and what you can do to it.\n\n' +
    'The title is the page’s `<h1>`, and there is exactly one per page. **On mount it takes ' +
    'programmatic focus so a screen reader announces the new page** — a PageHeader mounts once ' +
    'per route, so that *is* the route change. None of the four apps does this today, which makes ' +
    'every client-side navigation silent to assistive technology.\n\n' +
    '(`focusOnMount` is off in these stories so the docs page does not steal focus as you scroll.)\n\n' +
    '**Actions wrap on narrow screens; they never collapse into a menu.** If there are more than ' +
    'two, the *secondary* ones collapse and the primary stays visible — never the reverse.' } } },
  decorators: [(S) => <div style={{ width: 560 }}><S /></div>],
} satisfies Meta<typeof PageHeader>
export default meta
type Story = StoryObj<typeof meta>

export const TitleOnly: Story = { args: { title: 'Clusters' } }
export const WithCountAndActions: Story = {
  args: { title: 'Inbox', count: 48,
    actions: <><Button>Export</Button><Button variant="primary">New item</Button></> },
  parameters: { docs: { description: { story:
    'The count is part of the accessible name — “Inbox, 48 items”, not a bare number after a title.' } } },
}
export const WithDescription: Story = {
  args: { title: 'Offsite replication',
    description: 'Nightly encrypted dumps to your own S3 bucket, with a ledger you can reconcile against.',
    actions: <Button>Run now</Button> },
}
export const DetailPage: Story = {
  args: { title: 'Export fails silently on files over 50 MB',
    backTo: { href: '#', label: 'Inbox' },
    backIcon: <ArrowLeft size={13} strokeWidth={2} />,
    actions: <><Button variant="ghost">Merge</Button><Button variant="danger-ghost">Dismiss</Button></> },
  parameters: { docs: { description: { story:
    'On a detail page the title is **the object itself**, not its type. The back link names its ' +
    'destination — “Inbox”, never “Back”. Breadcrumbs stay cut: no app has one.' } } },
}
export const Narrow: Story = {
  name: 'Below sm — actions wrap, never collapse',
  args: { title: 'Inbox', count: 48,
    actions: <><Button>Export</Button><Button variant="primary">New item</Button></> },
  parameters: { controls: { disable: true } },
  decorators: [(S) => <div style={{ width: 360 }}><S /></div>],
}
