import type { Meta, StoryObj } from '@storybook/react'
import { Grid } from './Grid'
import { Card, CardBody, CardTitle } from '../Card/Card'
import { Badge } from '../Badge/Badge'
import { Cluster } from '../Stack/Cluster'

const meta = {
  title: 'Layout/Grid',
  component: Grid,
  tags: ['autodocs'],
  argTypes: { minItemWidth: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: { minItemWidth: 'sm' },
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component:
      'Tiles of equal width that reflow on the 24px grid gutter. `minItemWidth` is the narrowest ' +
      'a tile may be — `sm` 16rem, `md` 20rem, `lg` 24rem — and when a row cannot fit another, a ' +
      'column drops rather than every tile shrinking. **One column below `md`**, whatever the ' +
      'minimum (D-021).\n\n' +
      'Not a 12-column system: no spans, no per-breakpoint counts. An asymmetric page composes ' +
      'Stacks (D-068).' } },
  },
} satisfies Meta<typeof Grid>
export default meta
type Story = StoryObj<typeof meta>

const TILES = [
  { name: 'Database', ok: true, detail: 'Reachable. Last migration applied 2 days ago.' },
  { name: 'Signing keys', ok: true, detail: 'One active key, rotated 41 days ago.' },
  { name: 'Mail', ok: false, detail: 'The last test send failed. Invites are not arriving — check the relay URL.' },
  { name: 'Schema', ok: true, detail: 'Up to date.' },
  { name: 'Backups', ok: false, detail: 'Never tested. Run a restore drill before you rely on them.' },
]

export const StatusTiles: Story = {
  render: (args) => (
    <div style={{ padding: 'var(--space-24)', width: '100%' }}>
      <Grid {...args} as="ul">
        {TILES.map((t) => (
          <Card as="li" key={t.name}>
            <Cluster justify="between" align="baseline">
              <CardTitle as="h2">{t.name}</CardTitle>
              {t.ok ? <Badge>OK</Badge> : <Badge tone="danger">Needs you</Badge>}
            </Cluster>
            <CardBody>{t.detail}</CardBody>
          </Card>
        ))}
      </Grid>
    </div>
  ),
}

export const WiderTiles: Story = {
  name: 'minItemWidth="md"',
  args: { minItemWidth: 'md' },
  render: StatusTiles.render,
}

/** Two tiles in a wide row stretch to share it. */
export const FewTiles: Story = {
  render: (args) => (
    <div style={{ padding: 'var(--space-24)', width: '100%' }}>
      <Grid {...args}>
        <Card><CardTitle>People</CardTitle><CardBody>12 can sign in.</CardBody></Card>
        <Card><CardTitle>Apps</CardTitle><CardBody>4 registered.</CardBody></Card>
      </Grid>
    </div>
  ),
}
