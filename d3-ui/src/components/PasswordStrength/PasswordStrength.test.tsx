import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { __resetDevWarnings } from '../../lib/dev'
import { expectNoAxeViolations } from '../../test/axe'
import { PasswordStrength } from './PasswordStrength'
import { PasswordInput } from '../PasswordInput/PasswordInput'
import { FormField } from '../FormField/FormField'

afterEach(() => { vi.restoreAllMocks(); __resetDevWarnings() })

const segments = (c: HTMLElement) => Array.from(c.querySelectorAll('.d3-pws__seg'))
const filled = (c: HTMLElement) => segments(c).filter((s) => s.classList.contains('d3-pws__seg--on'))

describe('PasswordStrength — the contract', () => {
  it.each([0, 1, 2, 3, 4] as const)('score %i fills that many of four segments', (score) => {
    const { container } = render(<PasswordStrength score={score} label="Verdict" />)
    expect(segments(container)).toHaveLength(4)
    expect(filled(container)).toHaveLength(score)
    // Fills from the left: the filled segments are the first `score`.
    expect(segments(container).slice(0, score)).toEqual(filled(container))
  })

  it('picks the hue by score: danger, warning, then accent for 3 and 4', () => {
    const cls = (score: 0 | 1 | 2 | 3 | 4) =>
      render(<PasswordStrength score={score} label="x" />).container.firstElementChild!.className
    expect(cls(1)).toContain('d3-pws--s1')
    expect(cls(2)).toContain('d3-pws--s2')
    expect(cls(3)).toContain('d3-pws--s3')
    expect(cls(4)).toContain('d3-pws--s4')
  })

  it('hides the segments from assistive technology and says the verdict in text', () => {
    const { container } = render(<PasswordStrength score={3} label="Strong — 14 characters" />)
    expect(container.querySelector('.d3-pws__bars')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('Strong — 14 characters')).toBeVisible()
  })

  it('announces the verdict politely and as a whole', () => {
    render(<PasswordStrength score={1} label="Weak" />)
    const verdict = screen.getByRole('status')
    expect(verdict).toHaveTextContent('Weak')
    expect(verdict).toHaveAttribute('aria-live', 'polite')
    expect(verdict).toHaveAttribute('aria-atomic', 'true')
  })

  it('changes the text inside the same live region rather than replacing it', () => {
    const { rerender } = render(<PasswordStrength score={1} label="Weak" />)
    const region = screen.getByRole('status')
    rerender(<PasswordStrength score={4} label="Strong" />)
    expect(screen.getByRole('status')).toBe(region)
    expect(region).toHaveTextContent('Strong')
  })

  it('is not interactive', () => {
    const { container } = render(<PasswordStrength score={2} label="Fair" />)
    expect(container.querySelector('button, a, input, [tabindex]')).toBeNull()
  })

  it('puts the given id on the verdict, and generates one when absent', () => {
    const { unmount } = render(<PasswordStrength score={2} label="Fair" id="pw-verdict" />)
    expect(screen.getByRole('status')).toHaveAttribute('id', 'pw-verdict')
    unmount()
    render(<PasswordStrength score={2} label="Fair" />)
    expect(screen.getByRole('status').id).not.toBe('')
  })

  it('is read as the input\'s description when its id is in aria-describedby', () => {
    render(
      <>
        <label htmlFor="pw">New password</label>
        <PasswordInput id="pw" autoComplete="new-password" aria-describedby="pw-verdict" />
        <PasswordStrength id="pw-verdict" score={2} label="Fair" />
      </>,
    )
    expect(screen.getByLabelText('New password')).toHaveAccessibleDescription('Fair')
  })

  it('is read through FormField when placed in its help slot', () => {
    render(
      <FormField label="New password" help={<PasswordStrength score={4} label="Strong" />}>
        <PasswordInput autoComplete="new-password" />
      </FormField>,
    )
    expect(screen.getByLabelText('New password')).toHaveAccessibleDescription('Strong')
  })

  it('warns in development about a bad score and clamps it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<PasswordStrength score={9 as 4} label="x" />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('score="9"'))
    expect(filled(container)).toHaveLength(4)
  })

  it('warns when the verdict is empty', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<PasswordStrength score={1} label="" />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('`label` is empty'))
  })

  it('is axe-clean at every score', async () => {
    for (const score of [0, 1, 2, 3, 4] as const) {
      const { container, unmount } = render(<PasswordStrength score={score} label={`Score ${score}`} />)
      await expectNoAxeViolations(container)
      unmount()
    }
  })
})
