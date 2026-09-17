import { forwardRef, useId } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf, devWarn } from '../../lib/dev'
import { Card } from '../Card/Card'
import './Section.css'

export type SectionSurface = 'card' | 'plain'

export interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Required. The region's heading, and its accessible name. */
  title: React.ReactNode
  /** `2` under a page's h1 (the default); `3` for a section inside a section. */
  headingLevel?: 2 | 3
  /** One or two lines under the title. */
  description?: React.ReactNode
  /** Trailing the title; they wrap underneath it when the row is too narrow. */
  actions?: React.ReactNode
  /**
   * `card` (the default) puts the region on a Card surface with Card's padding.
   * `plain` is a heading and content on the page's own ground — for a page that
   * is one region, or a region holding its own cards.
   */
  surface?: SectionSurface
}

/**
 * A titled region of a page: a real `<section>` named by its real heading, so
 * it appears in the outline a screen-reader user navigates by.
 *
 * It replaces a Card with a hand-rolled `h2` inside it — the console's
 * `.section-title` rendered at regular weight because it read Tailwind theme
 * names that do not exist without Tailwind.
 */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { title, headingLevel = 2, description, actions, surface = 'card', className, children, id, ...rest }, ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    if (title === undefined || title === null || title === '') {
      devWarn('Section.title', 'Section: `title` is required — it is the region\'s heading and its name. ' +
        'A region with no heading is a Card; use Card.')
    }
    devOneOf('Section', 'surface', surface, ['card', 'plain'])
    devOneOf('Section', 'headingLevel', String(headingLevel), ['2', '3'])
  }
  const auto = useId()
  const titleId = `${id ?? auto}-title`
  const Heading = headingLevel === 3 ? 'h3' : 'h2'

  const content = (
    <>
      <div className="d3-sec__head">
        <div className="d3-sec__lead">
          <Heading id={titleId} className={cn('d3-sec__title', Heading === 'h3' && 'd3-sec__title--h3')}>
            {title}
          </Heading>
          {description ? <div className="d3-sec__desc">{description}</div> : null}
        </div>
        {actions ? <div className="d3-sec__actions">{actions}</div> : null}
      </div>
      {children ? <div className="d3-sec__body">{children}</div> : null}
    </>
  )

  if (surface === 'plain') {
    return (
      <section ref={ref} id={id} aria-labelledby={titleId} className={cn('d3-sec', 'd3-sec--plain', className)} {...rest}>
        {content}
      </section>
    )
  }
  return (
    <Card ref={ref} as="section" id={id} aria-labelledby={titleId} className={cn('d3-sec', 'd3-sec--card', className)} {...rest}>
      {content}
    </Card>
  )
})
