import axios from 'axios'
import { fatal } from '../misc/cli.js'
import { Variant } from './index.js'

const variantJsonUrl = 'https://raw.githubusercontent.com/Hanabi-Live/hanabi-live/main/packages/data/src/json/variants.json'

const variants: { [id: number]: Variant } = {}

const res = await axios.get(variantJsonUrl)
if (res.status !== 200) fatal('failed to get variants')

for (const v of res.data) variants[v.id] = v

export { variants }
