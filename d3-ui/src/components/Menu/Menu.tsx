import { Children, cloneElement, createContext, forwardRef, isValidElement, useContext, useId } from 'react'
import * as Dropdown from '@radix-ui/react-dropdown-menu'
import { cn } from '../../lib/cn'
import { devOneOf, devWarn } from '../../lib/dev'
import { CheckGlyph } from '../../lib/glyphs'
import './Menu.css'

/*
 * A thin wrapper over Radix DropdownMenu. Radix owns the menu contract —
 * roving focus, typeahead, Escape, focus return, `aria-haspopup` and
 * `aria-expanded` on the trigger — and this file owns how it looks.
 *
 * Every part takes its own props rather than Radix's, for the same reason as
 * Tooltip and Modal (D-063): a Radix major release must not be a breaking
 * change here.
 *
 * The parts track where they are rendered, so a part used outside its parent
 * renders nothing and warns instead of throwing — Radix throws, and a menu
 * item rendered in the wrong place should not take the page down.
 */
const InRoot = createContext(false)
const InContent = createContext(false)

/** True inside a `MenuContent`. ThemeSwitch uses it to render menu radios. */
export const useInMenu = () => useContext(InContent)

export interface MenuProps {
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * `false` by default, unlike Radix. A modal menu marks the whole page
   * `aria-hidden` while it is open, though the page is still full of focusable
   * controls — axe reports that as `aria-hidden-focus`, and the WAI-ARIA menu
   * button pattern does not ask for it: the menu already keeps keyboard focus
   * (Tab does not leave it) and closes on Escape or an outside click. `true`
   * also blocks pointer events and scrolling outside while open.
   */
  modal?: boolean
}

/**
 * A list of actions or destinations behind a button — the account menu, a
 * row's overflow actions.
 *
 * A menu is for *doing* things and going places. A choice that is part of a
 * form is a Select; switching what a region shows is a SegmentedControl or Tabs.
 */
export function Menu({ children, open, defaultOpen, onOpenChange, modal = false }: MenuProps) {
  return (
    <Dropdown.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      <InRoot.Provider value={true}>{children}</InRoot.Provider>
    </Dropdown.Root>
  )
}

function outside(part: string, parent: string) {
  if (process.env.NODE_ENV !== 'production') {
    devWarn(`${part}.outside`, `${part}: render it inside <${parent}>. Outside one it has no menu to belong to, ` +
      'and renders nothing.')
  }
  return null
}

export interface MenuTriggerProps {
  /**
   * One focusable element, usually a Button or IconButton. It receives
   * `aria-haspopup`, `aria-expanded` and focus back when the menu closes.
   */
  children: React.ReactElement
}

export function MenuTrigger({ children }: MenuTriggerProps) {
  if (!useContext(InRoot)) return outside('MenuTrigger', 'Menu')
  if (!isValidElement(children)) {
    if (process.env.NODE_ENV !== 'production') {
      devWarn('MenuTrigger.children', 'MenuTrigger: pass a single focusable element, such as <Button>. ' +
        'The trigger is that element, so there is nothing to open the menu from without one.')
    }
    return null
  }
  return <Dropdown.Trigger asChild>{children}</Dropdown.Trigger>
}

export type MenuSide = 'top' | 'right' | 'bottom' | 'left'
export type MenuAlign = 'start' | 'center' | 'end'

export interface MenuContentProps {
  children?: React.ReactNode
  /** Preferred side. The menu flips when there is no room. */
  side?: MenuSide
  align?: MenuAlign
  /** Only when nothing visible names the menu; the trigger usually does. */
  'aria-label'?: string
  className?: string
}

export function MenuContent({ children, side = 'bottom', align = 'start', className, ...rest }: MenuContentProps) {
  if (!useContext(InRoot)) return outside('MenuContent', 'Menu')
  return (
    <Dropdown.Portal>
      <Dropdown.Content
        side={side}
        align={align}
        sideOffset={6}
        collisionPadding={8}
        className={cn('d3-menu', className)}
        {...rest}
      >
        <InContent.Provider value={true}>{children}</InContent.Provider>
      </Dropdown.Content>
    </Dropdown.Portal>
  )
}

export type MenuItemTone = 'default' | 'danger'

export interface MenuItemProps {
  children?: React.ReactNode
  /** Decorative; the text names the item. */
  icon?: React.ReactNode
  /**
   * `danger` for an item that destroys or ends something. Sign-out is the usual
   * one. A destructive item that cannot be undone should open a confirming
   * `Modal destructive`, not act on select.
   */
  tone?: MenuItemTone
  disabled?: boolean
  /** Fires on click, Enter and Space. Call `event.preventDefault()` to keep the menu open. */
  onSelect?: (event: Event) => void
  /**
   * Render the single child element as the item — an `<a href>`, a router link,
   * or a `<button type="submit" form="…">` — so a destination is a real link and
   * a form post is a real form post. The child keeps its own text.
   */
  asChild?: boolean
  className?: string
}

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem(
  { children, icon, tone = 'default', disabled, onSelect, asChild = false, className },
  ref,
) {
  const inContent = useContext(InContent)
  if (process.env.NODE_ENV !== 'production') {
    devOneOf('MenuItem', 'tone', tone, ['default', 'danger'])
  }
  if (!inContent) return outside('MenuItem', 'MenuContent')
  const cls = cn('d3-menu__item', tone === 'danger' && 'd3-menu__item--danger', className)
  const glyph = icon ? <span className="d3-menu__icon" aria-hidden="true">{icon}</span> : null

  if (asChild) {
    const child = Children.toArray(children).find(isValidElement) as
      React.ReactElement<{ children?: React.ReactNode }> | undefined
    if (!child) {
      if (process.env.NODE_ENV !== 'production') {
        devWarn('MenuItem.asChild', 'MenuItem: `asChild` needs one element child, such as <a href="…">.')
      }
      return null
    }
    return (
      <Dropdown.Item ref={ref} asChild disabled={disabled} onSelect={onSelect} className={cls}>
        {cloneElement(child, undefined, <>{glyph}{child.props.children}</>)}
      </Dropdown.Item>
    )
  }
  return (
    <Dropdown.Item ref={ref} disabled={disabled} onSelect={onSelect} className={cls}>
      {glyph}
      {children}
    </Dropdown.Item>
  )
})

export function MenuSeparator({ className }: { className?: string }) {
  if (!useContext(InContent)) return outside('MenuSeparator', 'MenuContent')
  return <Dropdown.Separator className={cn('d3-menu__sep', className)} />
}

export interface MenuLabelProps {
  children?: React.ReactNode
  id?: string
  className?: string
}

/**
 * A visible heading for the items after it. It is not announced as a name on
 * its own; for a set of choices, the group it heads is labelled by it.
 */
export function MenuLabel({ children, id, className }: MenuLabelProps) {
  if (!useContext(InContent)) return outside('MenuLabel', 'MenuContent')
  return <Dropdown.Label id={id} className={cn('d3-menu__label', className)}>{children}</Dropdown.Label>
}

/*
 * Not exported from the package. A named group of `menuitemradio`s, used by
 * ThemeSwitch; kept internal until a second consumer shows what its public
 * shape should be.
 */
export interface MenuRadioOption { value: string; label: string }

export function MenuRadioGroup({ label, value, onValueChange, options }: {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: MenuRadioOption[]
}) {
  const id = useId()
  if (!useContext(InContent)) return outside('MenuRadioGroup', 'MenuContent')
  return (
    <Dropdown.RadioGroup value={value} onValueChange={onValueChange} aria-labelledby={id} className="d3-menu__group">
      <Dropdown.Label id={id} className="d3-menu__label">{label}</Dropdown.Label>
      {options.map((o) => (
        <Dropdown.RadioItem
          key={o.value}
          value={o.value}
          className="d3-menu__item d3-menu__item--radio"
          // Choosing a mode keeps the menu open: the change is the feedback,
          // and closing would hide the thing that just changed.
          onSelect={(e) => e.preventDefault()}
        >
          <span className="d3-menu__tick" aria-hidden="true">
            <Dropdown.ItemIndicator><CheckGlyph size={12} /></Dropdown.ItemIndicator>
          </span>
          {o.label}
        </Dropdown.RadioItem>
      ))}
    </Dropdown.RadioGroup>
  )
}
