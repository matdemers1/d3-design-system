import * as RadixTooltip from '@radix-ui/react-tooltip'
import { cn } from '../../lib/cn'
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
export function Tooltip({ content, children, side = 'top', delayDuration = 400, className }: TooltipProps) {
  return (
    <RadixTooltip.Root delayDuration={delayDuration}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content className={cn('d3-tip', className)} side={side} sideOffset={6}>
          {content}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}

/** Wrap the app once. Groups delays so crossing a toolbar does not re-wait. */
export const TooltipProvider = RadixTooltip.Provider
