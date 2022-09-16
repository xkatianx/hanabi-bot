import WebSocket from 'ws'
import { getAccount } from './account.js'
import { AI, MyAction } from './ai/main.js'
import { chat, gameAction, gameActionList, init, joined, tableStart, welcome } from './command/handler.js'
import { Command } from './command/index.js'
import { sendFunctions } from './command/sender.js'
import { connectHTTPS, connectWSS } from './connect.js'
import { GameState } from './gamestate.js'
import { debug, fail, fatal, warn } from './misc/cli.js'

export class Bot {
  username: string
  #ws: WebSocket
  /** the id of the table where I am */
  tid?: number
  /** the password of the table where I create */
  tpw: string = ''
  isMidGame = false
  ai: AI
  gamestate?: GameState

  constructor (username: string, cookie: string, ai: AI) {
    this.username = username
    this.ai = ai
    this.#ws = connectWSS(cookie, this.handleCommand)
  }

  // ----------------
  //  handle command
  // ----------------

  handleCommand (command: string, arg: string): void {
    if (command === 'error') return fail('from ws:', arg)
    if (command === 'warning') return warn('from ws:', arg)

    const data = JSON.parse(arg)
    switch (command) {
      case 'welcome': return welcome(this, data as Command.Get.welcome)
      case 'joined': return joined(this, data as Command.Get.joined)
      case 'tableStart': return tableStart(this, data as Command.Get.tableStart)
      case 'init':
        this.gamestate = init(this, data as Command.Get.init)
        this.ai.setGameState(this.gamestate)
        return
      case 'gameAction': return gameAction(this, data as Command.Get.gameAction)
      case 'gameActionList': return gameActionList(this, data as Command.Get.gameActionList)
      case 'chat': return chat(this, data as Command.Get.chat)
    }
  }

  // --------------
  //  send command
  // --------------

  perform (action: MyAction): void {
    debug('action', action)
    const tableID = this.tid
    if (tableID == null) fatal('missing tableID')
    if (this.gamestate == null) fatal('missing gamestate')
    this.gamestate.inTurn = true
    switch (action.type) {
      case 'play':
        return this.sendCommand('action', { tableID, type: 0, target: action.order })
      case 'toss':
        return this.sendCommand('action', { tableID, type: 1, target: action.order })
      case 'suit':
        return this.sendCommand('action', { tableID, type: 2, target: action.player, value: action.suit })
      case 'rank':
        return this.sendCommand('action', { tableID, type: 3, target: action.player, value: action.rank })
    }
  }

  sendCommand (command: 'tableStart', dataObj: Command.Send.tableStart): void
  sendCommand (command: 'tableReattend', dataObj: Command.Send.tableReattend): void
  sendCommand (command: 'tableLeave', dataObj: Command.Send.tableLeave): void
  sendCommand (command: 'getGameInfo1', dataObj: Command.Send.getGameInfo1): void
  sendCommand (command: 'getGameInfo2', dataObj: Command.Send.getGameInfo2): void
  sendCommand (command: 'loaded', dataObj: Command.Send.loaded): void
  sendCommand (command: 'chatPM', dataObj: Command.Send.chatPM): void
  sendCommand (command: 'tableCreate', dataObj: Command.Send.tableCreate): string
  sendCommand (command: 'tableJoin', dataObj: Command.Send.tableJoin): void
  sendCommand (command: 'note', dataObj: Command.Send.note): void
  sendCommand (command: 'action', dataObj: Command.Send.action): void
  sendCommand (command: keyof typeof sendFunctions, dataObj = {}): any {
    this.#ws.send(`${command} ${JSON.stringify(dataObj)}`)
  }

  tableStart = sendFunctions.tableStart
  tableReattend = sendFunctions.tableReattend
  tableLeave = sendFunctions.tableLeave
  getGameInfo1 = sendFunctions.getGameInfo1
  getGameInfo2 = sendFunctions.getGameInfo2
  loaded = sendFunctions.loaded
  chatPM = sendFunctions.chatPM
  tableCreate = sendFunctions.tableCreate
  tableJoin = sendFunctions.tableJoin
  note = sendFunctions.note
  action = sendFunctions.action
}

async function main (): Promise<Bot> {
  const [username, password] = await getAccount()
  const cookie = await connectHTTPS(username, password)
  const tempAI = new AI()
  return new Bot(username, cookie, tempAI)
}

main().catch(fatal)
