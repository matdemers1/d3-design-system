import { describe, it, expect } from 'vitest'
import {
  formatRecipient, isOpenToken, isValidAddress, parseRecipient, parseRecipients, recipientInitials,
  splitRecipients,
} from './parse'

describe('splitRecipients', () => {
  it('splits on commas, semicolons and newlines, dropping empties', () => {
    expect(splitRecipients('a@x.io, b@x.io;c@x.io\nd@x.io\r\n,, ;')).toEqual(['a@x.io', 'b@x.io', 'c@x.io', 'd@x.io'])
  })

  it('keeps a comma inside a quoted name or an <address> together', () => {
    expect(splitRecipients('"Shah, Priya" <priya@x.io>, Jonah <jonah@x.io>'))
      .toEqual(['"Shah, Priya" <priya@x.io>', 'Jonah <jonah@x.io>'])
    expect(splitRecipients('Odd <a,b@x.io>; c@x.io')).toEqual(['Odd <a,b@x.io>', 'c@x.io'])
  })
})

describe('isOpenToken', () => {
  it('is true while a quote or angle bracket is unclosed', () => {
    expect(isOpenToken('"Shah')).toBe(true)
    expect(isOpenToken('Priya <priya')).toBe(true)
    expect(isOpenToken('"Shah, Priya" <priya@x.io>')).toBe(false)
    expect(isOpenToken('priya@x.io')).toBe(false)
  })
})

describe('parseRecipient', () => {
  it.each([
    ['priya@x.io', { address: 'priya@x.io' }],
    ['  priya@x.io  ', { address: 'priya@x.io' }],
    ['Priya Shah <priya@x.io>', { name: 'Priya Shah', address: 'priya@x.io' }],
    ['"Shah, Priya" <priya@x.io>', { name: 'Shah, Priya', address: 'priya@x.io' }],
    ['<priya@x.io>', { address: 'priya@x.io' }],
    ['Priya@X.io <priya@x.io>', { address: 'priya@x.io' }],
    ['Priya <  priya@x.io  >', { name: 'Priya', address: 'priya@x.io' }],
    ['"priya@x.io"', { address: 'priya@x.io' }],
  ])('%s', (input, want) => {
    expect(parseRecipient(input)).toEqual(want)
  })

  it('an empty token is nothing', () => {
    expect(parseRecipient('   ')).toBeNull()
    expect(parseRecipient('<>')).toBeNull()
  })

  it('keeps the case of the local part', () => {
    expect(parseRecipient('Priya.Shah@X.io')).toEqual({ address: 'Priya.Shah@X.io' })
  })
})

describe('parseRecipients', () => {
  it('parses a pasted list in order', () => {
    const pasted = 'Priya Shah <priya@x.io>; jonah@x.io\n"Park, Elena" <elena@x.io>,'
    expect(parseRecipients(pasted)).toEqual([
      { name: 'Priya Shah', address: 'priya@x.io' },
      { address: 'jonah@x.io' },
      { name: 'Park, Elena', address: 'elena@x.io' },
    ])
  })
})

describe('isValidAddress', () => {
  it.each(['priya@x.io', 'a.b+tag@mail.example.co.uk', 'x_y@d3cloud.io'])('accepts %s', (a) => {
    expect(isValidAddress(a)).toBe(true)
  })
  it.each(['priya', 'priya@', '@x.io', 'priya@x', 'pri ya@x.io', 'a@@x.io', 'a@x..io', 'a@x.io.', '<a@x.io>'])(
    'rejects %s', (a) => { expect(isValidAddress(a)).toBe(false) },
  )
})

describe('recipientInitials and formatRecipient', () => {
  it('initials come from the first and last name, else the address', () => {
    expect(recipientInitials({ name: 'Priya Shah', address: 'p@x.io' })).toBe('PS')
    expect(recipientInitials({ name: 'Jonah Q. Reyes', address: 'j@x.io' })).toBe('JR')
    expect(recipientInitials({ name: 'Cher', address: 'c@x.io' })).toBe('C')
    expect(recipientInitials({ address: 'linda.demers@gmail.com' })).toBe('L')
    expect(recipientInitials({ name: '  ', address: '_x@y.io' })).toBe('X')
  })

  it('round-trips through parse', () => {
    for (const r of [
      { name: 'Priya Shah', address: 'priya@x.io' },
      { name: 'Shah, Priya', address: 'priya@x.io' },
      { address: 'priya@x.io' },
    ]) {
      expect(parseRecipient(formatRecipient(r))).toEqual(r)
    }
  })
})
