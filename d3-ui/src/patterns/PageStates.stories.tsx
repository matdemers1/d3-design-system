import type { Meta, StoryObj } from '@storybook/react'
import { KeyRound, RotateCw } from 'lucide-react'
import {
  Alert, Badge, Button, DataList, DataListRow, DescriptionItem, DescriptionList, EmptyState, Grid, Page, PageHeader,
  Section, Skeleton,
} from '../index'
import { ConsoleFrame } from './console'

const meta = {
  title: 'Patterns/Page states',
  parameters: {
    layout: 'fullscreen',
    canvas: 'app',
    docs: {
      story: { inline: false, iframeHeight: 760 },
      description: { component: `
Every page has more states than *loaded*. They all render **inside the \`Page\`**, in the frame, so
the sidebar never disappears and the state sits where the content will.

#### Loading
- **Do** render what you already know — the title, the header's action — and skeletons **shaped like the content**: tiles for tiles, rows for rows.
- **Do** mark the region \`aria-busy\`, and let the skeletons be \`aria-hidden\` (they are).
- **Don't** use a spinner over a blank page, or one tall grey block full width against the window.

#### Error — the page could not load
- **Do** keep the \`PageHeader\`, then an \`Alert tone="danger"\` saying what failed and what is still working, with *Try again* as its action.
- **Don't** render the page's content empty beneath it. Nothing is known; showing zeros is showing something false.

#### Denied
- **Do** use \`EmptyState kind="no-access"\`, and name who can grant it.
- **Don't** redirect to Home, or show an empty list. Both say "there is nothing here", which is not what happened.

#### Empty
- **Do** use \`EmptyState kind="empty"\`: what this page is for, and the action that fills it (see *List page*).

#### Where Alerts sit
- **Do** put an Alert **at the top of the region it concerns**: the page's header for the page, a Section's body for that Section, a Card's form for that form.
- **Do** use \`dynamic\` on an Alert that appears after something the person did, so it is announced.
- **Don't** float Alerts between cards, stack them at the top of the page for problems lower down, or use a toast for something that needs doing.
- **Don't** use an Alert for a state — a suspended person, a disabled app. That is a \`Badge\` on the thing.
` },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function KeysHeader({ actions = true }: { actions?: boolean }) {
  return (
    <PageHeader title="Keys" focusOnMount={false}
      description="The keys that sign every token. Rotate on a schedule, or at once if one may be exposed."
      actions={actions ? <Button variant="primary" icon={<RotateCw size={16} strokeWidth={1.8} aria-hidden />}>Rotate now</Button> : undefined} />
  )
}

/** What is known renders; what is not yet known is a skeleton in its shape. */
export const Loading: Story = {
  render: () => (
    <ConsoleFrame current="keys">
      <Page aria-busy="true">
        <KeysHeader />
        <Grid minItemWidth="md" aria-hidden="true">
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="block" height="7.5rem" />)}
        </Grid>
        <Skeleton variant="block" height="16rem" aria-hidden="true" />
      </Page>
    </ConsoleFrame>
  ),
}

/** The request failed. The header stays; the Alert says what failed, what still works, and offers the retry. */
export const LoadFailed: Story = {
  name: 'Error',
  render: () => (
    <ConsoleFrame current="keys">
      <Page>
        <KeysHeader actions={false} />
        <Alert tone="danger" title="The keys could not load" actions={<Button size="sm">Try again</Button>}>
          The console could not reach the server. Sign-in is not affected — apps keep verifying tokens with the keys they already have.
        </Alert>
      </Page>
    </ConsoleFrame>
  ),
}

/** The server refused. Say so, and say who can change it. */
export const Denied: Story = {
  render: () => (
    <ConsoleFrame current="keys">
      <Page>
        <KeysHeader actions={false} />
        <EmptyState kind="no-access" headingLevel={2} heading="Keys are the owner’s"
          icon={<KeyRound size={24} strokeWidth={1.6} aria-hidden />}>
          Rotating a key signs everyone out of every app, so only the owner can. Ask Alex Rivera if a key needs rotating.
        </EmptyState>
      </Page>
    </ConsoleFrame>
  ),
}

/**
 * Two Alerts, each at the top of the region it is about: the page-level one
 * under the header, the Section's inside the Section.
 */
export const AlertsInPlace: Story = {
  name: 'Alerts in place',
  render: () => (
    <ConsoleFrame current="keys">
      <Page>
        <KeysHeader />
        <Alert tone="warning" title="The current key is older than 90 days">
          Rotating signs nobody out: tokens signed by the old key stay valid until they expire.
        </Alert>
        <Section title="Signing keys" description="The newest key signs; older keys still verify until they are retired.">
          <DataList aria-label="Signing keys">
            <DataListRow leading={<KeyRound size={20} strokeWidth={1.6} aria-hidden />}
              title={<code>2026-06 · ES256</code>} description="Created 14 June 2026 · kid 7f3a91c2"
              meta={<><Badge size="sm" tone="attention">Signing</Badge><span>94 days old</span></>} />
            <DataListRow leading={<KeyRound size={20} strokeWidth={1.6} aria-hidden />}
              title={<code>2026-03 · ES256</code>} description="Created 12 March 2026 · kid 2b8e04d9"
              meta={<><Badge size="sm">Verifying</Badge><span>Retires 1 Oct</span></>}
              actions={<Button size="sm" variant="danger-ghost">Retire now</Button>} />
          </DataList>
        </Section>
        <Section title="Rotation schedule" description="A new key is made on the first of the month; the old one keeps verifying for 30 days.">
          <Alert tone="danger" title="The last scheduled rotation failed">
            On 1 September the server could not write the new key: “EACCES /data/keys”. Fix the volume’s permissions; the next attempt is on 1 October.
          </Alert>
          <DescriptionList>
            <DescriptionItem term="Rotate every" numeric>90 days</DescriptionItem>
            <DescriptionItem term="Keep verifying for" numeric>30 days</DescriptionItem>
            <DescriptionItem term="Next rotation" numeric>1 October 2026, 02:00</DescriptionItem>
          </DescriptionList>
        </Section>
      </Page>
    </ConsoleFrame>
  ),
}
