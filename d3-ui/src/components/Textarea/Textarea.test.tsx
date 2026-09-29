import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('is proportional by default', () => {
    render(<Textarea aria-label="Note" />)
    expect(screen.getByRole('textbox', { name: 'Note' }).parentElement).not.toHaveClass('d3-inp--mono')
  })

  it('takes the mono face for JSON and manifests, without changing its size step', () => {
    render(<Textarea aria-label="Manifest" mono />)
    const frame = screen.getByRole('textbox', { name: 'Manifest' }).parentElement!
    expect(frame).toHaveClass('d3-inp--mono', 'd3-inp--md', 'd3-inp--area')
    // `mono` is consumed, not forwarded to the DOM as an unknown attribute.
    expect(screen.getByRole('textbox')).not.toHaveAttribute('mono')
  })
})

describe('Textarea — appearance', () => {
  it('outlined by default; filled adds the filled frame and keeps the area', () => {
    const { rerender } = render(<Textarea aria-label="Message" />)
    expect(screen.getByRole('textbox', { name: 'Message' }).parentElement!.className).toBe('d3-inp d3-inp--md d3-inp--area')
    rerender(<Textarea aria-label="Message" appearance="filled" />)
    expect(screen.getByRole('textbox', { name: 'Message' }).parentElement).toHaveClass('d3-inp--area', 'd3-inp--filled')
  })
})
