import axios from 'axios'
import { fatal } from '../misc/cli.js'

const suitJsonUrl = 'https://raw.githubusercontent.com/Hanabi-Live/hanabi-live/main/packages/data/src/json/suits.json'
type ColorCode = `#${number}`
interface Suit {
  name: string // "Red"
  id: string
  pip: string
  abbreviation?: string
  displayName?: string
  showSuitName?: true
  createVariants?: true
  fill?: ColorCode | 'multi'
  fillColors?: ColorCode[]
  oneOfEach?: true
  prism?: true
  clueColors?: Array<keyof typeof COLOR>
  allClueColors?: true
  noClueColors?: true
  noClueRanks?: true
  allClueRanks?: true
  // maybe and more
}

const suits: { [name: string]: Suit } = {}

const res = await axios.get(suitJsonUrl)
if (res.status !== 200) fatal('failed to get suits')
for (const s of res.data) suits[s.name] = s

export { suits }

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
export type Color = keyof typeof COLOR

export const MORECOLOR = {
  Rainbow: 'm',
  Null: 'u',
  Forest: 'r',
  Sky: 's'
}
Object.freeze(MORECOLOR)

export function isColor (color: string): color is Color {
  return color in COLOR
}

export function abbreviate (suits: string[]): string[] {
  const abbrs = Array.from(suits)
  for (let i = 0; i < abbrs.length; i++) {
    for (const [color, abbr] of Object.entries(Object.assign({}, COLOR, MORECOLOR))) {
      if (abbrs.includes(abbr) || abbrs[i].match(color) == null) continue
      abbrs[i] = abbr
      break
    }
  }
  for (let i = 0; i < abbrs.length; i++) {
    if (abbrs[i].length === 1) continue
    for (const l of abbrs[i].split('')) {
      if (abbrs.includes(l) || l === ' ') continue
      abbrs[i] = l.toLowerCase()
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
