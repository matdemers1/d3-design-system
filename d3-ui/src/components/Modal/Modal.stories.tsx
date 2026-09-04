import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Modal, ModalClose } from './Modal'
import { Button } from '../Button/Button'
import { FormField } from '../FormField/FormField'
import { Select } from '../Select/Select'

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
          <ModalClose asChild><Button variant="ghost">Cancel</Button></ModalClose>
          <ModalClose asChild><Button variant="danger">Dismiss 3 items</Button></ModalClose>
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
            <ModalClose asChild><Button variant="ghost">Cancel</Button></ModalClose>
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
