import clsx, { type ClassValue } from 'clsx'

/** Every class this library emits is prefixed `d3-`. App C already
 *  ships `.btn`, `.btn-primary`, `.badge`, `.alert`, `.panel` and `.skeleton`;
 *  during migration both stylesheets are loaded at once, so an unprefixed
 *  library would silently restyle the app it is replacing (D-036). */
export const cn = (...parts: ClassValue[]) => clsx(parts)
