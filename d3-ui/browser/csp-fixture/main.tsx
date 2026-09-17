/**
 * The strict-CSP fixture (D-072), built from the *published* entry — `dist/`,
 * not `src/` — so the check covers what an app installs: the bare `get-nonce`
 * import resolving to the one copy Radix's style singleton reads.
 *
 * `?nononce` skips the setup call. The spec uses it as the control: the same
 * page without the nonce must record a violation, or the policy is not being
 * exercised at all.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/tokens/build/tokens.css'
import '../../src/styles/base.css'
import './fixture.css'
import {
  AppShell, AppShellBrand, Button, FormField, Modal, ModalClose, Page, PageHeader, Select, SideNav,
  SideNavItem, readStyleNonce, setStyleNonce,
} from '../../dist/index.js'

if (!new URLSearchParams(location.search).has('nononce')) {
  const nonce = readStyleNonce()
  if (nonce) setStyleNonce(nonce)
}

function App() {
  return (
    <AppShell
      brand={<AppShellBrand name="Fixture" href="#" />}
      nav={<SideNav><SideNavItem href="#people" label="People" current /></SideNav>}
    >
      <Page>
        <PageHeader title="Strict CSP" focusOnMount={false} />
        <Modal
          title="Remove Ada Lovelace"
          description="She loses access to every app at once."
          trigger={<Button>Open modal</Button>}
          footer={<ModalClose><Button>Cancel</Button></ModalClose>}
        />
        <FormField label="Role">
          <Select options={[{ value: 'admin', label: 'Admin' }, { value: 'viewer', label: 'Viewer' }]} />
        </FormField>
        <div className="csp-tall" />
      </Page>
    </AppShell>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
