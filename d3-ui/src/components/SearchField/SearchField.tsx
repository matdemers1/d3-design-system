import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { SearchGlyph } from '../../lib/glyphs'
import { Input, type InputProps } from '../Input/Input'
import { Kbd } from '../Kbd/Kbd'
import './SearchField.css'

export interface SearchFieldProps
  extends Omit<InputProps, 'appearance' | 'size' | 'type' | 'trailing'> {
  /**
   * The key that focuses this field, drawn as a hint at its end — `/` in a
   * list header. The app binds the key; the field only says what it is, and
   * sets `aria-keyshortcuts` so assistive technology hears the same thing.
   * The hint hides while the field has a value.
   */
  shortcut?: string
}

/**
 * The filled Input, for searching (D-073): `type="search"`, a search glyph
 * before the text, and an optional keyboard hint after it. 36px, 14px text, a
 * `bg` fill one step below the surface it sits on, the 3:1 edge every field
 * keeps, and one focus outline.
 *
 * It needs a name like any field: a visible `FormField` label, or `aria-label`
 * ("Search mail") in a header where the glyph and placement already say what
 * it is. The placeholder is not that name.
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { shortcut, leading, className, ...rest }, ref,
) {
  return (
    <Input
      ref={ref}
      {...rest}
      type="search"
      // :placeholder-shown is how the CSS knows the field is empty, and it only
      // ever matches a field that has a placeholder. A space is invisible.
      placeholder={rest.placeholder ?? ' '}
      appearance="filled"
      leading={leading ?? <SearchGlyph />}
      trailing={shortcut ? <Kbd className="d3-search__kbd">{shortcut}</Kbd> : undefined}
      aria-keyshortcuts={shortcut ?? rest['aria-keyshortcuts']}
      className={cn('d3-search', className)}
    />
  )
})
