import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { composeStories, setProjectAnnotations } from '@storybook/react'
import { expectNoAxeViolations } from './axe'
import * as previewAnnotations from '../../.storybook/preview'

// Stories render through the real preview decorators, so a test renders exactly
// what Storybook renders — including the theme wrapper.
setProjectAnnotations([previewAnnotations.default])

type StoryModule = Parameters<typeof composeStories>[0]
type ComposedStory = React.ComponentType<Record<string, never>>

const modules = import.meta.glob<StoryModule>('../components/**/*.stories.tsx', { eager: true })

afterEach(cleanup)

const entries = Object.entries(modules).flatMap(([path, mod]) => {
  const composed = composeStories(mod)
  const file = path.split('/').slice(-1)[0]!.replace('.stories.tsx', '')
  return Object.entries(composed).map(([name, Story]) => ({
    file,
    name,
    Story: Story as unknown as ComposedStory,
  }))
})

// A guard against the suite silently passing because the glob matched nothing.
describe('story discovery', () => {
  it('finds every story file', () => {
    expect(Object.keys(modules).length).toBeGreaterThan(0)
    expect(entries.length).toBeGreaterThan(0)
  })
})

describe.each(
  [...new Set(entries.map((e) => e.file))].sort(),
)('%s stories', (file) => {
  const forFile = entries.filter((e) => e.file === file)

  it.each(forFile.map((e) => [e.name, e] as const))('%s renders', async (_name, entry) => {
    const { container } = render(<entry.Story />)
    expect(container).toBeTruthy()
    expect(container.innerHTML.length).toBeGreaterThan(0)
  })

  it.each(forFile.map((e) => [e.name, e] as const))(
    '%s has no accessibility violations',
    async (_name, entry) => {
      const { container } = render(<entry.Story />)
      await expectNoAxeViolations(container)
    },
  )
})
