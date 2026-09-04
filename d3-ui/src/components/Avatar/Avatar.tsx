import { forwardRef, useState } from 'react'
import { cn } from '../../lib/cn'
import './Avatar.css'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg'

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The person's name. Used for initials and, when not decorative, the name. */
  name: string
  src?: string
  size?: AvatarSize
  /**
   * `true` when the person's name is already beside it — a message row, a table
   * cell. The avatar is then hidden from assistive technology so the name is not
   * announced twice. Defaults to `true` because that is the common case.
   */
  decorative?: boolean
  /** Shown when there is no image and no usable initials. */
  fallbackIcon?: React.ReactNode
}

/** First letter of the first and last name tokens, at most two. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, size = 'md', decorative = true, fallbackIcon, className, ...rest },
  ref,
) {
  const [failed, setFailed] = useState(false)
  const initials = initialsOf(name)
  const showImage = Boolean(src) && !failed

  return (
    <span
      ref={ref}
      className={cn('d3-avt', `d3-avt--${size}`, className)}
      {...(decorative
        ? { 'aria-hidden': true as const }
        : { role: 'img' as const, 'aria-label': name })}
      {...rest}
    >
      {showImage ? (
        <img className="d3-avt__img" src={src} alt="" onError={() => setFailed(true)} />
      ) : initials ? (
        initials
      ) : (
        (fallbackIcon ?? null)
      )}
    </span>
  )
})
