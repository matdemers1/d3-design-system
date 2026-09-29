import { expect, test, type Page } from '@playwright/test'
import { allStories, storyUrl } from './stories'
import { settle, watchErrors } from './settle'

/**
 * Two shadows, and only two (D-075, amending D-023).
 *
 * D-023 was verified by finding zero computed box-shadows on the 3d page. The
 * rule is now narrower and still checkable the same way: a shadow may appear
 * only on the components D-075 names, and only as the token it names for them.
 *
 *   --shadow-float → Menu (and so AccountMenu's panel), Tooltip, Toast, Modal,
 *                    RecipientField's suggestion list, CommandPalette's panel
 *   --shadow-sheet → AppShell navTone="recessed" <main>, and nothing else
 *
 * An inset shadow is not lift: it is a boundary drawn inside a control (a
 * pressed toggle's ring), which the usage guard has always admitted. It is
 * allowed here for the same reason, and for no other.
 *
 * The story sweep sees layers closed, so each floating layer is also opened and
 * swept open, in both themes, and again under forced-colors and
 * prefers-contrast: more, where the shadow must give way to a border-float edge.
 */

const FLOAT = '.d3-menu, .d3-tip, .d3-toast, .d3-modal, .d3-rcp__pop, .d3-cmd'
const SHEET = '.d3-shell--recessed .d3-shell__main'

/** Every element — and its ::before and ::after — with a shadow it may not have. */
async function strayShadows(page: Page) {
  return page.evaluate(([float, sheet]) => {
    const out: string[] = []
    const describe = (el: Element) =>
      `<${el.tagName.toLowerCase()} class="${el.getAttribute('class') ?? ''}">${(el.textContent ?? '').trim().slice(0, 24)}`
    // Top-level commas only: an rgb() carries commas of its own.
    const layers = (v: string) => v.split(/,(?![^(]*\))/).map((l) => l.trim())
    const onlyInset = (v: string) => layers(v).every((l) => /\binset\b/.test(l))
    const tokenValue = (el: Element, name: string) => {
      const probe = document.createElement('span')
      probe.style.boxShadow = `var(${name})`
      el.append(probe)
      const v = getComputedStyle(probe).boxShadow
      probe.remove()
      return v
    }
    // Storybook's own chrome (the loader, the error display, docs blocks) has
    // shadows of its own and is not the library. <body> carries an `sb-` class
    // too, so only its descendants are tested for it.
    const storybook = (el: Element) => {
      for (let n: Element | null = el; n && n !== document.body; n = n.parentElement) {
        if (n.id === 'storybook-docs' || [...n.classList].some((c) => c.startsWith('sb-'))) return true
      }
      return false
    }
    for (const el of [document.body, ...document.body.querySelectorAll('*')]) {
      if (storybook(el)) continue
      for (const pseudo of [null, '::before', '::after'] as const) {
        const shadow = getComputedStyle(el, pseudo).boxShadow
        if (!shadow || shadow === 'none' || onlyInset(shadow)) continue
        const token = pseudo ? null : el.matches(float) ? '--shadow-float' : el.matches(sheet) ? '--shadow-sheet' : null
        if (!token) { out.push(`${describe(el)}${pseudo ?? ''} has box-shadow ${shadow}`); continue }
        const want = tokenValue(el, token)
        if (shadow !== want) out.push(`${describe(el)} has box-shadow ${shadow}; ${token} is ${want}`)
      }
    }
    return out
  }, [FLOAT, SHEET] as const)
}

/** The computed look of one element, with the tokens it should read resolved in place. */
async function look(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => {
    const cs = getComputedStyle(el)
    const resolve = (prop: 'color' | 'boxShadow', value: string) => {
      const probe = document.createElement('span')
      probe.style[prop] = value
      el.append(probe)
      const v = getComputedStyle(probe)[prop]
      probe.remove()
      return v
    }
    return {
      shadow: cs.boxShadow,
      layers: cs.boxShadow === 'none' ? 0 : cs.boxShadow.split(/,(?![^(]*\))/).length,
      bg: cs.backgroundColor,
      borderWidth: cs.borderTopWidth,
      borderStyle: cs.borderTopStyle,
      borderColor: cs.borderTopColor,
      radius: cs.borderTopLeftRadius,
      outlineStyle: cs.outlineStyle,
      t: {
        raised: resolve('color', 'var(--color-surface-raised)'),
        surface: resolve('color', 'var(--color-surface)'),
        border: resolve('color', 'var(--color-border)'),
        borderFloat: resolve('color', 'var(--color-border-float)'),
        float: resolve('boxShadow', 'var(--shadow-float)'),
        sheet: resolve('boxShadow', 'var(--shadow-sheet)'),
      },
    }
  })
}

for (const theme of ['dark', 'light'] as const) {
  for (const story of allStories()) {
    test(`${theme} · ${story.id} · no shadow outside the two`, async ({ page }) => {
      const errors = watchErrors(page)
      await page.goto(storyUrl(story.id, theme))
      await settle(page)
      expect(await strayShadows(page)).toEqual([])
      expect(errors, errors.join('\n')).toEqual([])
    })
  }
}

/** How to put each floating layer on screen, from a story. */
const LAYERS: { name: string; story: string; selector: string; open: (page: Page) => Promise<void> }[] = [
  {
    name: 'Menu', story: 'layers-menu--row-overflow', selector: '.d3-menu',
    open: async (page) => {
      await page.getByRole('button', { name: 'Actions for Invoice 2026-114' }).focus()
      await page.keyboard.press('Enter')
    },
  },
  {
    name: 'AccountMenu', story: 'frame-appshell--default', selector: '.d3-menu',
    open: async (page) => {
      await page.getByRole('button', { name: /Dana Whitfield/ }).focus()
      await page.keyboard.press('Enter')
    },
  },
  {
    name: 'Tooltip', story: 'layers-tooltip--on-a-status', selector: '.d3-tip',
    open: async (page) => { await page.keyboard.press('Tab') },
  },
  {
    name: 'Toast', story: 'layers-toast--in-a-region', selector: '.d3-toast',
    open: async (page) => {
      await page.getByRole('button', { name: 'Archive' }).focus()
      await page.keyboard.press('Enter')
    },
  },
  {
    name: 'Modal', story: 'layers-modal--open-by-default', selector: '.d3-modal',
    open: async () => {},
  },
  {
    name: 'RecipientField', story: 'forms-recipientfield--composer-rows', selector: '.d3-rcp__pop',
    open: async (page) => {
      await page.getByRole('combobox', { name: 'To' }).focus()
      await page.keyboard.type('d')
    },
  },
  {
    name: 'CommandPalette', story: 'layers-commandpalette--mail-search', selector: '.d3-cmd',
    open: async () => {},
  },
]

for (const theme of ['dark', 'light'] as const) {
  test.describe(`floating layers · ${theme}`, () => {
    // Portalled layers render under <body>, outside the story's data-theme
    // wrapper, so the OS scheme has to agree with the story's.
    test.use({ colorScheme: theme, viewport: { width: 1280, height: 800 } })

    for (const layer of LAYERS) {
      test(`${layer.name}: surface-raised and --shadow-float, no drawn edge`, async ({ page }) => {
        await page.goto(storyUrl(layer.story, theme))
        await settle(page)
        await layer.open(page)
        await expect(page.locator(layer.selector).first()).toBeVisible()
        await settle(page)

        const got = await look(page, layer.selector)
        expect(got.bg).toBe(got.t.raised)
        expect(got.shadow).not.toBe('none')
        expect(got.shadow).toBe(got.t.float)
        // The border stays for geometry and forced-colors, and draws nothing.
        expect(got.borderWidth).toBe('1px')
        expect(got.borderColor).toBe('rgba(0, 0, 0, 0)')
        if (theme === 'light') {
          // A 1px ring in the divider colour first — what finds a white menu on a white card.
          expect(got.layers).toBe(3)
          expect(got.shadow.startsWith(`${got.t.border} 0px 0px 0px 1px`)).toBe(true)
        } else {
          expect(got.layers).toBe(2)
          expect(got.shadow).not.toContain(' 0px 0px 0px 1px')
        }
        // Opened, the page still has no shadow anywhere else.
        expect(await strayShadows(page)).toEqual([])
      })
    }
  })
}

for (const media of [{ contrast: 'more' as const }, { forcedColors: 'active' as const }]) {
  const label = 'contrast' in media ? 'prefers-contrast: more' : 'forced-colors: active'
  test.describe(`floating layers · ${label}`, () => {
    test.use({ viewport: { width: 1280, height: 800 } })

    for (const layer of LAYERS) {
      test(`${layer.name}: the shadow gives way to the 1px border-float edge`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'light', ...media })
        await page.goto(storyUrl(layer.story, 'light'))
        await settle(page)
        await layer.open(page)
        await expect(page.locator(layer.selector).first()).toBeVisible()
        await settle(page)

        const got = await look(page, layer.selector)
        expect(got.shadow).toBe('none')
        expect(got.borderWidth).toBe('1px')
        expect(got.borderStyle).toBe('solid')
        expect(got.borderColor).not.toBe('rgba(0, 0, 0, 0)')
        // Forced colours repaint the edge in a system colour; contrast-more keeps ours.
        if ('contrast' in media) expect(got.borderColor).toBe(got.t.borderFloat)
      })
    }
  })
}

/** The sheet: the recessed shell's <main>, and no other shell's. */
for (const scheme of ['dark', 'light'] as const) {
  test.describe(`the content sheet · ${scheme}`, () => {
    test.use({ viewport: { width: 1280, height: 800 }, colorScheme: scheme })

    test('recessed main: --shadow-sheet on radius-lg, inset from the page', async ({ page }) => {
      await page.goto(storyUrl('frame-appshell--recessed', scheme))
      await settle(page)
      const got = await look(page, '.d3-shell__main')
      expect(got.shadow).not.toBe('none')
      expect(got.shadow).toBe(got.t.sheet)
      expect(got.layers).toBe(scheme === 'light' ? 2 : 1)
      expect(got.bg).toBe(got.t.surface)
      expect(got.radius).toBe('14px')
      const box = await page.locator('.d3-shell__main').evaluate((el) => {
        const r = el.getBoundingClientRect()
        return { top: r.top, right: r.right, width: document.documentElement.clientWidth }
      })
      expect(box.top).toBeGreaterThan(0)
      expect(box.right).toBeLessThan(box.width)
      expect(await strayShadows(page)).toEqual([])
    })

    test('recessed main below lg: still a sheet, inset at the sides', async ({ page }) => {
      await page.setViewportSize({ width: 800, height: 800 })
      await page.goto(storyUrl('frame-appshell--recessed', scheme))
      await settle(page)
      const got = await look(page, '.d3-shell__main')
      expect(got.shadow).toBe(got.t.sheet)
      const box = await page.locator('.d3-shell__main').evaluate((el) => {
        const r = el.getBoundingClientRect()
        return { left: r.left, right: r.right, width: document.documentElement.clientWidth }
      })
      expect(box.left).toBeGreaterThan(0)
      expect(box.right).toBeLessThan(box.width)
    })

    test('the default shell keeps main shadow-free', async ({ page }) => {
      await page.goto(storyUrl('frame-appshell--default', scheme))
      await settle(page)
      expect((await look(page, '.d3-shell__main')).shadow).toBe('none')
    })
  })
}

test('focus is never a shadow: a focused control draws an outline and no lift', async ({ page }) => {
  await page.goto(storyUrl('layers-menu--row-overflow'))
  await settle(page)
  await page.keyboard.press('Tab')
  const focused = await page.evaluate(() => {
    const el = document.activeElement!
    const cs = getComputedStyle(el)
    return { outline: cs.outlineStyle, shadow: cs.boxShadow }
  })
  expect(focused.outline).toBe('solid')
  expect(focused.shadow).toBe('none')
})
