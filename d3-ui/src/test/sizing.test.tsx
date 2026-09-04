import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Button } from '../components/Button/Button'
import { Input } from '../components/Input/Input'
import { Select } from '../components/Select/Select'
import '../styles/components.css'

/**
 * The Phase 4 spec claims Input, Select and Button share one height scale
 * (28/34/40) "because they sit on the same row in every filter bar in every
 * app". That claim was false in the first build: the library shipped no
 * box-sizing rule, browsers default <button> to border-box and <div> to
 * content-box, and the Input's 1px border was added OUTSIDE its declared
 * height — 36px next to a 34px Button.
 *
 * jsdom has no layout, so these assert declared CSS rather than a measured box.
 *
 * Verified by reverting the fix: **only the box-sizing test fails.** The six
 * height-equality tests pass either way, because both declarations always said
 * 34px — the bug was in the box model, not the declaration. They are kept as a
 * guard against someone changing one scale and not the other, but the
 * box-sizing assertion is the one holding this defect shut.
 */
const cs = (el: Element) => getComputedStyle(el)

describe('controls that share a row share a height', () => {
  it('every d3- element is border-box', () => {
    const { container } = render(
      <>
        <Button>Save</Button>
        <Input aria-label="a" />
      </>,
    )
    const els = container.querySelectorAll('[class^="d3-"], [class*=" d3-"]')
    expect(els.length).toBeGreaterThan(0)
    els.forEach((el) => expect(cs(el).boxSizing).toBe('border-box'))
  })

  it.each(['sm', 'md', 'lg'] as const)('Input and Button declare the same height at %s', (size) => {
    const { container } = render(
      <>
        <Button size={size}>Save</Button>
        <Input size={size} aria-label="a" />
      </>,
    )
    const btn = container.querySelector('.d3-btn')!
    const inp = container.querySelector('.d3-inp')!
    expect(cs(inp).height).toBe(cs(btn).height)
  })

  it.each(['sm', 'md', 'lg'] as const)('Select shares that height at %s', (size) => {
    const { container } = render(
      <>
        <Button size={size}>Save</Button>
        <Select size={size} aria-label="a" options={[{ value: 'a', label: 'A' }]} />
      </>,
    )
    const btn = container.querySelector('.d3-btn')!
    const sel = container.querySelector('.d3-sel')!
    expect(cs(sel).height).toBe(cs(btn).height)
  })
})
