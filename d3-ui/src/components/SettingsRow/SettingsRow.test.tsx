import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsRow } from './SettingsRow'
import { Section } from '../Section/Section'
import { Button } from '../Button/Button'
import { Checkbox } from '../Checkbox/Checkbox'
import { Badge } from '../Badge/Badge'
import { __resetDevWarnings } from '../../lib/dev'
import { expectNoAxeViolations } from '../../test/axe'

afterEach(() => { vi.restoreAllMocks(); __resetDevWarnings() })

describe('SettingsRow — naming the control', () => {
  it('names a control by the title through aria-labelledby, and describes it by the description', () => {
    render(
      <SettingsRow
        title="Show message previews" description="A line of the message under each subject"
        control={(ids) => (
          <button role="switch" aria-checked="true" aria-labelledby={ids.labelledBy} aria-describedby={ids.describedBy} />
        )}
      />,
    )
    const sw = screen.getByRole('switch', { name: 'Show message previews' })
    expect(sw).toHaveAccessibleDescription('A line of the message under each subject')
  })

  it('makes the title a real label with htmlFor, so clicking it reaches the control', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SettingsRow
        title="Undo send" htmlFor
        control={(ids) => <Checkbox id={ids.id} aria-label="Undo send" checked={false} onCheckedChange={onChange} />}
      />,
    )
    const title = screen.getByText('Undo send')
    expect(title.tagName).toBe('LABEL')
    expect(title).toHaveAttribute('for', screen.getByRole('checkbox').id)
    await user.click(title)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('takes an explicit htmlFor id', () => {
    render(<SettingsRow title="Nickname" htmlFor="nick" control={<input id="nick" />} />)
    expect(screen.getByRole('textbox', { name: 'Nickname' })).toBeInTheDocument()
  })

  it('leaves the title as plain text without htmlFor', () => {
    render(<SettingsRow title="Plan" control={<Badge>Free</Badge>} />)
    expect(screen.getByText('Plan').tagName).toBe('DIV')
  })

  it('renders a plain node as it is, named by its own text', () => {
    render(<SettingsRow title="Password" control={<Button>Change…</Button>} />)
    expect(screen.getByRole('button', { name: 'Change…' })).toBeInTheDocument()
  })

  it('generates stable ids from `id` when one is given, and distinct ones otherwise', () => {
    let seen: { id: string; titleId: string; descriptionId?: string; describedBy?: string } | undefined
    const grab = (ids: NonNullable<typeof seen>) => { seen = ids; return <span /> }
    const { rerender } = render(<SettingsRow id="prev" title="T" description="D" control={grab} />)
    expect(seen).toMatchObject({ id: 'prev-control', titleId: 'prev-title', descriptionId: 'prev-desc', describedBy: 'prev-desc' })
    expect(document.getElementById('prev-title')).toHaveTextContent('T')
    expect(document.getElementById('prev-desc')).toHaveTextContent('D')
    rerender(<SettingsRow id="prev" title="T" description="D" control={grab} />)
    expect(seen?.titleId).toBe('prev-title')

    render(<><SettingsRow title="A" control={<span />} /><SettingsRow title="B" control={<span />} /></>)
    expect(screen.getByText('A').id).not.toBe(screen.getByText('B').id)
  })
})

describe('SettingsRow — without a description', () => {
  it('renders no description element and gives no describedBy', () => {
    let describedBy: string | undefined = 'unset'
    const { container } = render(
      <SettingsRow title="Username" control={(ids) => { describedBy = ids.describedBy; return '@alex' }} />,
    )
    expect(container.querySelector('.d3-setrow__desc')).toBeNull()
    expect(describedBy).toBeUndefined()
    expect(screen.getByText('@alex')).toBeInTheDocument()
  })
})

describe('SettingsRow — development warnings', () => {
  it('warns when there is no control', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<SettingsRow title="Empty" control={null} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('`control` is required'))
  })

  it('warns when the control ends up unnamed', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<SettingsRow title="Show previews" control={<input type="checkbox" />} />)
    await waitFor(() => expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name')))
  })

  it('does not warn when the title names the control', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <SettingsRow title="Show previews"
        control={(ids) => <input type="checkbox" aria-labelledby={ids.labelledBy} />} />,
    )
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('SettingsRow — in a Section', () => {
  it('is axe-clean with a toggle, a button, a chevron value and a status', async () => {
    const { container } = render(
      <Section title="Reading">
        <SettingsRow title="Previews" description="A line under each subject" htmlFor
          control={(ids) => <Checkbox id={ids.id} aria-label="Previews" aria-describedby={ids.describedBy} />} />
        <SettingsRow title="Password" control={<Button>Change…</Button>} />
        <SettingsRow title="Language" control={<Button variant="ghost">English (UK)</Button>} />
        <SettingsRow title="Two-step" control={<Badge tone="attention">Not set up</Badge>} />
      </Section>,
    )
    await expectNoAxeViolations(container)
  })

  it('lays the rows out as siblings the hairline rule can reach', () => {
    const { container } = render(
      <Section title="Reading">
        <SettingsRow title="A" control="1" />
        <SettingsRow title="B" control="2" />
      </Section>,
    )
    const rows = container.querySelectorAll('.d3-sec__body > .d3-setrow')
    expect(rows).toHaveLength(2)
  })
})
