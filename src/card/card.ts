import { Command } from '../command'
import { CardTypeGame } from './cardtype'

export class Card {
  /** the ordinal number of the card */
  order: number
  /** the real cardtype of the card */
  assigned?: CardTypeGame
  /** all possibilities of the card (from positive/negative information) */
  possible: CardTypeGame[]
  /** all inferences of the card (from conventions) */
  inferred: CardTypeGame[]

  clued = false
  newly_clued = false
  prompted = false
  finessed = false
  reset = false

  /** the action indexes of when a card's possibiltiies/inferences were updated */
  reasoning = []
  /** the game turns of when a card's possibiltiies/inferences were updated */
  reasoning_turn = []
  /** whether the card was rewinded or not */
  rewinded = false

  /** the entire note on the card */
  full_note = ''
  /** the most recent note on the card */
  last_note = ''

  constructor (order: number, cardtypes: CardTypeGame[]) {
    this.order = order
    this.possible = Array.from(cardtypes)
    this.inferred = Array.from(cardtypes)
  }

  toString (): string {
    if (this.possible.length === 1) return `${this.possible[0].toString()}(known)`
    if (this.inferred.length === 1) return `${this.inferred[0].toString()}(inferred)`
    if (this.assigned != null) return `${this.assigned.toString()}`
    return `[${this.possible.length}+]`
  }

  deduce (clue: Command.Get.gameAction_action_clue, touch: boolean): void {
    this.possible = this.possible.filter(ct => ct.touch(clue) === touch)
    this.inferred = this.inferred.filter(ct => ct.touch(clue) === touch)
  }
}
