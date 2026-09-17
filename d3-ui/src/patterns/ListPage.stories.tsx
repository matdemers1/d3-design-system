import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Ellipsis, Search, UserPlus, UsersRound } from 'lucide-react'
import {
  Avatar, Badge, Button, Card, DataList, DataListRow, EmptyState, FilterBar, FormField, IconButton, Input, Link,
  Menu, MenuContent, MenuItem, MenuTrigger, Page, PageHeader, SegmentedControl, Select, Skeleton,
} from '../index'
import { ConsoleFrame, PEOPLE, type Person } from './console'

const meta = {
  title: 'Patterns/List page',
  parameters: {
    layout: 'fullscreen',
    canvas: 'app',
    docs: {
      story: { inline: false, iframeHeight: 760 },
      description: { component: `
A page whose job is one list of like things — people, apps, sessions — and the
actions on them. **\`Page\` → \`PageHeader\` → \`FilterBar\` → a \`Card\` holding a \`DataList\`.**

#### The header
- **Do** use the nav item's word as the title — *People*, not *Manage users* — and pass the total as \`count\`, so it is part of the heading's name ("People, 6 items").
- **Do** put the page's one primary action in \`actions\`: *Invite someone*, *Register an app*.
- **Don't** put a create form above the list. Creating is a task; it gets a Modal or its own page (see *Forms*).

#### Filters
- **Do** use a \`FilterBar\` above the list, with visible labels — a placeholder is not a label.
- **Do** put the result count in \`trailing\` ("4 of 6 people"). The header keeps the total.
- **Don't** show filters while the list is empty for real: there is nothing to narrow.

#### Rows
- **Do** make a row **either** one link (\`href\`, the whole row) **or** hold actions with its title as a \`Link\` — never both (D-067).
- **Do** keep status in \`meta\` as a \`Badge\`, and spend a hue only on what needs someone (*Suspended*). A role is \`neutral\`.
- **Do** keep at most one visible action per row, and put the rest in a \`Menu\` behind an \`IconButton\` named for the row ("More actions for Priya Raman").
- **Do** act at once on reversible actions (*Suspend*) and confirm irreversible ones in a \`Modal destructive\` (see *Confirmation*).
- **Don't** put an action on the owner's row, or on your own, that the server will refuse. Leave the slot empty; the columns still line up.

#### States — each one inside the \`Page\`, where the list will be
| State | Shows |
|---|---|
| Loading | The real header, then skeleton rows the shape of the rows. Not a spinner, not a full-width grey block |
| Empty | \`EmptyState kind="empty"\` that says what the list is for; **the primary moves into it**, and the header drops its own |
| No results | The FilterBar stays, and \`DataList empty\` shows \`kind="no-results"\` with *Clear filters* |
| No access | \`EmptyState kind="no-access"\` naming who can grant it. The nav link stays (see *App frame*) |
` },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const ROLES = [
  { value: 'all', label: 'Any role' },
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'guest', label: 'Guest' },
]
const STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
]

const glyph = (I: typeof Search) => <I size={16} strokeWidth={1.8} aria-hidden />
const invite = <Button variant="primary" icon={glyph(UserPlus)}>Invite someone</Button>

function Header({ actions = true }: { actions?: boolean }) {
  return (
    <PageHeader title="People" count={PEOPLE.length} focusOnMount={false}
      description="Everyone who can sign in through D3 Auth."
      actions={actions ? invite : undefined} />
  )
}

function Filters({ query, onQuery, shown }: { query: string; onQuery: (q: string) => void; shown: number }) {
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  return (
    <FilterBar aria-label="Filter people" trailing={<span>{shown} of {PEOPLE.length} people</span>}>
      <FormField label="Search">
        <Input type="search" leading={glyph(Search)} placeholder="Name, username or email"
          value={query} onChange={(e) => onQuery(e.target.value)} />
      </FormField>
      <FormField label="Role">
        <Select options={ROLES} value={role} onValueChange={setRole} />
      </FormField>
      <SegmentedControl aria-label="Status" items={STATUSES} value={status} onValueChange={setStatus} />
    </FilterBar>
  )
}

function PersonRow({ person }: { person: Person }) {
  const locked = person.kind === 'owner'
  return (
    <DataListRow
      leading={<Avatar name={person.name} size="sm" decorative />}
      title={<Link href={`#people/${person.id}`}>{person.name}</Link>}
      description={`@${person.username} · ${person.email}`}
      meta={<>
        {person.status === 'suspended' ? <Badge size="sm" tone="danger">Suspended</Badge> : null}
        {person.kind === 'guest' ? null : <Badge size="sm">{person.kind === 'owner' ? 'Owner' : 'Admin'}</Badge>}
        <span>{person.lastSignIn}</span>
      </>}
      actions={locked ? undefined : <>
        <Button size="sm">{person.status === 'suspended' ? 'Let back in' : 'Suspend'}</Button>
        <Menu>
          <MenuTrigger>
            <IconButton size="sm" label={`More actions for ${person.name}`} icon={glyph(Ellipsis)} />
          </MenuTrigger>
          <MenuContent align="end">
            <MenuItem>{person.kind === 'admin' ? 'Make a guest' : 'Make an admin'}</MenuItem>
            <MenuItem>Sign out everywhere</MenuItem>
            <MenuItem tone="danger">Reset their account…</MenuItem>
          </MenuContent>
        </Menu>
      </>}
    />
  )
}

function PeopleList({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const q = query.trim().toLowerCase()
  const shown = PEOPLE.filter((p) => !q || [p.name, p.username, p.email].some((v) => v.toLowerCase().includes(q)))
  return (
    <>
      <Filters query={query} onQuery={setQuery} shown={shown.length} />
      <Card>
        <DataList aria-label="People" empty={
          <EmptyState kind="no-results" size="inline" heading={`No one matches “${query.trim()}”`}
            action={<Button size="sm" onClick={() => setQuery('')}>Clear filters</Button>}>
            Search looks at names, usernames and email addresses.
          </EmptyState>
        }>
          {shown.map((p) => <PersonRow key={p.id} person={p} />)}
        </DataList>
      </Card>
    </>
  )
}

export const Loaded: Story = {
  render: () => (
    <ConsoleFrame current="people">
      <Page>
        <Header />
        <PeopleList />
      </Page>
    </ConsoleFrame>
  ),
}

/**
 * The header is real — the title and the action do not depend on the data.
 * The rows are skeletons the shape of rows, inside the Page, in the card the
 * list will fill.
 */
export const Loading: Story = {
  render: () => (
    <ConsoleFrame current="people">
      <Page aria-busy="true">
        <Header />
        <Card>
          <DataList aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <DataListRow key={i}
                leading={<Skeleton variant="circle" width={24} height={24} />}
                title={<Skeleton variant="text" width={['9rem', '7rem', '11rem', '8rem', '10rem'][i]} />}
                description={<Skeleton variant="text" width={['16rem', '14rem', '19rem', '12rem', '15rem'][i]} />}
                meta={<Skeleton variant="text" width="5rem" />} />
            ))}
          </DataList>
        </Card>
      </Page>
    </ConsoleFrame>
  ),
}

/** Nothing exists yet. The empty state explains the list and carries the one primary. */
export const Empty: Story = {
  render: () => (
    <ConsoleFrame current="groups">
      <Page>
        <PageHeader title="Groups" count={0} focusOnMount={false}
          description="People who get the same access, managed together." />
        <Card>
          <EmptyState kind="empty" heading="No groups yet" headingLevel={2}
            icon={<UsersRound size={24} strokeWidth={1.6} aria-hidden />}
            action={<Button variant="primary">Create a group</Button>}>
            Make one when two people need the same apps. Access given to a group reaches everyone in it.
          </EmptyState>
        </Card>
      </Page>
    </ConsoleFrame>
  ),
}

/** Things exist; this filter matched none of them. The filters stay, so the fix is where the problem is. */
export const NoResults: Story = {
  name: 'No results',
  render: () => (
    <ConsoleFrame current="people">
      <Page>
        <Header />
        <PeopleList initialQuery="zoë" />
      </Page>
    </ConsoleFrame>
  ),
}

/** The server said no. The page says who can say yes — not a blank list, and not a redirect. */
export const NoAccess: Story = {
  name: 'No access',
  render: () => (
    <ConsoleFrame current="people">
      <Page>
        <PageHeader title="People" focusOnMount={false} />
        <EmptyState kind="no-access" headingLevel={2} heading="Managing people is for admins">
          Your account can sign in to apps, but not change who else can. Matt Demers, the owner, can make you an admin.
        </EmptyState>
      </Page>
    </ConsoleFrame>
  ),
}
