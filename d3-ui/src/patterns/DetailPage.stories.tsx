import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AppWindow, ArrowLeft, Laptop, Smartphone } from 'lucide-react'
import {
  Badge, Button, DataList, DataListRow, DescriptionItem, DescriptionList, Link, Modal, ModalClose, Page,
  PageHeader, Section,
} from '../index'
import { ConsoleFrame, PEOPLE } from './console'

const meta = {
  title: 'Patterns/Detail page',
  parameters: {
    layout: 'fullscreen',
    canvas: 'app',
    docs: {
      story: { inline: false, iframeHeight: 900 },
      description: { component: `
One thing — a person, an app, a key — and everything about it. **\`Page width="narrow"\`
→ \`PageHeader\` with \`back\` → \`Section\`s: facts, then related lists, then the danger zone.**

#### The header
- **Do** make the title **the object's name** — *Priya Raman*, not *Person details* (D-034).
- **Do** give it one named back link to the list it came from — *People*, never *Back*, never a breadcrumb.
- **Do** put the object's state beside its name in \`description\` when it changes what you can do (*Suspended*).
- **Don't** put destructive actions in the header. They go last, in the danger zone.

#### The sections
- **Do** open with the facts as a \`DescriptionList\` — term, value; tabular figures for numbers and dates. Edit lives in that Section's \`actions\`.
- **Do** follow with related lists — access, sessions, members — each a \`Section\` holding a \`DataList\`, its add action in the Section's \`actions\`.
- **Do** write a \`description\` on a Section when an action in it has a consequence people miss ("Removing access signs her out of that app").
- **Don't** set key/value pairs as \`DataList\` rows, or wrap the whole page in one Card. A Section is the card.

#### The danger zone
- **Do** make it the **last** Section, titled for what is in it, one row per action: what it does in a sentence, and a \`danger-ghost\` button naming the object ("Delete Priya Raman").
- **Do** open a \`Modal destructive\` for anything that cannot be undone (see *Confirmation*).
- **Don't** turn the button into "Yes, really" on the first click. A second inline button is a confirmation nobody reads, in a place a double-click reaches.
` },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const person = PEOPLE[2]!
const glyph = (I: typeof AppWindow) => <I size={20} strokeWidth={1.6} aria-hidden />

function DeletePerson({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Modal
      destructive
      open={open}
      onOpenChange={setOpen}
      trigger={<Button size="sm" variant="danger-ghost">Delete {person.name}</Button>}
      title={`Delete ${person.name}?`}
      description={`She can no longer sign in to Bindery or Murmur, and her passkey and sessions are removed. The audit trail keeps her name. This cannot be undone.`}
      footer={<>
        <ModalClose><Button>Keep {person.name.split(' ')[0]}</Button></ModalClose>
        <Button variant="danger" onClick={() => setOpen(false)}>Delete {person.name}</Button>
      </>}
    />
  )
}

function PersonDetail({ confirming = false }: { confirming?: boolean }) {
  return (
    <ConsoleFrame current="people">
      <Page width="narrow">
        <PageHeader
          focusOnMount={false}
          back={<Link variant="muted" href="#people"><ArrowLeft size={14} strokeWidth={2} aria-hidden />People</Link>}
          title={person.name}
          description={`Guest · ${person.email}`}
        />

        <Section title="Profile" actions={<Button size="sm">Edit profile</Button>}>
          <DescriptionList>
            <DescriptionItem term="Username"><code>{person.username}</code></DescriptionItem>
            <DescriptionItem term="Email">{person.email}</DescriptionItem>
            <DescriptionItem term="Role"><Badge size="sm">Guest</Badge></DescriptionItem>
            <DescriptionItem term="Signs in with">{person.factors}</DescriptionItem>
            <DescriptionItem term="Last signed in" numeric>{person.lastSignIn}</DescriptionItem>
            <DescriptionItem term="Joined" numeric>3 March 2026, from an invite by Alex Rivera</DescriptionItem>
          </DescriptionList>
        </Section>

        <Section title="App access"
          description="Removing access signs her out of that app everywhere."
          actions={<Button size="sm">Give access</Button>}>
          <DataList aria-label="App access">
            <DataListRow leading={glyph(AppWindow)} title={<Link href="#apps/bindery">Bindery</Link>}
              description="Roles: reader, uploader" meta={<span>Since 3 Mar</span>}
              actions={<Button size="sm" variant="ghost">Remove</Button>} />
            <DataListRow leading={glyph(AppWindow)} title={<Link href="#apps/murmur">Murmur</Link>}
              description="Through the group Northfield Studio" meta={<span>Since 11 Jun</span>}
              actions={<Button size="sm" variant="ghost">Manage group</Button>} />
          </DataList>
        </Section>

        <Section title="Sessions" actions={<Button size="sm">Sign out everywhere</Button>}>
          <DataList aria-label="Sessions">
            <DataListRow leading={glyph(Laptop)} title="Firefox on macOS" description="Edinburgh · 81.2.69.160"
              meta={<Badge size="sm">Active now</Badge>} actions={<Button size="sm" variant="ghost">Sign out</Button>} />
            <DataListRow leading={glyph(Smartphone)} title="Burrow on iPhone" description="Glasgow · 2a02:c7c:5d10::1"
              meta={<span>Yesterday, 17:55</span>} actions={<Button size="sm" variant="ghost">Sign out</Button>} />
          </DataList>
        </Section>

        <Section title="Reset or delete">
          <DataList aria-label="Reset or delete">
            <DataListRow truncate={false} title="Reset her account"
              description="Removes her password, passkey and authenticator. She sets them up again from an emailed link."
              actions={<Button size="sm" variant="danger-ghost">Reset account</Button>} />
            <DataListRow truncate={false} title="Delete her permanently"
              description="Removes her and all of her access. Cannot be undone."
              actions={<DeletePerson defaultOpen={confirming} />} />
          </DataList>
        </Section>
      </Page>
    </ConsoleFrame>
  )
}

export const Loaded: Story = { render: () => <PersonDetail /> }

/** The delete button opened a `Modal destructive`. It names the person twice and says what cannot come back. */
export const ConfirmingDelete: Story = {
  name: 'Confirming delete',
  render: () => <PersonDetail confirming />,
}
