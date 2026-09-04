import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, TabPanel } from './Tabs'

const ITEMS = [
  { value: 'inbox', label: 'Inbox', count: 48 },
  { value: 'review', label: 'In Review' },
  { value: 'all', label: 'All' },
]
const renderTabs = (mode: 'automatic' | 'manual', onChange = vi.fn()) => {
  render(
    <Tabs items={ITEMS} activationMode={mode} onValueChange={onChange} aria-label="Views">
      {ITEMS.map((i) => <TabPanel key={i.value} value={i.value}>{i.label} panel</TabPanel>)}
    </Tabs>,
  )
  return onChange
}

describe('Tabs — activation mode is the contract', () => {
  it('automatic switches the panel as the arrows move', async () => {
    const user = userEvent.setup()
    const onChange = renderTabs('automatic')
    screen.getByRole('tab', { name: /Inbox/ }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith('review')
  })

  it('manual moves focus without switching — so arrowing fires no requests', async () => {
    const user = userEvent.setup()
    const onChange = renderTabs('manual')
    screen.getByRole('tab', { name: 'In Review' }).focus()
    await user.keyboard('{ArrowRight}')
    // App A's six tabs each refetch. Under automatic activation, arrowing from
    // Inbox to All would fire five requests nobody asked for.
    expect(onChange).not.toHaveBeenCalled()
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('all')
  })

  it('puts the count in the accessible name, not as a bare number', () => {
    renderTabs('automatic')
    expect(screen.getByRole('tab', { name: 'Inbox, 48 items' })).toBeInTheDocument()
  })

  it('implements the tablist pattern', () => {
    renderTabs('automatic')
    expect(screen.getByRole('tablist', { name: 'Views' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName('Inbox, 48 items')
    expect(screen.getByRole('tabpanel')).toBeInTheDocument()
  })
})
