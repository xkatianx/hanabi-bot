import { fatal } from '../misc/cli.js'
import { Card } from './card'

export class Player {
  id: number
  name: string
  hand: Card[] = []
  constructor (id: number, name: string) {
    this.id = id
    this.name = name
  }

  toString (): string {
    return this.name + ': [' + this.hand.map(c => c.toString()).join(',') + ']'
  }

  /** Remove a card given deck-index. Return the removed card. */
  remove (order: number): Card {
    const i = this.hand.findIndex(v => v.order === order)
    if (i === -1) fatal(`unable to remove order ${order} from`, this.hand.map(c => c.order))
    const [card] = this.hand.splice(i, 1)
    return card
  }

  /** draw a card given {Card} */
  add (card: Card): void {
    this.hand.unshift(card)
  }

  /** return #{slot} */
  slot (slot: number): Card {
    return this.hand[slot - 1]
  }
}
