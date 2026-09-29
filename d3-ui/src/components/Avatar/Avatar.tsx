import { forwardRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { devOneOf, devWarn } from '../../lib/dev'
import './Avatar.css'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg'
export type AvatarTintNumber = 1 | 2 | 3 | 4 | 5 | 6
export type AvatarTint = 'auto' | 'none' | AvatarTintNumber

const TINTS = ['auto', 'none', '1', '2', '3', '4', '5', '6'] as const

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
  /**
   * Initials fill. `none` (default) is the neutral look; `auto` picks one of six
   * pastel tints from a stable hash of `name`, so the same person is the same
   * colour in every list and every app; `1`–`6` pins one. Identity, never status
   * (D-081). Images are unaffected.
   */
  tint?: AvatarTint
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

/**
 * The tint `tint="auto"` gives a name, 1–6.
 *
 * FNV-1a, 32-bit, over the UTF-8 bytes of the trimmed, lower-cased name, modulo
 * six. It is written out rather than borrowed so that it cannot change under
 * anyone: the same name must get the same tint on every render, in every app
 * and in every release, and a test pins known names. Changing this function
 * recolours every avatar in every app — treat it as a public contract.
 * An empty name has no tint (returns `undefined`); it shows the fallback icon.
 */
export function avatarTintFor(name: string): AvatarTintNumber | undefined {
  const normal = name.trim().toLowerCase()
  if (!normal) return undefined
  let hash = 0x811c9dc5
  for (const byte of new TextEncoder().encode(normal)) {
    hash ^= byte
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return ((hash % 6) + 1) as AvatarTintNumber
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, size = 'md', tint = 'none', decorative = true, fallbackIcon, className, ...rest },
  ref,
) {
  if (process.env.NODE_ENV !== 'production') {
    // Only a *missing* name. An empty string is data — somebody with no name on
    // file — and falling back to an icon is the documented behaviour for it.
    if (typeof name !== 'string') {
      devWarn('Avatar.name', 'Avatar: `name` is required — it supplies both the initials and the accessible name.')
    }
    devOneOf('Avatar', 'tint', String(tint), TINTS)
  }
  const [failed, setFailed] = useState(false)
  const initials = initialsOf(name ?? '')
  const showImage = Boolean(src) && !failed
  // A bad value falls back to neutral (and warns above) rather than to a class
  // that matches no rule.
  const pinned = Number(tint)
  const tinted = tint === 'auto'
    ? avatarTintFor(name ?? '')
    : Number.isInteger(pinned) && pinned >= 1 && pinned <= 6 ? pinned : undefined

  return (
    <span
      ref={ref}
      className={cn('d3-avt', `d3-avt--${size}`, tinted && `d3-avt--tint-${tinted}`, className)}
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
