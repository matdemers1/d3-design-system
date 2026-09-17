import type { Meta, StoryObj } from '@storybook/react'
import { Page } from './Page'
import { PageHeader } from '../PageHeader/PageHeader'
import { Card, CardBody, CardTitle } from '../Card/Card'
import { Skeleton } from '../Skeleton/Skeleton'
import { Alert } from '../Alert/Alert'
import { Button } from '../Button/Button'
import { Grid } from '../Grid/Grid'
import { Section } from '../Section/Section'
import { Stack } from '../Stack/Stack'
import { Cluster } from '../Stack/Cluster'
import { DescriptionItem, DescriptionList } from '../DescriptionList/DescriptionList'
import { DataList, DataListRow } from '../DataList/DataList'
import { FormActions } from '../FormActions/FormActions'

const meta = {
  title: 'Layout/Page',
  component: Page,
  tags: ['autodocs'],
  argTypes: { width: { control: 'inline-radio', options: ['wide', 'narrow', 'form', 'prose'] } },
  args: { width: 'wide' },
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component:
      'The content of one page: centred, capped at a container width, padded by `--page-pad` ' +
      '(24px, 32px from `lg`), and its regions spaced 24px apart (D-021).\n\n' +
      '| width | content | for |\n|---|---|---|\n' +
      '| `wide` | 1280px | lists, dashboards, data pages |\n' +
      '| `narrow` | 672px | detail and settings pages |\n' +
      '| `form` | 480px | a single form |\n' +
      '| `prose` | 65ch | reading |\n\n' +
      'It renders a `div` by default, **because the app shell owns the page’s one `<main>`**. ' +
      'Use `as="main"` only on a page with no shell.\n\n' +
      'Everything the page renders goes inside it — the loading skeleton and the error too — so ' +
      'those sit where the content will, not full width against the window.' } },
  },
} satisfies Meta<typeof Page>
export default meta
type Story = StoryObj<typeof meta>

const Region = ({ title }: { title: string }) => (
  <Card><CardTitle>{title}</CardTitle><CardBody>A region of the page, 24px from the next.</CardBody></Card>
)

export const Wide: Story = {
  render: (args) => (
    <Page {...args}>
      <PageHeader title="People" count={12} focusOnMount={false} actions={<Button variant="primary">Invite</Button>} />
      <Region title="Everyone who can sign in" />
      <Region title="Waiting to accept" />
    </Page>
  ),
}

export const Narrow: Story = {
  args: { width: 'narrow' },
  render: Wide.render,
}

export const Form: Story = {
  args: { width: 'form' },
  render: Wide.render,
}

export const Prose: Story = {
  args: { width: 'prose' },
  render: (args) => (
    <Page {...args}>
      <PageHeader title="How access works" focusOnMount={false} />
      <p style={{ margin: 0 }}>
        Access is deny-by-default. Nobody can sign in to an app until somebody gives them access to it,
        and an app’s roles arrive in the token as a scoped claim that only that app can read. Taking
        access away signs the person out of that app everywhere at once.
      </p>
    </Page>
  ),
}

/** The skeleton is inside the Page, so it is the width the content will be. */
export const Loading: Story = {
  render: (args) => (
    <Page {...args} aria-busy="true">
      <Skeleton width="12rem" height="1.75rem" />
      <Skeleton height="8rem" />
      <Skeleton height="12rem" />
    </Page>
  ),
}

/** An error sits where the content would have, at the top of the region it concerns. */
export const Failed: Story = {
  args: { width: 'narrow' },
  render: (args) => (
    <Page {...args}>
      <PageHeader title="Settings" focusOnMount={false} />
      <Alert tone="danger" title="This page could not load">
        The console could not reach the server. If sign-in still works, this is the console, not the provider.
      </Alert>
    </Page>
  ),
}

/**
 * A page built only from the layout exports, at D-021's rhythm: 24px between
 * regions, a 24px gutter, 20px inside a card, 48px rows padded 12/16.
 */
export const Composed: Story = {
  name: 'Composed — the D-021 rhythm',
  args: { width: 'wide' },
  render: (args) => (
    <Page {...args}>
      <PageHeader title="Home" focusOnMount={false} description="How this instance is doing, and what has happened lately." />
      <Grid as="ul" minItemWidth="sm">
        {[['Database', 'Reachable.'], ['Signing keys', 'Rotated 41 days ago.'], ['Mail', 'The last test send failed.']].map(([t, d]) => (
          <Card as="li" key={t}><CardTitle as="h2">{t}</CardTitle><CardBody>{d}</CardBody></Card>
        ))}
      </Grid>
      <Section title="Counts">
        <DescriptionList>
          <DescriptionItem term="People" numeric>12</DescriptionItem>
          <DescriptionItem term="Sign-ins today" numeric>48</DescriptionItem>
        </DescriptionList>
      </Section>
      <Section title="Lately" actions={<Button size="sm">All of it</Button>}>
        <DataList aria-label="Recent events">
          <DataListRow title="grant.given" description="Matt Demers · Bindery" meta={<span>16 Sept, 09:41</span>} />
          <DataListRow title="session.revoked" description="Sarah Byrne" meta={<span>16 Sept, 09:12</span>} />
        </DataList>
      </Section>
      <Section title="Mail" surface="plain">
        <Stack gap="16">
          <Cluster><span>Driver</span><span>relay</span></Cluster>
          <FormActions><Button>Send a test</Button><Button variant="primary">Save</Button></FormActions>
        </Stack>
      </Section>
    </Page>
  ),
}

/** Only on a page rendered without an app shell. */
export const AsMain: Story = {
  name: 'As main — no shell',
  args: { as: 'main', width: 'narrow' },
  render: Wide.render,
}
