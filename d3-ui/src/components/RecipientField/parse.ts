/**
 * Recipient parsing — what a person types or pastes into an address field.
 *
 * Deliberately small. It understands the shapes people actually produce —
 * a bare address, `Name <addr>`, `"Last, First" <addr>`, `<addr>` — and lists
 * of them separated by commas, semicolons or newlines, which is what a copy
 * out of a spreadsheet, another mail client or a signature gives you. It is
 * not an RFC 5322 parser and does not pretend to be: group syntax, comments
 * and quoted local parts are the server's business, and the server re-checks
 * every address anyway.
 */

export interface Recipient {
  /** Display name, when one is known. */
  name?: string
  /** The address. Kept as typed, trimmed; never lower-cased (the local part is case-sensitive). */
  address: string
}

/**
 * Splits on `,` `;` and newlines that are outside double quotes and angle
 * brackets, so `"Shah, Priya" <priya@example.com>` stays one recipient.
 * Empty pieces are dropped.
 */
export function splitRecipients(text: string): string[] {
  const out: string[] = []
  let cur = ''
  let quoted = false
  let angled = false
  for (const ch of text) {
    if (ch === '"' && !angled) quoted = !quoted
    else if (ch === '<' && !quoted) angled = true
    else if (ch === '>' && !quoted) angled = false
    if (!quoted && !angled && (ch === ',' || ch === ';' || ch === '\n' || ch === '\r')) {
      if (cur.trim()) out.push(cur.trim())
      cur = ''
      continue
    }
    cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

/** True while `text` has an unclosed `"` or `<` — a separator typed now is part of the name. */
export function isOpenToken(text: string): boolean {
  let quoted = false
  let angled = false
  for (const ch of text) {
    if (ch === '"' && !angled) quoted = !quoted
    else if (ch === '<' && !quoted) angled = true
    else if (ch === '>' && !quoted) angled = false
  }
  return quoted || angled
}

/**
 * One recipient from one token. `Name <addr>` and `<addr>` give the part in
 * brackets as the address; anything else is taken whole as the address. A
 * name is unquoted and trimmed, and dropped when it only repeats the address.
 */
export function parseRecipient(token: string): Recipient | null {
  const t = token.trim()
  if (!t) return null
  const m = /^(.*?)<([^<>]*)>\s*$/.exec(t)
  if (m) {
    const address = m[2]!.trim()
    let name = m[1]!.trim()
    if (name.startsWith('"') && name.endsWith('"') && name.length >= 2) name = name.slice(1, -1).trim()
    if (!address) return name ? { address: name } : null
    return name && name.toLowerCase() !== address.toLowerCase() ? { name, address } : { address }
  }
  return { address: t.replace(/^"(.*)"$/, '$1').trim() }
}

/** Every recipient in a pasted or typed string, in order. */
export function parseRecipients(text: string): Recipient[] {
  return splitRecipients(text).map(parseRecipient).filter((r): r is Recipient => r !== null)
}

/**
 * A pragmatic check — one `@`, something on both sides, a dot in the domain,
 * no spaces or brackets. It decides only how a chip is drawn (the danger tone);
 * it never refuses input. Pass `validate` to RecipientField to replace it.
 */
export function isValidAddress(address: string): boolean {
  return /^[^\s@<>()[\]",;:\\]+@[^\s@<>()[\]",;:\\.]+(?:\.[^\s@<>()[\]",;:\\.]+)+$/.test(address)
}

/** Two initials from the name, or the first letter of the address when there is none. */
export function recipientInitials(r: Recipient): string {
  const name = r.name?.trim()
  if (name) {
    const parts = name.split(/\s+/).filter((p) => /[\p{L}\p{N}]/u.test(p))
    const first = parts[0]?.match(/[\p{L}\p{N}]/u)?.[0] ?? ''
    const last = parts.length > 1 ? (parts[parts.length - 1]!.match(/[\p{L}\p{N}]/u)?.[0] ?? '') : ''
    if (first) return (first + last).toUpperCase()
  }
  return (r.address.match(/[\p{L}\p{N}]/u)?.[0] ?? '?').toUpperCase()
}

/** `Name <addr>`, or the bare address — the canonical text form. */
export function formatRecipient(r: Recipient): string {
  if (!r.name) return r.address
  const name = /[",;<>@]/.test(r.name) ? `"${r.name.replace(/"/g, '')}"` : r.name
  return `${name} <${r.address}>`
}
