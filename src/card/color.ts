export const COLOR = {
  Red: 'r',
  Yellow: 'y',
  Green: 'g',
  Blue: 'b',
  Purple: 'p',
  Teal: 't',
  Black: 'k',
  Pink: 'i',
  Brown: 'n'
}
Object.freeze(COLOR)

export const MORECOLOR = {
  Rainbow: 'm',
  Null: 'u',
  Forest: 'r',
  Sky: 's'
}
Object.freeze(MORECOLOR)

export function isColor (color: string): color is keyof typeof COLOR {
  return Object.keys(COLOR).includes(color)
}

const ABBR: { [color: string]: string } = {}
for (const [k, v] of Object.entries(COLOR)) ABBR[k.toLowerCase()] = v
for (const [k, v] of Object.entries(MORECOLOR)) ABBR[k.toLowerCase()] = v

export function abbreviate (suits: string[]): string[] {
  const abbrs = suits.map(c => c.toLowerCase())
  for (let i = 0; i < abbrs.length; i++) {
    for (const [full, abbr] of Object.entries(ABBR)) {
      if (abbrs[i].match(full) != null) {
        if (!abbrs.includes(abbr)) abbrs[i] = abbr
      }
    }
  }
  for (let i = 0; i < abbrs.length; i++) {
    if (abbrs[i].length === 1) continue
    for (const l of abbrs[i].split('')) {
      if (abbrs.includes(l)) continue
      abbrs[i] = l
      break
    }
  }
  for (let i = 0; i < abbrs.length; i++) {
    if (abbrs[i].length === 1) continue
    for (const l of 'abcdefghijklmnopqrstuvwxyz'.split('')) {
      if (abbrs.includes(l)) continue
      abbrs[i] = l
      break
    }
  }
  return abbrs
}
