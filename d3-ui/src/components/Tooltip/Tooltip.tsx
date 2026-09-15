import { createContext, useContext, useEffect, useRef } from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import { cn } from '../../lib/cn'
import { devWarn } from '../../lib/dev'
import './Tooltip.css'

export interface TooltipProps {
  /** Text only. **No links, no buttons** — a tooltip cannot be hovered into. */
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** 400ms on hover so it does not flash while crossing a toolbar. Focus is always 0ms. */
  delayDuration?: number
  className?: string
}

/**
 * A short label or clarification, on hover **and on keyboard focus**.
 *
 * The focus case is the entire reason this component exists: Bindery has 42
 * bare `title=` attributes, and a native title never appears on keyboard focus,
 * cannot be styled, and does not exist on touch.
 *
 * **Nothing essential may live only in a tooltip** — if it matters on a phone,
 * it is help text.
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'

/** True beneath a TooltipProvider, so a Tooltip knows whether to supply its own. */
const Provided = createContext(false)

export function Tooltip({ content, children, side = 'top', delayDuration = 400, className }: TooltipProps) {
  const provided = useContext(Provided)
  // Typed as a button because Radix types the trigger that way; with `asChild`
  // it is really whatever element the child renders.
  const trigger = useRef<HTMLButtonElement>(null)

  // Development only. A tooltip on something that cannot take focus appears on
  // hover and nowhere else — never to a keyboard user and never on touch, which
  // is the whole population a tooltip on focus exists to reach. A status badge
  // is the usual culprit, and it is half of what Bindery used `title=` for.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const el = trigger.current
      if (el && !el.matches(FOCUSABLE)) {
        devWarn('Tooltip.focusable', `Tooltip: the trigger <${el.tagName.toLowerCase()}> cannot receive focus, ` +
          'so this tooltip only ever appears on hover. Put it on a focusable element, give the trigger ' +
          'tabIndex={0}, or show the explanation as visible text.')
      }
    }
  }, [])

  const tip = (
    <RadixTooltip.Root delayDuration={delayDuration}>
      <RadixTooltip.Trigger asChild ref={trigger}>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content className={cn('d3-tip', className)} side={side} sideOffset={6}>
          {content}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
  // Radix throws unless a Provider sits somewhere above every Tooltip, and
  // nothing about that is visible until the first one renders — the stories
  // wrap themselves, so it never showed there. So a Tooltip supplies its own
  // when it has to. Wrapping the app once is still better, and is what the
  // Provider is for: it groups delays so crossing a toolbar does not re-wait.
  return provided ? tip : <RadixTooltip.Provider delayDuration={delayDuration}>{tip}</RadixTooltip.Provider>
}

/** Optional. Wrap the app once to share delays between tooltips. */
export function TooltipProvider(props: React.ComponentProps<typeof RadixTooltip.Provider>) {
  return (
    <Provided.Provider value={true}>
      <RadixTooltip.Provider {...props} />
    </Provided.Provider>
  )
}
