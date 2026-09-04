import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import './Skeleton.css'

export type SkeletonVariant = 'text' | 'block' | 'circle'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
  width?: number | string
  height?: number | string
  /** For `text`: how many lines. Widths vary so it reads like real text. */
  lines?: number
}

/**
 * A placeholder shaped like the content that is coming — the system's preferred
 * loading state.
 *
 * Always `aria-hidden`: it is scaffolding, not content. The **container** carries
 * `aria-busy` while loading, and announces the outcome politely when it resolves,
 * or the transition from loading to loaded is silent.
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { variant = 'text', width, height, lines = 1, className, style, ...rest },
  ref,
) {
  const LINE_WIDTHS = ['92%', '78%', '85%', '64%'] as const

  if (variant === 'text' && lines > 1) {
    return (
      <div ref={ref} className={cn('d3-skl__lines', className)} aria-hidden="true" style={style} {...rest}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className="d3-skl d3-skl--text"
            style={{ width: width ?? LINE_WIDTHS[i % LINE_WIDTHS.length] }}
          />
        ))}
      </div>
    )
  }
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn('d3-skl', `d3-skl--${variant}`, className)}
      style={{ width, height, ...style }}
      {...rest}
    />
  )
})
