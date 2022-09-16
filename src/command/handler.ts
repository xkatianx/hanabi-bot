import { Command } from '.'
import { GameState } from '../ai/gamestate.js'
import { Bot } from '../hanabi-bot'

/**
 * The 'welcome' message is the first message that the server sends us
 * once we have established a connection.
 *
 * It contains our username, settings, and so forth.
 */
export function welcome (bot: Bot, data: Command.Get.welcome): void {
  const tableID = data.playingAtTables[0]
  if (tableID != null) bot.tableReattend(tableID)
}

/** We joined a table */
export function joined (bot: Bot, data: Command.Get.joined): void {
  bot.tid = data.tableID
}

/**
 * The server has told us that a game that we are in is starting.
 *
 * So, the next step is to request some high-level information about the
 * game (e.g. number of players.)
 *
 * The server will respond with an 'init' command.
 */
export function tableStart (bot: Bot, data: Command.Get.tableStart): void {
  bot.tid = data.tableID
  bot.getGameInfo1()
}

/**
 * At the beginning of the game, the server sends us some high-level
 * data about the game, including the names and ordering of the players
 * at the table
 *
 * At this point, the JavaScript client would have enough information to
 * load and display the game UI; for our purposes, we do not need to
 * load a UI, so we can just jump directly to the next step
 *
 * Now, we request the specific actions that have taken place thus far
 * in the game (which will come in a "gameActionList")
 *
 */
export function init (bot: Bot, data: Command.Get.init): GameState {
  const gs = new GameState(data)
  bot.getGameInfo2()
  return gs
}

/** We just received a new action for an ongoing game */
export function gameAction (bot: Bot, data: Command.Get.gameAction): void {
  if (!bot.isMidGame) return
  bot.ai.handleAction(data.action)
  const action = bot.ai.getAction()
  if (action != null) setTimeout(() => bot.perform(action), 1000)
}

export function gameActionList (bot: Bot, data: Command.Get.gameActionList): void {
  bot.isMidGame = true
  // Let the server know that we have finished "loading the UI"
  // (so that our name does not appear as red / disconnected)
  bot.loaded()

  // We just received a list of all of the actions that have occurred thus
  // far in the game
  for (const action of data.list) bot.ai.handleAction(action)
  const action = bot.ai.getAction()
  if (action != null) setTimeout(() => bot.perform(action), 1000)
}

export function chat (bot: Bot, data: Command.Get.chat): void {
  if (data.recipient !== bot.username) return
  const args = data.msg.split(' ')
  const help = [
    ['/new', 'I will host a table.'],
    ['/start', 'I will start the table I host.'],
    ['/invite {bot_name}', 'I will invite another bot.']
  ]
  let recipient = data.who
  let msg = help.map(arr => `[ ${arr[0]} ${arr[1]} ]`).join(' ')
  if (args[0] === '/exit') {
    if (bot.tid != null) bot.tableLeave()
    throw new Error('force shut down.')
  } else if (args[0] === '/start') {
    return bot.tableStart()
  } else if (args[0] === '/invite') {
    if (bot.tid == null) msg = 'use "/new" first'
    else [recipient, msg] = [args[1], `/join ${bot.tid} ${bot.tpw}`]
  } else if (args[0] === '/new') {
    if (bot.tid != null) msg = 'I am busy.'
    else msg = `password is ${bot.tableCreate()}`
  } else if (args[0] === '/join') {
    try {
      bot.tableJoin(Number(args[1]), args[2])
    } catch (e) {
      msg = 'use /join {tableID} {password}'
    }
  }
  if (args[0].startsWith('/')) bot.chatPM(recipient, msg)
}
