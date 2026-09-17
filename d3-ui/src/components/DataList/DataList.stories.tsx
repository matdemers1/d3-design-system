import type { Meta, StoryObj } from '@storybook/react'
import { AppWindow } from 'lucide-react'
import { DataList, DataListRow } from './DataList'
import { Avatar } from '../Avatar/Avatar'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { Link } from '../Link/Link'
import { EmptyState } from '../EmptyState/EmptyState'
import { Section } from '../Section/Section'
import { Skeleton } from '../Skeleton/Skeleton'

const meta = {
  title: 'Lists/DataList',
  component: DataList,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component:
    'A list of like things, one row each — people, apps, sessions, log entries. **Rows, not a ' +
    'table** (D-067): a real `ul`, because a person with a name, two badges and a button is an ' +
    'item rather than a record of cells, and a table promises headers, sorting and cell ' +
    'navigation this does not have.\n\n' +
    'Each row: `leading` (Avatar or icon) · `title` · `description` · `meta` (badges, a ' +
    'timestamp — tabular figures) · `actions`. From `sm` meta and actions line up down the list, ' +
    'actions on the trailing edge. Rows are at least 48px, padded 12/16, divided by the ' +
    'decorative border. Title and description truncate to one line (D-019).\n\n' +
    '**A row is a link or it holds actions — never both.** `href` makes the whole row one link, ' +
    'and it renders no actions. A row with actions stays inert; make its title a `Link`.\n\n' +
    'Below `sm` meta and actions move under the text, still in the tab order. A row with more ' +
    'actions than fit a phone should pass a menu as its one action.\n\n' +
    'With no rows, `empty` renders instead: an `EmptyState` of the right `kind`.' } } },
  decorators: [(S) => <div style={{ width: '100%', maxWidth: 760, margin: '0 auto' }}><S /></div>],
} satisfies Meta<typeof DataList>
export default meta
type Story = StoryObj<typeof meta>

const PEOPLE = [
  { id: 'p1', name: 'Alex Rivera', user: 'matt', email: 'matt@example.com', kind: 'owner', status: 'active', last: '16 Sept' },
  { id: 'p2', name: 'Sam Okoye', user: 'sarah', email: 'sarah.byrne@a-rather-long-domain-name.example.com', kind: 'admin', status: 'active', last: '14 Sept' },
  { id: 'p3', name: 'Alex Rivera', user: 'alex', email: 'alex@example.com', kind: 'guest', status: 'suspended', last: 'never' },
]

const PeopleList = () => (
    <DataList aria-label="People">
      {PEOPLE.map((p) => (
        <DataListRow
          key={p.id}
          leading={<Avatar name={p.name} size="sm" />}
          title={<Link href={`#${p.id}`}>{p.name}</Link>}
          description={p.email}
          meta={<>
            <Badge size="sm" tone={p.kind === 'guest' ? 'neutral' : 'attention'}>{p.kind}</Badge>
            {p.status === 'active' ? null : <Badge size="sm" tone="danger">{p.status}</Badge>}
            <span>{p.last}</span>
          </>}
          actions={p.kind === 'owner' ? undefined : <>
            <Button size="sm">{p.status === 'suspended' ? 'Let them back in' : 'Suspend'}</Button>
            <Button size="sm" variant="danger-ghost">Reset</Button>
          </>}
        />
      ))}
    </DataList>
)

export const WithActions: Story = {
  name: 'With actions — title is the link',
  render: () => <PeopleList />,
}

export const Interactive: Story = {
  name: 'Interactive — the whole row is the link',
  render: () => (
    <DataList aria-label="Apps">
      <DataListRow href="#bindery" leading={<AppWindow size={20} strokeWidth={1.8} aria-hidden />}
        title="Bindery" description="bindery · web app with a client secret" meta={<span>12 people</span>} />
      <DataListRow href="#burrow" leading={<AppWindow size={20} strokeWidth={1.8} aria-hidden />}
        title="Burrow" description="burrow · native app, PKCE" meta={<Badge size="sm" tone="attention">disabled</Badge>} />
      <DataListRow href="#murmur" leading={<AppWindow size={20} strokeWidth={1.8} aria-hidden />}
        title="Murmur" description="murmur · web app with a client secret" meta={<span>3 people</span>} />
    </DataList>
  ),
}

export const TextOnly: Story = {
  name: 'Text only — a log',
  render: () => (
    <DataList aria-label="Recent events">
      <DataListRow title={<code>grant.given</code>} description="Alex Rivera · person 8f2c4e1a" meta={<span>16 Sept, 09:41</span>} />
      <DataListRow title={<code>session.revoked</code>} description="Sam Okoye · session 1b7d4c3e" meta={<span>16 Sept, 09:12</span>} />
      <DataListRow title={<code>app.registered</code>} description="Alex Rivera · app murmur" meta={<span>15 Sept, 17:03</span>} />
    </DataList>
  ),
}

/** `truncate={false}` for a row whose detail is the point. */
export const Wrapping: Story = {
  name: 'Wrapping — truncate off',
  render: () => (
    <DataList aria-label="Audit">
      <DataListRow truncate={false} title={<code>settings.changed</code>}
        description={'{"mail":{"driver":"relay","from":"auth@d3cloud.io","relayUrl":"https://mail-relay.d3cloud.workers.dev/send"}}'}
        meta={<span>16 Sept, 09:41</span>} />
    </DataList>
  ),
}

/** The same rows truncate, the full text still in the DOM for a screen reader. */
export const Truncated: Story = {
  decorators: [(S) => <div style={{ width: 420 }}><S /></div>],
  render: WithActions.render,
}

export const InASection: Story = {
  name: 'In a Section — rows align with the title',
  render: () => (
    <Section title="3 people" actions={<Button size="sm" variant="primary">Invite</Button>}>
      <PeopleList />
    </Section>
  ),
}

export const Empty: Story = {
  name: 'Empty — nothing exists yet',
  render: () => (
    <DataList aria-label="Pending invites"
      empty={<EmptyState kind="empty" size="inline" heading="No invites waiting">Invites you send appear here until they are accepted.</EmptyState>}>
      {[]}
    </DataList>
  ),
}

export const NoResults: Story = {
  name: 'No results — a filter matched nothing',
  render: () => (
    <DataList aria-label="Audit"
      empty={<EmptyState kind="no-results" size="inline" heading="Nothing matches"
        action={<Button size="sm">Clear filters</Button>}>Widen the filter, or pick an earlier date.</EmptyState>}>
      {[]}
    </DataList>
  ),
}

/** Loading: skeleton rows the shape of the list, in the place it will be. */
export const Loading: Story = {
  render: () => (
    <div aria-busy="true" aria-label="Loading people" role="status">
      <Skeleton variant="text" lines={3} />
    </div>
  ),
}
