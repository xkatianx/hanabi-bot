// import { handle } from './command-handler.js'
import WebSocket from 'ws'
import { getAccount } from './account.js'
import { handle } from './command/handler.js'
import { Command } from './command/index.js'
import { sendFunctions } from './command/sender.js'
import { connectHTTPS, connectWSS } from './connect.js'
import { debug, fatal } from './misc/cli.js'
// import Utils from './util.js'

export class Bot {
  username: string
  #ws: WebSocket
  /** the id of the table where I am */
  tid?: number
  /** the password of the table where I create */
  tpw: string = ''

  constructor (username: string, cookie: string) {
    this.username = username
    this.#ws = connectWSS(cookie)
    this.#ws.on('message', (data: Buffer) => {
      // Websocket messages are in the format: commandName {"field_name":"value"}
      const str = data.toString()
      const ind = str.indexOf(' ')
      const [command, arg] = [str.slice(0, ind), str.slice(ind + 1)]
      debug(command, arg)

      // Handle the command
      this.handleCommand(command, arg)
    })
  }

  handleCommand = handle

  sendCommand (command: 'tableStart', dataObj: Command.Send.tableStart): void
  sendCommand (command: 'tableReattend', dataObj: Command.Send.tableReattend): void
  sendCommand (command: 'tableLeave', dataObj: Command.Send.tableLeave): void
  sendCommand (command: 'getGameInfo1', dataObj: Command.Send.getGameInfo1): void
  sendCommand (command: 'getGameInfo2', dataObj: Command.Send.getGameInfo2): void
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
  chatPM = sendFunctions.chatPM
  tableCreate = sendFunctions.tableCreate
  tableJoin = sendFunctions.tableJoin
  note = sendFunctions.note
  action = sendFunctions.action
}

async function main (): Promise<Bot> {
  const [username, password] = await getAccount()
  const cookie = await connectHTTPS(username, password)
  return new Bot(username, cookie)
}

main().catch(fatal)
