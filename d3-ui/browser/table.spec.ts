import { expect, test } from '@playwright/test'
import { settle, watchErrors } from './settle'
import { storyUrl } from './stories'

/**
 * The claim that justified virtualization: 439 rows scroll without the DOM
 * carrying 439 rows.
 *
 * Frame timing is measured too, but it is deliberately the weaker assertion —
 * a shared CI machine can drop a frame for reasons that have nothing to do with
 * this component. The load-bearing check is the one that cannot be flaky: how
 * many rows exist, and whether that stays bounded while scrolling.
 */

const VIRTUALIZED = 'data-table--virtualized'
const TOTAL_ROWS = 439

test.describe('Table · virtualization', () => {
  test('keeps the DOM small while reporting the whole set', async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto(storyUrl(VIRTUALIZED))
    await settle(page)

    const table = page.locator('table.d3-tbl')
    await expect(table).toHaveAttribute('aria-rowcount', String(TOTAL_ROWS))

    const rendered = await page.locator('tr.d3-tbl__row').count()
    expect(rendered).toBeGreaterThan(0)
    // A 420px viewport at 44px a row holds ten, plus overscan either side.
    expect(rendered).toBeLessThan(40)

    expect(errors).toEqual([])
  })

  test('scrolls the full extent of all 439 rows', async ({ page }) => {
    await page.goto(storyUrl(VIRTUALIZED))
    await settle(page)

    const scroller = page.locator('.d3-tbl-scroll').first()
    const extent = await scroller.evaluate((el) => el.scrollHeight)
    // The spacers have to make the scrollbar honest: ~439 rows of 44px.
    expect(extent).toBeGreaterThan(TOTAL_ROWS * 40)

    await scroller.evaluate((el) => {
      el.scrollTop = el.scrollHeight
    })
    await settle(page)

    // The last row of the set is reachable, which is the thing a broken window breaks.
    await expect(page.getByText(`Requirement ${String(TOTAL_ROWS)}`)).toBeVisible()
    expect(await page.locator('tr.d3-tbl__row').count()).toBeLessThan(40)
  })

  test('holds the row count steady across a long scroll', async ({ page }) => {
    await page.goto(storyUrl(VIRTUALIZED))
    await settle(page)

    const scroller = page.locator('.d3-tbl-scroll').first()
    const counts: number[] = []
    for (let i = 0; i <= 10; i++) {
      await scroller.evaluate((el, step) => {
        el.scrollTop = (el.scrollHeight - el.clientHeight) * (step / 10)
      }, i)
      await settle(page)
      counts.push(await page.locator('tr.d3-tbl__row').count())
    }

    // Not "small at the start": small the whole way down. An unbounded window grows.
    expect(Math.max(...counts)).toBeLessThan(40)
  })

  test('pins the header to the top of the scroll container', async ({ page }) => {
    await page.goto(storyUrl(VIRTUALIZED))
    await settle(page)

    const scroller = page.locator('.d3-tbl-scroll').first()
    const heading = page.locator('th.d3-tbl__th').first()

    await scroller.evaluate((el) => {
      el.scrollTop = 2000
    })
    await settle(page)

    const container = await scroller.boundingBox()
    const after = await heading.boundingBox()
    expect(after).not.toBeNull()
    // Pinned to the container's own top edge after two thousand pixels of body
    // movement. Not "it never moved": the caption sits above the header and
    // scrolls away first, so the header travels that far and then stops.
    expect(Math.abs((after?.y ?? 0) - (container?.y ?? 0))).toBeLessThan(2)

    // And it is still heading a table whose rows have moved underneath it.
    await expect(page.getByText('Requirement 1', { exact: true })).toBeHidden()
  })

  test('scrolls within a frame budget', async ({ page }) => {
    await page.goto(storyUrl(VIRTUALIZED))
    await settle(page)

    const longestFrame = await page.evaluate(async () => {
      const scroller = document.querySelector('.d3-tbl-scroll')
      if (!(scroller instanceof HTMLElement)) return 0

      const gaps: number[] = []
      let previous = performance.now()
      let ticks = 0

      await new Promise<void>((resolve) => {
        const step = () => {
          const now = performance.now()
          gaps.push(now - previous)
          previous = now
          scroller.scrollTop += 120
          ticks += 1
          if (ticks < 45) requestAnimationFrame(step)
          else resolve()
        }
        requestAnimationFrame(step)
      })

      // The first gap covers whatever happened before the loop started.
      const measured = gaps.slice(1).sort((a, b) => a - b)
      return measured[Math.floor(measured.length * 0.9)] ?? 0
    })

    // 90th-percentile frame under 50ms: generous enough to survive a busy CI box,
    // tight enough that rendering 439 rows on every scroll would not pass.
    expect(longestFrame).toBeLessThan(50)
  })
})

test.describe('a bounded table is reachable by keyboard', () => {
  test('the scroll region takes focus, and an unbounded one adds no tab stop', async ({ mount, page }) => {
    // A region that scrolls must be focusable, or the rows below the fold are pointer-only
    // (WCAG 2.1.1). Found by axe against a real consuming app, not by reading the spec.
    await mount(
      <Table
        caption="Bounded"
        maxHeight="120px"
        columns={[{ key: 'n', header: 'N', cell: (row: { n: number }) => row.n }]}
        rows={Array.from({ length: 40 }, (_, n) => ({ n }))}
        rowKey={(row) => String(row.n)}
      />,
    )

    const scroller = page.locator('.d3-tbl-scroll').first()
    await expect(scroller).toHaveAttribute('tabindex', '0')
    await expect(scroller).toHaveAttribute('aria-label', 'Bounded')
  })

  test('a table that fits adds no tab stop', async ({ mount, page }) => {
    // A stop that does nothing is worse than none: it costs a keyboard user a press for nothing.
    await mount(
      <Table
        caption="Short"
        columns={[{ key: 'n', header: 'N', cell: (row: { n: number }) => row.n }]}
        rows={[{ n: 1 }, { n: 2 }]}
        rowKey={(row) => String(row.n)}
      />,
    )
    await expect(page.locator('.d3-tbl-scroll').first()).not.toHaveAttribute('tabindex', '0')
  })
})
