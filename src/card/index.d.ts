import { COLOR } from './color'

type ColorCode = `#${number}`

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

export interface Suit {
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
