import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ArrowLeft } from 'lucide-react'
import {
  Button, DataList, DataListRow, DescriptionItem, DescriptionList, FormField, Input, Link, Modal, ModalClose, Page,
  PageHeader, Section,
} from '../index'
import { ConsoleFrame } from './console'

const meta = {
  title: 'Patterns/Confirmation',
  parameters: {
    layout: 'fullscreen',
    canvas: 'app',
    docs: {
      story: { inline: false, iframeHeight: 760 },
      description: { component: `
Asking before doing something that cannot be taken back. **A \`Modal destructive\`, opened by a
\`danger-ghost\` button that names the object.**

#### When to confirm
| The action | Confirm? |
|---|---|
| Cannot be undone — delete, reset, rotate a key out | **Yes**, in a \`Modal destructive\` |
| Undoable, but breaks something for other people right now — disable an app everyone signs in to | **Yes** |
| Undoable, and the undo is on the same screen — suspend, remove a role | **No.** Do it, and say what happened |
| Wide blast radius *and* irreversible — delete an app with people signed in | **Yes, and type its name** |
- **Don't** confirm everything. A dialog on every click is a dialog people learn to dismiss without reading, including the one that mattered.

#### Wording
- **Do** title it as the action and the object, as a question: *Delete Priya Raman?* — never *Are you sure?* or *Confirm*.
- **Do** say in \`description\` exactly what goes, what stays, and that it cannot be undone.
- **Do** label the destructive button with the same verb and object as the title: *Delete Priya Raman*. The cancel button says what keeping it means: *Keep Priya*, or *Cancel*.
- **Don't** use *OK* / *Yes* / *No*. A button should make sense read on its own.

#### Mechanics
- **Do** use \`destructive\`. The scrim does not close it, and focus lands on the panel, not the destructive button, so Enter on a freshly opened dialog destroys nothing.
- **Do** put cancel first and the \`danger\` button last. Focus returns to the trigger on close.
- **Don't** confirm with a second inline button ("Reset" → "Yes, reset their account"). It moves under the pointer, so a double-click is a confirmation, and there is no room to say what will happen.
- **Don't** open a confirmation from a menu item and keep the menu open behind it — select the item, close the menu, open the Modal.
` },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function AppPage({ children }: { children: React.ReactNode }) {
  return (
    <ConsoleFrame current="apps">
      <Page width="narrow">
        <PageHeader focusOnMount={false} title="Bindery" description="Web app with a client secret"
          back={<Link variant="muted" href="#apps"><ArrowLeft size={14} strokeWidth={2} aria-hidden />Apps</Link>} />
        <Section title="Details">
          <DescriptionList>
            <DescriptionItem term="Client ID"><code>bindery</code></DescriptionItem>
            <DescriptionItem term="Redirect URI"><code>https://bindery.d3cloud.io/auth/callback</code></DescriptionItem>
            <DescriptionItem term="People with access" numeric>4</DescriptionItem>
          </DescriptionList>
        </Section>
        <Section title="Disable or delete">
          <DataList aria-label="Disable or delete">
            <DataListRow truncate={false}
              title="Disable sign-in"
              description="Nobody can sign in to Bindery until you turn it back on. Existing sessions end."
              actions={<Button size="sm" variant="danger-ghost">Disable Bindery</Button>} />
            <DataListRow truncate={false}
              title="Delete permanently"
              description="Removes the app, its secret and every grant. Cannot be undone."
              actions={children} />
          </DataList>
        </Section>
      </Page>
    </ConsoleFrame>
  )
}

function DeleteApp({ defaultOpen }: { defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const [typed, setTyped] = useState('')
  const matches = typed.trim() === 'bindery'
  return (
    <Modal
      destructive
      size="lg"
      open={open}
      onOpenChange={(next) => { setOpen(next); if (!next) setTyped('') }}
      trigger={<Button size="sm" variant="danger-ghost">Delete Bindery</Button>}
      title="Delete Bindery?"
      description="4 people lose access and are signed out of Bindery now. Its client secret stops working, and every grant is removed. The audit trail is kept. This cannot be undone."
      footer={<>
        <ModalClose><Button>Keep Bindery</Button></ModalClose>
        <Button variant="danger" disabled={!matches} onClick={() => setOpen(false)}>Delete Bindery</Button>
      </>}
    >
      <FormField label="Type bindery to confirm" help="The app’s client ID.">
        <Input autoComplete="off" spellCheck={false} value={typed} onChange={(e) => setTyped(e.target.value)} />
      </FormField>
    </Modal>
  )
}

/** Open: the page behind is inert, the scrim does not close it, and the delete button waits for the name. */
export const Open: Story = {
  render: () => <AppPage><DeleteApp defaultOpen /></AppPage>,
}

/** Closed: the trigger is a `danger-ghost` button in the danger zone, naming the object. */
export const Trigger: Story = {
  render: () => <AppPage><DeleteApp defaultOpen={false} /></AppPage>,
}
