import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthLayout } from './AuthLayout'

describe('AuthLayout — a single-task page', () => {
  it('is the main landmark with one h1, through PageHeader', () => {
    render(<AuthLayout title="Sign in to Bindery" focusOnMount={false}><form aria-label="Sign in" /></AuthLayout>)
    expect(screen.getByRole('main')).toHaveClass('d3-auth')
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in to Bindery' })).toHaveClass('d3-ph__title')
  })

  it('announces the step by focusing its h1 on mount', async () => {
    render(<AuthLayout title="Confirm it is you" />)
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveFocus())
  })

  it('can leave focus to a field that autofocuses', () => {
    render(<AuthLayout title="Sign in" focusOnMount={false} />)
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveFocus()
  })

  it('renders brand, description, body and footer in reading order', () => {
    const { container } = render(
      <AuthLayout title="Sign in" focusOnMount={false} brand={<span>D3 Auth</span>}
        description="With your D3 Auth account." footer={<p>Trouble signing in? Ask Matt.</p>}>
        <p>The form</p>
      </AuthLayout>,
    )
    const text = container.textContent ?? ''
    const order = ['D3 Auth', 'Sign in', 'With your D3 Auth account.', 'The form', 'Trouble signing in?']
      .map((t) => text.indexOf(t))
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(screen.getByText('Trouble signing in? Ask Matt.').parentElement).toHaveClass('d3-auth__footer')
  })

  it('is a div inside something that already has a main', () => {
    render(<main><AuthLayout as="div" title="Sign in" focusOnMount={false} /></main>)
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })
})
