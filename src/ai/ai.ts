import { Command } from '../command'
import { GameState } from './gamestate.js'
import { fatal } from '../misc/cli.js'
import { randBetween } from '../misc/math.js'

interface MyActionPlay {
  type: 'play'
  order: number
}
interface MyActionToss {
  type: 'toss'
  order: number
}

interface MyActionSuit {
  type: 'suit'
  /** 0 is the first player, 1 is the second player, so on */
  player: number
  /** 0 is the first color (red), so on */
  suit: number
}
interface MyActionRank {
  type: 'rank'
  /** 0 is the first player, 1 is the second player, so on */
  player: number
  /** 1 is 1, so on */
  rank: number
}

export type MyAction = MyActionPlay | MyActionRank | MyActionSuit | MyActionToss

export class AI {
  #gamestate?: GameState
  setGameState (gamestate: GameState): void {
    this.#gamestate = gamestate
  }

  handleAction (action: Command.Get.gameAction_action): void {
    if (this.#gamestate == null) fatal('use ai.setGameState(...) first')
    this.#gamestate?.handleAction(action)
  }

  /** return null it it is not our turn */
  getAction (): MyAction | null {
    const gs = this.#gamestate
    if (gs == null) fatal('use ai.setGameState(...) first')
    if (!gs.isMyTurn()) return null

    gs.inTurn = true

    // random action
    const randomPlayerId = randBetween(0, gs.numPlayers - 1)
    const randomPlayer = gs.players[randomPlayerId]
    const randomSlot = randBetween(1, randomPlayer.hand.length)
    const card = randomPlayer.slot(randomSlot)
    const cardtype = card.assigned

    if (randomPlayerId === gs.ourPlayerIndex) {
      if (gs.canDiscard()) return { type: 'toss', order: card.order }
      else return { type: 'play', order: card.order }
    } else {
      if (cardtype == null) fatal('unassigned card:', card)
      if (randBetween(0, 1) === 0) {
        return { type: 'suit', player: randomPlayerId, suit: cardtype.suit }
      } else {
        return { type: 'rank', player: randomPlayerId, rank: cardtype.rank }
      }
    }
  }
}
