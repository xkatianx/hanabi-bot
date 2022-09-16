import { Command } from './command'
import { Deck } from './card/deck.js'
import { debug } from './misc/cli.js'
import { Player } from './card/player.js'
import { MaxClueNum } from './constant.js'

export class GameState {
  turn_count = 0
  clue_tokens = MaxClueNum
  playerNames: string[]
  numPlayers: number
  ourPlayerIndex: number
  players: Player[] = []
  num_suits = 5
  play_stacks: number[] = []
  hypo_stacks: number[] = []
  discard_stacks: number[][] = []
  // all_possible: Card[] = []
  max_ranks: number[] = []
  actionList: Command.Get.gameAction_action[] = []
  waiting_connections = []
  early_game = true
  cards_left: number
  blank?: GameState
  rewind_depth = 0

  deck: Deck
  strikes = 0
  inTurn = true

  constructor (data: Command.Get.init, isBlank = false) {
    this.playerNames = data.playerNames
    this.numPlayers = this.playerNames.length
    this.ourPlayerIndex = data.ourPlayerIndex
    this.deck = new Deck(data.options.variantID)
    this.cards_left = this.deck.cardAmount

    for (let i = 0; i < this.numPlayers; i++) {
      this.players.push(new Player(i, data.playerNames[i]))
    }

    for (let suitIndex = 0; suitIndex < this.num_suits; suitIndex++) {
      this.play_stacks.push(0)
      this.hypo_stacks.push(0)
      this.discard_stacks.push([0, 0, 0, 0, 0])
      this.max_ranks.push(5)
    }

    // Save blank state
    if (!isBlank) this.blank = new GameState(data, true)
  }

  /*
  rewind (state, action_index, playerIndex, order, suitIndex, rank, bomb, tableID) {
    if (this.rewind_depth > 2) {
      throw new Error('attempted to rewind too many times!')
    } else if (action_index === undefined) {
      fail('tried to rewind before any reasoning was done!')
      return
    }
    this.rewind_depth++

    info(`expected ${Utils.logCard(suitIndex, rank)}, rewinding to action_index ${action_index}`)
    const new_state = Utils.objClone(state.blank)
    new_state.blank = Utils.objClone(new_state)
    const history = state.actionList.slice(0, action_index)

    // Get up to speed
    for (const action of history) {
      handle_action(new_state, action, tableID, true)
    }

    logger.setLevel(logger.LEVELS.INFO)

    // Rewrite and save as a rewind action
    const known_action = { type: 'rewind', order, playerIndex, suitIndex, rank }
    handle_action(new_state, known_action, tableID, true)
    logger.warn('Rewriting order', order, 'to', Utils.logCard(suitIndex, rank))

    const pivotal_action = state.actionList[action_index]
    pivotal_action.mistake = bomb || rewind_depth > 1
    logger.info('pivotal action', pivotal_action)
    handle_action(new_state, pivotal_action, tableID, true)

    // Redo all the following actions
    const future = state.actionList.slice(action_index + 1)
    for (const action of future) {
      handle_action(new_state, action, tableID, true)
    }

    // Overwrite state
    Object.assign(state, new_state)
    rewind_depth = 0
  }
  */

  handleAction (action: Command.Get.gameAction_action): void {
    this.actionList.push(action)
    switch (action.type) {
      case 'clue': return this.#handleClue(action)
      case 'play': return this.#handlePlay(action)
      case 'discard': return this.#handleDiscard(action)
      case 'draw': return this.#handleDraw(action)
    }
  }

  #handleClue (action: Command.Get.gameAction_action__clue): void {
    this.newTurn()
    this.clue_tokens--
    const target = this.players[action.target]
    for (const card of target.hand) {
      this.deck.deduceCard(card, action.clue, action.list.includes(card.order))
    }
    debug(target.toString())
    this.endTurn()
  }

  #handlePlay (action: Command.Get.gameAction_action__play): void {
    this.newTurn()
    const player = this.players[action.playerIndex]
    player.remove(action.order)
    if (this.deck.update_by_play(action)) this.clue_tokens++
    if (this.clue_tokens > MaxClueNum) this.clue_tokens = MaxClueNum
    this.play_stacks[action.suitIndex]++
    debug(player.toString())
  }

  #handleDiscard (action: Command.Get.gameAction_action__discard): void {
    this.newTurn()
    const player = this.players[action.playerIndex]
    player.remove(action.order)
    this.deck.update_by_discard(action)
    if (action.failed) this.strikes++
    else this.clue_tokens++
    debug(player.toString())
  }

  #handleDraw (action: Command.Get.gameAction_action__draw): void {
    const player = this.players[action.playerIndex]
    const card = this.deck.update_by_draw(action)
    player.add(card)
    debug(player.toString())
    this.endTurn()
  }

  /** the first move of a new turn */
  newTurn (): void {
    this.turn_count++
    this.inTurn = true
  }

  /** the last move of a new turn */
  endTurn (): void {
    this.inTurn = false
  }

  isMyTurn (): boolean {
    return !this.inTurn && (this.turn_count % this.numPlayers) === this.ourPlayerIndex
  }

  canClue (): boolean {
    return this.clue_tokens > 0
  }

  canDiscard (): boolean {
    return this.clue_tokens < MaxClueNum
  }
}
