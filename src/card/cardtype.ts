import { Command } from '../command/index.js'
import { fatal } from '../misc/cli.js'
export class CardTypeBasic {
  suitAbbr: string
  rank: number
  playDist: number
  touchingColor: number[] | boolean // true for all
  touchingRank: number[] | boolean // false for none
  gainClue: boolean
  constructor (
    suitAbbr: string,
    rank: number,
    playDist: number,
    touchingColor: number[] | boolean,
    touchingRank: number[] | boolean,
    gainClue: boolean
  ) {
    this.suitAbbr = suitAbbr
    this.rank = rank
    this.playDist = playDist
    this.touchingRank = touchingRank
    this.touchingColor = touchingColor
    this.gainClue = gainClue
  }

  toString (): string {
    return `${this.suitAbbr}${this.rank}`
  }

  /** Return true if this card will be touched by clue. */
  touch (clue: Command.Get.gameAction_action_clue): boolean {
    // color
    if (clue.type === 0) {
      if (typeof this.touchingColor === 'boolean') return this.touchingColor
      return this.touchingColor.includes(clue.value)
    }
    // rank
    if (clue.type === 1) {
      if (typeof this.touchingRank === 'boolean') return this.touchingRank
      return this.touchingRank.includes(clue.value)
    }

    fatal('Received unexpected clue :', clue)
  }
}

export class CardTypeGame extends CardTypeBasic {
  suit: number
  order: number[]
  globallyKnown: boolean[]
  amount: number // how many are in the deck
  amountNow: number // how many are not in trash bin
  playDistNow: number
  suitName: string
  constructor (
    suit: number, // 0 ~ 5
    rank: number, // 1 ~ 5
    amount: number,
    suitName: string,
    suitNameAbbr: string,
    playDist: number, // n means n-away from playable.
    gainClue: boolean,
    touchingColor: number[] | boolean,
    touchingRank: number[] | boolean
  ) {
    super(suitNameAbbr, rank, playDist, touchingColor, touchingRank, gainClue)
    this.suit = suit
    this.suitName = suitName
    this.amount = amount
    this.amountNow = amount
    this.order = Array(amount).fill(-1)
    this.globallyKnown = Array(amount).fill(false)
    this.playDistNow = playDist
  }

  add_order (order: number, globallyKnown: boolean): boolean {
    for (let i = 0; i < this.order.length; i++) {
      if (this.order[i] !== -1 && this.order[i] !== order) {
        continue
      }
      this.order[i] = order
      this.globallyKnown[i] = globallyKnown
      return this.last()
    }

    fatal('unexpected error.')
  }

  last (): boolean {
    return !this.globallyKnown.some(v => !v)
  }

  is_playable (): boolean {
    return this.playDistNow === 0
  }

  is_trash (): boolean {
    return this.playDistNow < 0
  }

  full_assigned (): boolean {
    return this.order.at(-1) !== -1
  }

  /** called when a card of this suit is succesfully played */
  updatePlayDist (): void {
    this.playDistNow--
  }

  /** called when one of this cardtype is discarded. return whether all of this cardtype are discarded */
  discardOnce (): boolean {
    this.amountNow--
    return this.amountNow === 0
  }
}
