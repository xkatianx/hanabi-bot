import WebSocket from 'ws'
import { IncomingMessage } from 'http'
import https from 'https'
import { debug } from './misc/cli.js'

/**
 * Logs in to hanab.live and returns the session cookie to authenticate future requests.
 */
export async function connectHTTPS (username: string, password: string): Promise<string> {
  const data = `username=${username}&password=${password}&version=bot`
  const options = {
    hostname: 'hanab.live',
    port: 443,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length
    }
  }
  return await new Promise((resolve, reject) => {
    // Send login request to hanab.live
    const req = https.request(options, (res: IncomingMessage) => {
      debug('Request status code:', res.statusCode)

      const cookie = (res.headers['set-cookie'] ?? [])[0]
      if (cookie == null) reject(new Error('Failed to parse cookie from auth headers.'))

      res.on('data', debug)
      resolve(cookie)
    })
    req.on('error', reject)

    // Write data body to POST request
    req.write(data)
    req.end()
  })
}

type CommandHandler = (command: string, arg: string) => void
export function connectWSS (cookie: string, commandHandler: CommandHandler): WebSocket {
  const ws = new WebSocket('wss://hanab.live/ws', { headers: { Cookie: cookie } })

  ws.on('message', (data: Buffer) => {
    // Websocket messages are in the format: commandName {"field_name":"value"}
    const str = data.toString()
    const ind = str.indexOf(' ')
    const [command, arg] = [str.slice(0, ind), str.slice(ind + 1)]
    if (!ignoreCommands.includes(command)) debug(command, arg)

    // Handle the command
    commandHandler(command, arg)
  })

  ws.on('open', () => debug('Established websocket connection!'))
  ws.on('error', (err) => debug('Websocket error:', err))
  ws.on('close', () => debug('Websocket closed from server.'))

  return ws
}

// for debug
const ignoreCommands = [
  'connected',
  'clock',
  'voteChange',
  'chatTyping',
  'spectators',
  'userLeft',
  'user',
  'userInactive',
  'table',
  'tableGone',
  'chatList',
  'tableList',
  'userList'
]
