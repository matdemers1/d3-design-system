import type { Meta, StoryObj } from '@storybook/react'
import { AppWindow, Plus, ShieldHalf } from 'lucide-react'
import { AppShell, AppShellBrand, Badge, Button, Card, DataList, DataListRow, Page, PageHeader } from '../index'
import { APPS, ConsoleAccount, ConsoleFrame, ConsoleNav, icon } from './console'

const meta = {
  title: 'Patterns/App frame',
  parameters: {
    layout: 'fullscreen',
    canvas: 'app',
    docs: {
      story: { inline: false, iframeHeight: 640 },
      description: { component: `
The frame every signed-in page of an internal app sits in: **\`AppShell\`** with an
**\`AppShellBrand\`**, a **\`SideNav\`**, and an **\`AccountMenu\`** at the foot. Built once,
in the app's root layout; pages never render their own navigation.

#### The sidebar
- **Do** put the places people go every day in it, most-used first.
- **Do** group once there are more than seven items. Group titles are short nouns — *Directory*, *Trust* — and a lone first item (Home) needs no group.
- **Do** give every item an icon. On the collapsed rail the icon is all there is.
- **Do** show a \`count\` only for work waiting there ("2 invites waiting"), never a total. A number that is always there stops being read.
- **Don't** put settings, export, or your own profile in the sidebar. They are set up once and then forgotten, and every item in a daily list costs a glance every day.
- **Don't** make the page's title and the nav item disagree. The item that led here is the \`PageHeader\` title.

#### The account menu
- **Do** put *who is signed in*, profile, settings, export, the theme switch, and sign-out here — in that order, separated into groups.
- **Do** make **Sign out the last item, \`tone="danger"\`**. It is on every page, in the same place, one click away (ASVS 7.4.4).
- **Don't** put sign-out in the sidebar, the top bar, or a page. The console's wrapping pill row put it on a line of its own.
- **Don't** render \`ThemeSwitch\` as anything else in here — inside a menu it becomes menu radios by itself (D-066).

#### Hiding a link is not permission
- **Do** enforce access on the server, and render the page's **no-access state** when it refuses (see *Page states*).
- **Do** leave out destinations a role can *never* use, to keep the list short — that is tidiness, not security.
- **Don't** treat a missing link as a lock. People type URLs, keep bookmarks, and follow links in email.

#### The brand
- **Do** use \`AppShellBrand\` with the product mark and name. It is the home link, and on the rail it is the mark alone with the name kept as its accessible name.
- **Don't** put a page title, a search box or actions in the brand slot.
` },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function AppsPage() {
  return (
    <Page>
      <PageHeader title="Apps" count={APPS.length} focusOnMount={false}
        description="Everything that signs people in through D3 Auth."
        actions={<Button variant="primary" icon={<Plus size={16} strokeWidth={1.8} aria-hidden />}>Register an app</Button>} />
      <Card>
        <DataList aria-label="Apps">
          {APPS.map((app) => (
            <DataListRow key={app.id} href={`#apps/${app.id}`} leading={icon(AppWindow, 20)}
              title={app.name} description={`${app.clientId} · ${app.type}`}
              meta={app.disabled
                ? <Badge size="sm" tone="danger">Disabled</Badge>
                : <span>{app.people === 1 ? '1 person' : `${app.people} people`}</span>} />
          ))}
        </DataList>
      </Card>
    </Page>
  )
}

/** The frame at 1024px and wider: a 240px sidebar. Below `lg` it becomes a top bar and a drawer. */
export const Default: Story = {
  render: () => (
    <ConsoleFrame current="apps">
      <AppsPage />
    </ConsoleFrame>
  ),
}

/** The rail. The user's choice, remembered per browser; the brand is its mark, items show a tooltip. */
export const Collapsed: Story = {
  render: () => (
    <AppShell
      storageKey="d3.patterns.sidebar.rail"
      defaultCollapsed
      brand={<AppShellBrand href="#home" name="D3 Auth" mark={icon(ShieldHalf, 20)} />}
      nav={<ConsoleNav current="apps" />}
      footer={<ConsoleAccount />}
    >
      <AppsPage />
    </AppShell>
  ),
}
