import type { Meta, StoryObj } from '@storybook/react'
import { Inbox, Search, CircleAlert, Lock } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { Button } from '../Button/Button'

const meta = {
  title: 'Patterns/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: { kind: 'empty', heading: 'Nothing here yet',
    children: 'Feedback you receive through the public portal will appear in this view.' },
  argTypes: {
    kind: { control: 'inline-radio', options: ['empty', 'no-results', 'error', 'no-access'] },
    size: { control: 'inline-radio', options: ['page', 'inline', 'row'] },
  },
  parameters: { docs: { description: { component:
    'What a region says when it has nothing to show.\n\n' +
    '**`kind` is required, and that is the point.** The apps currently render three different ' +
    'situations with the same string — "No items" stands in for *nothing exists yet*, *this ' +
    'filter matched nothing* and *we could not find out*. Those need different words and ' +
    'completely different actions, so the component will not let you skip the distinction.\n\n' +
    '**"No items" is not an empty state.** It is a status code with a capital letter.' } } },
  decorators: [(S) => <div style={{ width: 420 }}><S /></div>],
} satisfies Meta<typeof EmptyState>
export default meta
type Story = StoryObj<typeof meta>

export const FirstRun: Story = {
  args: { kind: 'empty', icon: <Inbox size={24} strokeWidth={1.5} />,
    action: <Button variant="primary">Open the portal</Button> },
}
export const NoResults: Story = {
  args: { kind: 'no-results', icon: <Search size={24} strokeWidth={1.5} />,
    heading: 'No feedback matches “csv export”',
    children: 'Try the All tab, or clear the search to see all 48 items.',
    action: <Button>Clear search</Button> },
  parameters: { docs: { description: { story:
    'Names the query, gives the count that does exist, and offers the way back — against the ' +
    'real string in two apps today, which is "No items".' } } },
}
export const ErrorKind: Story = {
  name: 'Error',
  args: { kind: 'error', icon: <CircleAlert size={24} strokeWidth={1.5} />,
    heading: 'Could not load the inbox', children: 'The request timed out after 30 seconds.',
    action: <Button>Try again</Button> },
  parameters: { docs: { description: { story:
    'Uses `role="status"`, not `role="alert"` — it is rendered as part of the region, not fired ' +
    'at the user mid-task.' } } },
}
export const NoAccess: Story = {
  args: { kind: 'no-access', icon: <Lock size={24} strokeWidth={1.5} />,
    heading: 'You do not have access to this library',
    children: 'Ask an owner to grant you viewer rights.', action: undefined },
  parameters: { docs: { description: { story:
    'No action, because none genuinely exists for this user. No action is better than a fake one.' } } },
}
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  decorators: [(S) => <div style={{ width: 420 }}><S /></div>],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <EmptyState kind="no-results" size="page" icon={<Search size={24} strokeWidth={1.5} />}
        heading="No matches" action={<Button size="sm">Clear</Button>}>
        page — a whole region
      </EmptyState>
      <EmptyState kind="no-results" size="inline" icon={<Search size={20} strokeWidth={1.6} />}
        heading="No matches" action={<Button size="sm" variant="ghost">Clear</Button>}>
        inline — inside a card or table body
      </EmptyState>
      <EmptyState kind="no-results" size="row" icon={<Search size={20} strokeWidth={1.6} />}
        heading="No matches" action={<Button size="sm" variant="ghost">Clear</Button>}>
        row — when vertical space is scarce
      </EmptyState>
    </div>
  ),
}
