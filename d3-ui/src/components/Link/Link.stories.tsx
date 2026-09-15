import type { Meta, StoryObj } from '@storybook/react'
import { ExternalLink } from 'lucide-react'
import { Link } from './Link'

const meta = {
  title: 'Primitives/Link',
  component: Link,
  tags: ['autodocs'],
  args: { href: '#', children: 'Open in Bindery' },
  argTypes: { variant: { control: 'inline-radio', options: ['standalone', 'inline', 'muted'] } },
  parameters: { docs: { description: { component:
    'Navigation. **A link goes somewhere, a button does something** — the line the apps blur most ' +
    'often. `href` is required; an element without one is not a link.\n\n' +
    '`:visited` is deliberately unstyled in-app: a visited colour leaks which records a user has ' +
    'opened — in Bindery which documents were read, in App A which complaints were seen.' } } },
} satisfies Meta<typeof Link>
export default meta
type Story = StoryObj<typeof meta>

export const Standalone: Story = {}
export const Inline: Story = {
  args: { variant: 'inline' },
  render: (args) => (
    <p style={{ fontSize: 13.5, color: 'var(--color-fg-muted)', maxWidth: '48ch', lineHeight: 1.6 }}>
      Offsite replication runs nightly and writes an encrypted dump to your{' '}
      <Link {...args}>S3 bucket</Link>. Inside prose a link is always underlined — colour alone is
      not an affordance.
    </p>
  ),
}
export const Muted: Story = { args: { variant: 'muted', children: 'Skip to content' } }
export const External: Story = {
  args: { external: true, children: 'Trust report', externalIcon: <ExternalLink size={12} strokeWidth={2} /> },
  parameters: { docs: { description: { story:
    'Adds `rel="noopener noreferrer"`, a trailing glyph, and “(opens in a new tab)” to the ' +
    'accessible name — visible and programmatic, not one or the other.' } } },
}

/**
 * A router's own link, styled by the system. A plain `<a href>` reloads the
 * whole page under a client router — which is why, before `asChild`, Link had
 * no possible use in Bindery, whose every internal link is a router link.
 */
export const AsARouterLink: Story = {
  render: () => {
    // Stands in for react-router's <Link to>: it renders an anchor and handles
    // the click itself.
    const RouterLink = ({ to, ...rest }: { to: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a href={to} onClick={(e) => e.preventDefault()} {...rest} />
    )
    return (
      <p style={{ fontSize: 13 }}>
        Three files are waiting on the{' '}
        <Link asChild variant="inline"><RouterLink to="/pipeline">Pipeline</RouterLink></Link> screen.
      </p>
    )
  },
}

