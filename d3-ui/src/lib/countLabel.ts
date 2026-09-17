/**
 * The default accessible name for a label carrying a count.
 *
 * "Videos, 1 items" is the kind of thing nobody sees while reading and everyone
 * hears. The unit is the point — "Videos 1" is a label and a loose number — so
 * it is spelled out, and spelled correctly.
 */
export function countLabel(label: string, count: number, noun?: CountNoun): string {
  return `${label}, ${countWords(count, noun)}`
}

/**
 * What is being counted, in both forms — irregular plurals ("person",
 * "people") are the reason there is no `+ 's'`. Named for the CLDR plural
 * categories English uses.
 */
export interface CountNoun {
  one: string
  other: string
}

/** The visible half: "1 item", "48 items" — or "1 person", "5 people" with a noun. */
export function countWords(count: number, noun?: CountNoun): string {
  const word = noun ? (count === 1 ? noun.one : noun.other) : (count === 1 ? 'item' : 'items')
  return `${count.toLocaleString()} ${word}`
}

