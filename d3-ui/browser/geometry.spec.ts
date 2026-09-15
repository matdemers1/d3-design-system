import { expect, test } from '@playwright/test'
import { allStories, storyUrl } from './stories'
import { settle, watchErrors } from './settle'

/**
 * The measurements that used to be done by hand, on every story, in both themes.
 *
 * Control heights come from `offsetHeight` — layout, not paint — so a transform
 * mid-animation cannot fake a failure. The ramp was measured from the built
 * Storybook rather than written from memory, and every size agreed except one
 * button that turned out to be mid-animation.
 */
const RAMP: Record<string, Record<string, number>> = {
  'd3-btn': { sm: 28, md: 34, lg: 40 },
  'd3-ibtn': { sm: 28, md: 34, lg: 40 },
  'd3-inp': { sm: 28, md: 34, lg: 40 },
  'd3-sel': { sm: 28, md: 34, lg: 40 },
  'd3-bdg': { sm: 20, md: 24 },
  'd3-avt': { xs: 20, sm: 24, md: 32, lg: 40 },
}

for (const theme of ['dark', 'light'] as const) {
  for (const story of allStories()) {
    test(`${theme} · ${story.id}`, async ({ page }) => {
      const errors = watchErrors(page)
      await page.goto(storyUrl(story.id, theme))
      await settle(page)

      const problems = await page.evaluate((ramp) => {
        const out: string[] = []
        const describe = (el: Element) =>
          `<${el.tagName.toLowerCase()} class="${el.className}">${(el.textContent ?? '').trim().slice(0, 24)}`

        // 1 · every sized control sits exactly on the ramp
        for (const [block, sizes] of Object.entries(ramp)) {
          for (const el of document.querySelectorAll<HTMLElement>(`.${block}`)) {
            if (el.classList.contains('d3-inp--area')) continue
            const size = Object.keys(sizes).find((s) => el.classList.contains(`${block}--${s}`))
            if (!size || !el.offsetParent) continue
            if (el.offsetHeight !== sizes[size]) {
              out.push(`${describe(el)} is ${el.offsetHeight}px; ${block}--${size} is ${sizes[size]}px`)
            }
          }
        }

        // 2 · a segmented control's items share one height, and it matches its size
        for (const seg of document.querySelectorAll<HTMLElement>('.d3-seg')) {
          const want = seg.classList.contains('d3-seg--sm') ? 24 : 28
          for (const item of seg.querySelectorAll<HTMLElement>('.d3-seg__item')) {
            if (item.offsetHeight !== want) out.push(`${describe(item)} is ${item.offsetHeight}px; want ${want}px`)
          }
        }

        // 3 · the reset that shipped missing once (Input 36px beside Button 34px)
        for (const el of document.querySelectorAll<HTMLElement>('[class^="d3-"], [class*=" d3-"]')) {
          if (getComputedStyle(el).boxSizing !== 'border-box') {
            out.push(`${describe(el)} is content-box — the library's box-sizing reset did not apply`)
            break
          }
        }

        // 4 · a FormField's label never overlaps its control (it did, once, on Checkbox)
        for (const ff of document.querySelectorAll<HTMLElement>('.d3-ff')) {
          const label = ff.querySelector('.d3-lb')?.getBoundingClientRect()
          const control = ff.querySelector('.d3-inp, .d3-sel, .d3-cbx, textarea, input')?.getBoundingClientRect()
          if (label && control && label.bottom > control.top + 0.5 && label.top < control.bottom &&
              label.right > control.left && label.left < control.right) {
            out.push(`FormField label overlaps its control by ${(label.bottom - control.top).toFixed(1)}px`)
          }
        }
        // 5 · a checked or mixed checkbox shows a glyph you can see, not just a fill
        //     (it once showed a violet square and nothing else — colour alone)
        for (const box of document.querySelectorAll<HTMLElement>('.d3-cbx__box')) {
          const state = box.getAttribute('data-state')
          if (state !== 'checked' && state !== 'indeterminate') continue
          const glyph = box.querySelector<HTMLElement>(state === 'checked' ? '.d3-cbx__tick svg, .d3-cbx__tick > *' : '.d3-cbx__dash')
          const r = glyph?.getBoundingClientRect()
          if (!glyph || !r || r.width < 4 || r.height < 1.5 || getComputedStyle(glyph).visibility === 'hidden') {
            out.push(`a ${state} Checkbox shows no visible ${state === 'checked' ? 'tick' : 'dash'}`)
          }
        }
        return out
      }, RAMP)

      expect(problems, problems.join('\n')).toEqual([])
      expect(errors, errors.join('\n')).toEqual([])
    })
  }
}
