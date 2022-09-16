import { Card } from './card/card.js'
import { CLUE, good_touch_elim, find_known_trash, remove_card_from_hand, update_hypo_stacks } from './basics/helper.js'
import Basics from './basics.js'
import Utils from './util.js'

function handle_action (state, action, tableID, catchup = false) {
  state.actionList.push(action)

  switch (action.type) {
    case 'clue': {
      // {type: 'clue', clue: { type: 1, value: 1 }, giver: 0, list: [ 8, 9 ], target: 1, turn: 0}
      const { giver, target, list, clue } = action

      const [playerName, targetName] = [giver, target].map(index => state.playerNames[index])
      let clue_value

      if (clue.type === CLUE.COLOUR) {
        clue_value = ['red', 'yellow', 'green', 'blue', 'purple'][clue.value]
      } else {
        clue_value = clue.value
      }
      logger.warn(`${playerName} clues ${clue_value} to ${targetName}`)

      Basics.onClue(state, action)
      state.interpret_clue(state, action)

      // Remove the newly_clued flag
      for (const order of list) {
        const card = Utils.findOrder(state.hands[target], order)
        card.newly_clued = false
      }
      break
    }
    case 'discard': {
      // {type: 'discard', playerIndex: 2, order: 12, suitIndex: 0, rank: 3, failed: true}
      const { order, playerIndex, rank, suitIndex } = action
      const card = Utils.findOrder(state.hands[playerIndex], order)
      const playerName = state.playerNames[action.playerIndex]

      // Assign the card's identity if it isn't already known
      Object.assign(card, { suitIndex, rank })
      logger.warn(`${playerName} ${action.failed ? 'bombs' : 'discards'} ${card.toString()}`)

      const trash = find_known_trash(state, playerIndex)
      // Early game and discard wasn't known trash or misplay, so end early game
      if (state.early_game && !trash.some(c => c.matches(suitIndex, rank)) && !action.failed) {
        state.early_game = false
      }

      Basics.onDiscard(state, action)

      // If the card doesn't match any of our inferences, rewind to the reasoning and adjust
      const matches_inference = card.inferred.length === 0 || card.inferred.some(c => c.matches(suitIndex, rank))
      if (!card.rewinded && !matches_inference) {
        logger.info('all inferences', card.inferred.map(c => c.toString()))
        state.rewind(state, card.reasoning.pop(), playerIndex, order, suitIndex, rank, true, tableID)
        return
      }

      // Discarding a useful card (for whatever reason)
      if (state.hypo_stacks[suitIndex] >= rank && state.play_stacks[suitIndex] < rank) {
        const duplicates = Utils.visibleFind(state, playerIndex, suitIndex, rank)

        // Mistake discard or sarcastic discard (but unknown transfer location)
        if (duplicates.length === 0 || duplicates[0].inferred.length > 1) {
          logger.info(`${state.playerNames[playerIndex]} discarded useful card ${card.toString()}, setting hypo stack ${rank - 1}`)
          state.hypo_stacks[suitIndex] = rank - 1
        }
      }
      break
    }
    case 'draw': {
      // { type: 'draw', playerIndex: 0, order: 2, suitIndex: 1, rank: 2 },
      Basics.onDraw(state, action)
      break
    }
    case 'gameOver':
      logger.info('gameOver', action)
      Utils.sendCmd('tableUnattend', { tableID })
      break
    case 'turn': {
      //  { type: 'turn', num: 1, currentPlayerIndex: 1 }
      const { currentPlayerIndex } = action
      const lastPlayerIndex = (currentPlayerIndex + state.numPlayers - 1) % state.numPlayers
      if (currentPlayerIndex === state.ourPlayerIndex && !catchup) {
        setTimeout(() => state.take_action(state, tableID), 2000)

        // Update notes on cards
        for (const card of state.hands[state.ourPlayerIndex]) {
          if (card.inferred.length <= 3) {
            Utils.writeNote(card, tableID)
          }
        }
      }

      const to_remove = []
      for (let i = 0; i < state.waiting_connections.length; i++) {
        const { connections, focused_card, inference } = state.waiting_connections[i]
        const { type, reacting, card } = connections[0]
        // After the turn we were waiting for
        if (reacting === lastPlayerIndex) {
          // They still have the card
          if (Utils.findOrder(state.hands[reacting], card.order) !== undefined) {
            // Didn't play into finesse
            if (type === 'finesse' && state.play_stacks[card.suitIndex] + 1 === card.rank) {
              logger.info(`Didn't play into finesse, removing inference ${Utils.logCard(inference.suitIndex, inference.rank)}`)
              for (const connection of connections) {
                if (connection.type === 'finesse') {
                  card.finessed = false
                }
              }
              focused_card.subtract('inferred', [inference])
              if (focused_card.inferred.length === 1) {
                const { suitIndex, rank } = focused_card.inferred[0]
                if (state.hypo_stacks[suitIndex] + 1 === rank) {
                  update_hypo_stacks(state, suitIndex, rank)
                }
              }
              to_remove.push(i)
            } else if (type === 'finesse') {
              logger.info('didn\'t play into unplayable finesse')
            }
          } else {
            // The card was played or discarded
            logger.info(`waiting card ${card.toString()} gone`)
            connections.shift()
            if (connections.length === 0) {
              to_remove.push(i)
            }
          }
        }
      }

      // Filter out connections that have been removed
      state.waiting_connections = state.waiting_connections.filter((_, i) => !to_remove.includes(i))
      state.turn_count++
      break
    }
    case 'play': {
      const { order, playerIndex, rank, suitIndex } = action
      const card = Utils.findOrder(state.hands[playerIndex], order)
      const playerName = state.playerNames[playerIndex]

      // Assign the card's identity if it isn't already known
      Object.assign(card, { suitIndex, rank })
      logger.warn(`${playerName} plays ${card.toString()}`)

      // If the card doesn't match any of our inferences, rewind to the reasoning and adjust
      const matches_inference = card.inferred.some(c => c.matches(suitIndex, rank))
      if (!card.rewinded && (playerIndex === state.ourPlayerIndex && card.inferred.length > 1 || !matches_inference)) {
        logger.info('all inferences', card.inferred.map(c => c.toString()))
        state.rewind(state, card.reasoning.pop(), playerIndex, order, suitIndex, rank, false, tableID)
        return
      }
      remove_card_from_hand(state.hands[playerIndex], order)

      state.play_stacks[suitIndex] = rank

      // Apply good touch principle on remaining possibilities
      for (const hand of state.hands) {
        good_touch_elim(hand, [{ suitIndex, rank }], { hard: true })
      }

      // Update hypo stacks
      logger.debug('updating hypo stack (play)')
      update_hypo_stacks(state, suitIndex, rank)

      // Get a clue token back for playing a 5
      if (rank === 5 && state.clue_tokens < 8) {
        state.clue_tokens++
      }
      break
    }
    case 'rewind': {
      const { order, playerIndex, suitIndex, rank } = action

      const card = Utils.findOrder(state.hands[playerIndex], order)
      if (card === undefined) {
        throw new Error('Could not find card to rewrite!')
      }
      card.possible = [new Card(suitIndex, rank)]
      card.inferred = [new Card(suitIndex, rank)]
      card.finessed = true
      card.rewinded = true
      break
    }
    default:
      break
  }
}

module.exports = { handle_action }
