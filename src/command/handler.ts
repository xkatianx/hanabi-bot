import { Command } from '.'
import { Bot } from '../hanabi-bot'

export function handle (this: Bot, command: string, arg: string): void {
  const data = JSON.parse(arg)
  switch (command) {
    case 'chat': return chat(this, data as Command.Get.chat)
  }
}

function chat (bot: Bot, data: Command.Get.chat): void {
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
  bot.chatPM(recipient, msg)
}
