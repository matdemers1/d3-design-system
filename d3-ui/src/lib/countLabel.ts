/**
 * The default accessible name for a label carrying a count.
 *
 * "Videos, 1 items" is the kind of thing nobody sees while reading and everyone
 * hears. The unit is the point — "Videos 1" is a label and a loose number — so
 * it is spelled out, and spelled correctly.
 */
export function countLabel(label: string, count: number): string {
  return `${label}, ${countWords(count)}`
}

/** The visible half: "1 item", "48 items". */
export function countWords(count: number): string {
  return `${count.toLocaleString()} item${count === 1 ? '' : 's'}`
}

