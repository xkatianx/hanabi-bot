import axios from 'axios'
import { fatal } from '../misc/cli.js'
import { Suit, Variant } from './index.js'

const variantJsonUrl = 'https://raw.githubusercontent.com/Hanabi-Live/hanabi-live/main/packages/data/src/json/variants.json'
const suitJsonUrl = 'https://raw.githubusercontent.com/Hanabi-Live/hanabi-live/main/packages/data/src/json/suits.json'

async function getAllVariants (): Promise<Variant[]> {
  const res = await axios.get(variantJsonUrl)
  if (res.status !== 200) fatal('failed to get variants')
  return res.data
}

async function getAllSuits (): Promise<Suit[]> {
  const res = await axios.get(suitJsonUrl)
  if (res.status !== 200) fatal('failed to get suits')
  return res.data
}

const variants: { [id: number]: Variant } = {}
for (const v of await getAllVariants()) {
  variants[v.id] = v
}
const suits: { [name: string]: Suit } = {}
for (const s of await getAllSuits()) {
  suits[s.name] = s
}

export { variants, suits }
