import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Modal, ModalClose } from './Modal'
import { Button } from '../Button/Button'
import { FormField } from '../FormField/FormField'
import { Select } from '../Select/Select'

// Below 600px a Modal is a bottom sheet, so those stories are judged at 390px.
const PHONE = { phone: { name: 'Phone 390', styles: { width: '390px', height: '844px' }, type: 'mobile' as const } }

const LONG_BODY = (
  <>
    {Array.from({ length: 12 }, (_, i) => (
      <p key={i} style={{ margin: '0 0 12px', fontSize: 13, lineHeight: '20px' }}>
        Run {i + 1} of the nightly replication finished with warnings: 14 objects were skipped because
        they changed while the snapshot was being taken, and will be picked up on the next pass.
      </p>
    ))}
  </>
)

const meta = {
  title: 'Layers/Modal',
  component: Modal,
  tags: ['autodocs'],
  args: { title: 'Dismiss 3 items',
    description: 'They leave the inbox and stay searchable. This can be undone from the audit log.' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  parameters: { docs: { description: { component:
    'A focused task that interrupts the page.\n\n' +
    'Built on Radix Dialog: focus trap, scroll lock, Escape, `aria-modal` and focus return are ' +
    'not things to re-implement per app. **App B hand-rolled four dialogs and not one has a ' +
    'role, a focus trap, an Escape handler or focus return** — a keyboard user tabs straight out ' +
    'into the page behind.\n\n' +
    'Never nest a modal in a modal. The title names the action, not the object type. The ' +
    'description states the consequence and whether it is reversible.' } } },
} satisfies Meta<typeof Modal>
export default meta
type Story = StoryObj<typeof meta>

export const Confirmation: Story = {
  args: { size: 'sm', destructive: true },
  render: (args) => (
    <Modal
      {...args}
      trigger={<Button variant="danger-ghost">Dismiss 3 items</Button>}
      footer={
        <>
          <ModalClose><Button variant="ghost">Cancel</Button></ModalClose>
          <ModalClose><Button variant="danger">Dismiss 3 items</Button></ModalClose>
        </>
      }
    />
  ),
  parameters: { docs: { description: { story:
    'Destructive: the scrim does not dismiss it, and focus does not land on the destructive ' +
    'button. The confirming button repeats the object and the count — the count is the last ' +
    'chance to notice the wrong rows are selected.' } } },
}

export const WithAForm: Story = {
  render: (args) => {
    const [reason, setReason] = useState<string>()
    return (
      <Modal
        {...args}
        trigger={<Button variant="danger-ghost">Dismiss 3 items</Button>}
        footer={
          <>
            <ModalClose><Button variant="ghost">Cancel</Button></ModalClose>
            <Button variant="danger" disabled={!reason}>Dismiss 3 items</Button>
          </>
        }
      >
        <FormField label="Reason">
          <Select
            value={reason}
            onValueChange={setReason}
            placeholder="Select a reason"
            options={[
              { value: 'duplicate', label: 'Duplicate' },
              { value: 'wont_fix', label: 'Won’t fix' },
              { value: 'not_a_bug', label: 'Not a bug' },
            ]}
          />
        </FormField>
      </Modal>
    )
  },
}

export const OpenByDefault: Story = {
  args: { open: true, size: 'sm', destructive: true },
  render: (args) => (
    <Modal {...args} footer={<Button variant="danger">Dismiss 3 items</Button>} />
  ),
}

export const RichDescription: Story = {
  args: {
    open: true,
    size: 'sm',
    destructive: true,
    title: 'Remove Ada Lovelace',
    description: (
      <>
        <p>She loses access to <strong>3 apps</strong> at once, and her sessions end.</p>
        <p>Her audit history stays under <code>ada@example.com</code>.</p>
      </>
    ),
  },
  render: (args) => (
    <Modal {...args} footer={<Button variant="danger">Remove Ada Lovelace</Button>} />
  ),
  parameters: { docs: { description: { story:
    '`description` takes rich content — the name in bold, an identifier in mono, two paragraphs. ' +
    'It renders in a `div`, so block content is valid, and remains the dialog\'s accessible description.' } } },
}

export const PhoneSheet: Story = {
  args: { open: true, title: 'Review the nightly run',
    description: 'Read the whole run before you acknowledge it. Acknowledging clears the alert for everyone.' },
  render: (args) => (
    <Modal
      {...args}
      footer={
        <>
          <ModalClose><Button variant="ghost">Cancel</Button></ModalClose>
          <Button>Acknowledge run</Button>
        </>
      }
    >
      {LONG_BODY}
    </Modal>
  ),
  parameters: {
    layout: 'fullscreen',
    viewport: { viewports: PHONE, defaultViewport: 'phone' },
    docs: { description: { story:
      'Below 600px the Modal is a **bottom sheet**: anchored to the bottom edge at full width with ' +
      'rounded top corners and a grabber, rising from the edge. The description and children scroll ' +
      'inside the body while the footer stays pinned, and a close button is visible. The grabber is ' +
      'decorative — the sheet does not drag. From 600px it is the centred dialog it always was.' } },
  },
}

export const PhoneSheetDestructive: Story = {
  args: { open: true, destructive: true, title: 'Dismiss 3 items',
    description: 'They leave the inbox and stay searchable. This can be undone from the audit log.' },
  render: (args) => (
    <Modal
      {...args}
      footer={
        <>
          <ModalClose><Button variant="ghost">Cancel</Button></ModalClose>
          <ModalClose><Button variant="danger">Dismiss 3 items</Button></ModalClose>
        </>
      }
    >
      {LONG_BODY}
    </Modal>
  ),
  parameters: {
    layout: 'fullscreen',
    viewport: { viewports: PHONE, defaultViewport: 'phone' },
    docs: { description: { story:
      'The destructive sheet: the scrim does not dismiss it and focus lands on the panel, not the ' +
      'danger button — but the close button is still there, because leaving without choosing is ' +
      'always allowed.' } },
  },
}
