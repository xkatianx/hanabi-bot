import axios from 'axios'
import { fatal } from '../misc/cli.js'

const variantJsonUrl = 'https://raw.githubusercontent.com/Hanabi-Live/hanabi-live/main/packages/data/src/json/variants.json'

export interface Variant {
  id: number
  name: string
  suits: string[]
  specialRank?: number
  specialNoClueColors?: true
  specialNoClueRanks?: true
  specialAllClueRanks?: true
  specialAllClueColors?: true
  specialDeceptive?: true
  clueRanks?: number[]
  criticalFours?: true
  // and more
}

const variants: { [id: number]: Variant } = {}

const res = await axios.get(variantJsonUrl)
if (res.status !== 200) fatal('failed to get variants')

for (const v of res.data) variants[v.id] = v

export { variants }
