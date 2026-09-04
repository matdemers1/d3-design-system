import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardTitle, CardBody, CardFooter } from './Card'
import { Button } from '../Button/Button'
import { Badge } from '../Badge/Badge'

const meta = {
  title: 'Layers/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: { padding: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: {
    children: (
      <>
        <CardTitle>Export fails silently on files over 50 MB</CardTitle>
        <CardBody>Reported by 4 people · Acme Corp</CardBody>
      </>
    ),
  },
  parameters: { docs: { description: { component:
    'A grouped region on a surface. The simplest component in v1 and the most duplicated in the ' +
    'codebase — **Bindery alone has 243 distinct card recipes**.\n\n' +
    'No border, no shadow: a card is a tone step above its ground. Selection is a fill, not a ' +
    'ring.\n\n' +
    '**A card is either wholly clickable or it contains actions — never both.** A control inside a ' +
    'control is unreachable in some screen-reader modes and takes the card’s whole text as its ' +
    'name. Bindery’s archive rows and App C’s kanban cards are both currently the ' +
    'forbidden shape, so `interactive` warns in development if it finds a nested control.' } } },
  decorators: [(S) => <div style={{ width: 340 }}><S /></div>],
} satisfies Meta<typeof Card>
export default meta
type Story = StoryObj<typeof meta>

export const Plain: Story = {}
export const Interactive: Story = { args: { interactive: true, href: '#' } }
export const Selected: Story = { args: { selected: true } }
export const Padding: Story = {
  parameters: { controls: { disable: true } },
  decorators: [(S) => <div style={{ width: 340 }}><S /></div>],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Card padding="sm"><CardBody>sm — 16px</CardBody></Card>
      <Card padding="md"><CardBody>md — 20px</CardBody></Card>
      <Card padding="lg"><CardBody>lg — 24px</CardBody></Card>
    </div>
  ),
}
export const WithActions: Story = {
  name: 'With actions — not clickable',
  parameters: { controls: { disable: true } },
  decorators: [(S) => <div style={{ width: 340 }}><S /></div>],
  render: () => (
    <Card>
      <CardTitle>Offsite replication</CardTitle>
      <CardBody>Runs nightly at 03:00 and writes an encrypted dump to your S3 bucket.</CardBody>
      <CardFooter>
        <Button size="sm">Run now</Button>
        <Button size="sm" variant="ghost">View ledger</Button>
        <Badge size="sm" style={{ marginLeft: 'auto' }}>Healthy</Badge>
      </CardFooter>
    </Card>
  ),
}
