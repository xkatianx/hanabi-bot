import { Command } from '../command/index.js'
import { SuitReversedSuffix } from '../constant.js'
import { fatal } from '../misc/cli.js'
import { Card } from './card.js'
import { CardTypeGame } from './cardtype.js'
import { abbreviate, COLOR, isColor, Color, suits } from './color.js'
import { variants } from './variant.js'

export class Deck {
  name: string
  id: number
  suits: string[]
  suitAbbr: string[]
  suitAmount: number
  deck: CardTypeGame[] = []
  orders: Card[] = []
  cardAmount: number
  colors: Color[] = []
  validColors: number[] = []
  validRanks: number[] = []

  constructor (variantID: number) {
    const variant = variants[variantID]
    this.name = variant.name
    this.id = variant.id
    this.suits = variant.suits // suit names in order
    this.suitAbbr = abbreviate(this.suits) // suit names abbr. in order
    this.suitAmount = this.suits.length

    this.validRanks = variant.clueRanks ?? [1, 2, 3, 4, 5]

    let counter = 0
    for (let suit = 0; suit < this.suitAmount; suit++) {
      const name = this.suits[suit]
      const abbr = this.suitAbbr[suit]
      const suitObj = suits[name]
      if (suitObj == null) fatal('unable to find suit:', name)

      let cardAmounts = [0, 3, 2, 2, 2, 1]
      // black
      if (suitObj.oneOfEach === true) cardAmounts = [0, 1, 1, 1, 1, 1]
      // critical fours
      if (variant.criticalFours === true) cardAmounts[4] = 1

      // TODO: U/D
      let playDists = [-1, 0, 1, 2, 3, 4]
      // reversed
      if (name.match(SuitReversedSuffix) != null) playDists = [-1, 4, 3, 2, 1, 0]

      // TODO: prism
      let touchingColors: number[] | boolean = []
      if (suitObj.allClueColors === true) touchingColors = true
      else if (suitObj.noClueColors === true) touchingColors = false
      else {
        const clueColors = suitObj.clueColors ?? []
        if (clueColors.length === 0) {
          for (const color in COLOR) {
            if (!isColor(color)) fatal()
            if (suitObj.name.match(color) == null) continue
            clueColors.push(color)
            break
          }
        }
        if (clueColors.length === 0) fatal('unknown suit:', suitObj.name)
        for (const c of clueColors) {
          let id = this.colors.indexOf(c)
          if (id === -1) {
            id = this.colors.length
            this.colors.push(c)
          }
          touchingColors.push(id)
        }
      }

      // TODO: many special ranks
      const touchingRanks: Array<number[] | boolean> = [[0], [1], [2], [3], [4], [5]]
      if (suitObj.allClueRanks === true) touchingRanks.fill(true)
      else if (suitObj.noClueRanks === true) touchingRanks.fill(false)

      for (let rank = 1; rank < 6; rank++) {
        // TODO: tiiah & U/D
        const gainClue = playDists[rank] === 4
        const ctg = new CardTypeGame(suit, rank, cardAmounts[rank],
          name, abbr, playDists[rank], gainClue,
          touchingColors, touchingRanks[rank])

        this.deck.push(ctg)
        counter += cardAmounts[rank]
      }
    }

    for (let i = 0; i < counter; i++) {
      this.orders.push(new Card(i, this.deck))
    }
    this.cardAmount = counter
  }

  toString (): string {
    return `(${this.id}) ${this.name} | ${this.cardAmount} cards.`
  }

  #get_cardtype (suit: number, rank: number): CardTypeGame {
    for (const ct of this.deck) {
      if (ct.suit === suit && ct.rank === rank) {
        return ct
      }
    }
    fatal(`unknown card: suit=${suit},rank=${rank}`)
  }

  get_card (deckID: number): Card {
    return this.orders[deckID]
  }

  assignCard (card: Card, cardtype: CardTypeGame, global: boolean): void {
    if (card.assigned === cardtype) return
    if (card.assigned != null) fatal('trying to assign', card.assigned, 'as', cardtype)
    card.assigned = cardtype
    if (global) card.possible = [cardtype]
  }

  deduceCard (card: Card, clue: Command.Get.gameAction_action_clue, touch: boolean): void {
    card.deduce(clue, touch)
  }

  /** Return the drawn Card. */
  update_by_draw (data: Command.Get.gameAction_action__draw): Card {
    const card = this.orders[data.order]
    // unknown card
    if (data.suitIndex === -1) return card

    const ct = this.#get_cardtype(data.suitIndex, data.rank)
    this.assignCard(card, ct, false)
    return card
  }

  /** Return bool indicating whether gain a clue */
  update_by_play (data: Command.Get.gameAction_action__play): boolean {
    const card = this.orders[data.order]
    const ct = this.#get_cardtype(data.suitIndex, data.rank)
    this.assignCard(card, ct, true)

    for (let r = 1; r < 6; r++) {
      this.#get_cardtype(data.suitIndex, r).updatePlayDist()
    }

    return ct.gainClue
  }

  /** Return bool indicating discarding critical */
  update_by_discard (data: Command.Get.gameAction_action__discard): boolean {
    const card = this.orders[data.order]
    const ct = this.#get_cardtype(data.suitIndex, data.rank)
    this.assignCard(card, ct, true)
    ct.amount -= 1
    return ct.amount === 0
  }

  update_by_clue (data: Command.Get.gameAction_action__clue): void {
  }
}
