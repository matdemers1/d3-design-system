import type { Meta, StoryObj } from '@storybook/react'
import {
  Badge, DataList, DataListRow, DescriptionItem, DescriptionList, Grid, Link, Page, PageHeader, Section,
} from '../index'
import { ConsoleFrame, EVENTS } from './console'

const meta = {
  title: 'Patterns/Dashboard',
  parameters: {
    layout: 'fullscreen',
    canvas: 'app',
    docs: {
      story: { inline: false, iframeHeight: 1000 },
      description: { component: `
The front page of an app: how it is doing, and what needs someone. **\`Page\` → \`PageHeader\` →
a \`Grid\` of status tiles → counts and recent activity.**

#### Status tiles
- **Do** make each tile a \`Section\` on a card (\`headingLevel={3}\`, inside a plain *Status* Section), titled with the thing — *Mail*, *Backups* — and **say what is true and what to do** in its description: "The last test failed: the relay answered 401."
- **Do** give a tile a \`Badge\` beside its title and a link to the fix **only** when it needs someone. A healthy tile is a quiet sentence with a fact in it ("Rotated 8 days ago").
- **Do** order tiles by what needs attention first, and keep their number to a full row or two of the Grid.
- **Don't** reduce a tile to *OK* / *Attention*, or a green tick. "Never tested" is more useful than a tick that means nothing.
- **Don't** colour a healthy tile. Hue is spent on what needs you (D-016); five green cards teach people to ignore colour.

#### Counts
- **Do** use a \`DescriptionList\` with \`numeric\` values, and make the **term** the link to the list it counts. A link alone in its cell needs no underline; a link inside a sentence does (axe: \`link-in-text-block\`).
- **Don't** draw a chart for a handful of numbers.

#### Recent activity
- **Do** show a handful of rows in a \`DataList\`, written as sentences ("Priya Raman was given access to Bindery"), with the event name as detail and a link to the full list in the Section's \`actions\`.
- **Don't** paginate on the dashboard. It is a glance; the audit page is the record.
` },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const SENTENCES: Record<string, string> = {
  e1: 'Priya Raman was given access to Bindery',
  e2: 'Jonah Whitaker was signed out of his iPhone',
  e3: 'The signing key was rotated',
  e4: 'Elena Vasquez was suspended',
  e5: 'Someday Vault admin was registered',
}

function Home() {
  return (
    <ConsoleFrame current="home">
      <Page>
        <PageHeader title="Home" focusOnMount={false} description="How this instance is doing, and what needs you." />

        <Section surface="plain" title="Status" description="Anything that needs you comes first.">
          <Grid minItemWidth="md">
            <Section title={<>Mail <Badge size="sm" tone="danger">Not sending</Badge></>} headingLevel={3}
              description="The last test failed: the relay answered 401. Invites and resets are not arriving.">
              <Link href="#settings">Check the relay secret</Link>
            </Section>
            <Section title={<>Backups <Badge size="sm" tone="attention">Overdue</Badge></>} headingLevel={3}
              description="The nightly backup last finished 3 days ago, on 13 September at 02:00.">
              <Link href="#backups">Open the backup log</Link>
            </Section>
            <Section title={<>Invites <Badge size="sm" tone="attention">1 expiring</Badge></>} headingLevel={3}
              description="2 are waiting. The one for tom.okafor@example.org expires tomorrow.">
              <Link href="#people">Resend or let it lapse</Link>
            </Section>
            <Section title="Signing keys" headingLevel={3} description="Rotated 8 days ago. The next rotation is automatic, on 1 October." />
            <Section title="Database" headingLevel={3} description="Reachable in 14 ms. 212 MB of 10 GB used." />
            <Section title="Schema" headingLevel={3} description="Up to date at revision 0042, applied 16 September." />
          </Grid>
        </Section>

        <Grid minItemWidth="lg">
          <Section title="Counts">
            <DescriptionList>
              <DescriptionItem term={<Link href="#people">People</Link>} numeric>6 · 2 invites waiting</DescriptionItem>
              <DescriptionItem term={<Link href="#apps">Apps</Link>} numeric>4 · 1 disabled</DescriptionItem>
              <DescriptionItem term={<Link href="#groups">Groups</Link>} numeric>3</DescriptionItem>
              <DescriptionItem term={<Link href="#sessions">Sessions</Link>} numeric>41 signed in</DescriptionItem>
              <DescriptionItem term="Sign-ins today" numeric>27 · 2 failed</DescriptionItem>
              <DescriptionItem term={<Link href="#keys">Signing keys</Link>} numeric>2 · 1 signing</DescriptionItem>
            </DescriptionList>
          </Section>
          <Section title="Recent activity" actions={<Link href="#audit">Audit trail</Link>}>
            <DataList aria-label="Recent activity">
              {EVENTS.map((e) => (
                <DataListRow key={e.id} title={SENTENCES[e.id]} description={<>{e.actor} · <code>{e.event}</code></>}
                  meta={<span>{e.at}</span>} />
              ))}
            </DataList>
          </Section>
        </Grid>
      </Page>
    </ConsoleFrame>
  )
}

export const Default: Story = { render: () => <Home /> }
