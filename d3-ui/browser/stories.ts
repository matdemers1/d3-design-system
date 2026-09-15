import { readFileSync } from 'node:fs'

export interface StoryEntry { id: string; title: string; name: string }

/** Every story in the built Storybook, read from its own index. */
export function allStories(): StoryEntry[] {
  const index = JSON.parse(readFileSync('storybook-static/index.json', 'utf8')) as {
    entries: Record<string, { id: string; type: string; title: string; name: string }>
  }
  return Object.values(index.entries).filter((e) => e.type === 'story')
}

export const storyUrl = (id: string, theme: 'dark' | 'light' = 'dark') =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`
