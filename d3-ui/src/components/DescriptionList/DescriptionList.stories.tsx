import type { Meta, StoryObj } from '@storybook/react'
import { DescriptionItem, DescriptionList } from './DescriptionList'
import { Badge } from '../Badge/Badge'
import { Link } from '../Link/Link'
import { Cluster } from '../Stack/Cluster'
import { Section } from '../Section/Section'

const meta = {
  title: 'Lists/DescriptionList',
  component: DescriptionList,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component:
    'Terms and their values — the facts about one thing. A real `<dl>`, so the pairing is ' +
    'announced.\n\n' +
    'Two columns from `sm`: the term column is a third of the width up to 14rem, and a long term ' +
    'wraps inside it. Stacked below `sm`. Values hold text, Badges, Links or `code`, and a long ' +
    'unbroken value (a redirect URI) wraps instead of overflowing.\n\n' +
    '`numeric` on an item gives it tabular figures (D-019).' } } },
  decorators: [(S) => <div style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}><S /></div>],
} satisfies Meta<typeof DescriptionList>
export default meta
type Story = StoryObj<typeof meta>

export const Person: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionItem term="Username">@alex</DescriptionItem>
      <DescriptionItem term="Kind">
        <Cluster gap="6"><Badge tone="attention">admin</Badge><Badge tone="danger">suspended</Badge></Cluster>
      </DescriptionItem>
      <DescriptionItem term="Last signed in" numeric>16 Sept 2026, 09:41</DescriptionItem>
      <DescriptionItem term="How they prove it is them">2 passkeys, 1 authenticator app · 1 trusted browser</DescriptionItem>
      <DescriptionItem term="Signed in now" numeric>3 sessions</DescriptionItem>
    </DescriptionList>
  ),
}

export const LongValues: Story = {
  name: 'Long values and code',
  render: () => (
    <DescriptionList>
      <DescriptionItem term="Client ID"><code>bindery-9f2c4e1a-8b7d-4c3e-a1f0-5d6e7f8a9b0c</code></DescriptionItem>
      <DescriptionItem term="Redirect URIs">
        https://bindery.d3cloud.io/auth/callback/oidc/d3-auth-provider-with-a-long-path, http://localhost:5173/auth/callback
      </DescriptionItem>
      <DescriptionItem term="Documentation"><Link href="#docs">Consumer contract</Link></DescriptionItem>
    </DescriptionList>
  ),
}

/** Counts in tabular figures line up digit under digit. */
export const Numeric: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionItem term="People" numeric>1,204</DescriptionItem>
      <DescriptionItem term="Apps" numeric>11</DescriptionItem>
      <DescriptionItem term="Sign-ins today" numeric>888</DescriptionItem>
    </DescriptionList>
  ),
}

/** Below sm each term sits above its value. */
export const Stacked: Story = {
  name: 'Below sm — stacked',
  decorators: [(S) => <div style={{ width: 340 }}><S /></div>],
  render: Person.render,
}

export const InASection: Story = {
  name: 'In a Section',
  render: () => (
    <Section title="How it signs people in">
      <DescriptionList>
        <DescriptionItem term="Client type">Web app with a client secret</DescriptionItem>
        <DescriptionItem term="Redirect URIs">https://bindery.d3cloud.io/auth/callback</DescriptionItem>
        <DescriptionItem term="Back-channel logout">https://bindery.d3cloud.io/auth/logout</DescriptionItem>
      </DescriptionList>
    </Section>
  ),
}
