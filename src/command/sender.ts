import { Bot } from '../hanabi-bot'

export const sendFunctions = {
  tableStart,
  tableReattend,
  tableLeave,
  getGameInfo1,
  getGameInfo2,
  loaded,
  chatPM,
  tableCreate,
  tableJoin,
  note,
  action
}

function tableStart (this: Bot, tableID?: number): void {
  tableID = tableID ?? this.tid ?? 0
  this.sendCommand('tableStart', { tableID })
}
function tableReattend (this: Bot, tableID?: number): void {
  tableID = tableID ?? this.tid ?? 0
  this.sendCommand('tableReattend', { tableID })
}
function tableLeave (this: Bot, tableID?: number): void {
  tableID = tableID ?? this.tid ?? 0
  this.sendCommand('tableLeave', { tableID })
}
function getGameInfo1 (this: Bot, tableID?: number): void {
  tableID = tableID ?? this.tid ?? 0
  this.sendCommand('getGameInfo1', { tableID })
}
function getGameInfo2 (this: Bot, tableID?: number): void {
  tableID = tableID ?? this.tid ?? 0
  this.sendCommand('getGameInfo2', { tableID })
}
function loaded (this: Bot, tableID?: number): void {
  tableID = tableID ?? this.tid ?? 0
  this.sendCommand('loaded', { tableID })
}

function chatPM (this: Bot, recipient: string, msg: string, room = 'lobby'): void {
  this.sendCommand('chatPM', { recipient, msg, room })
}

/** default table options */
const options = {
  allOrNothing: false,
  cardCycle: false,
  deckPlays: false,
  detrimentalCharacters: false,
  emptyClues: false,
  oneExtraCard: false,
  oneLessCard: false,
  speedrun: false,
  timeBase: 0,
  timePerTurn: 0,
  timed: false,
  variantName: 'No Variant'
}
function tableCreate (this: Bot, name = 'bot table'): string {
  const password = (Math.random() * 900 + 100).toFixed()
  const maxPlayers = 5
  this.sendCommand('tableCreate', { password, options, maxPlayers, name })
  this.tpw = password
  return password
}

function tableJoin (this: Bot, tableID: number, password: string): void {
  this.sendCommand('tableJoin', { tableID, password })
}

function note (this: Bot, note: string, order: number, tableID?: number): void {
  tableID = tableID ?? this.tid ?? 0
  this.sendCommand('note', { tableID, order, note })
}
function action (this: Bot, type: number, target: number, value?: number, tableID?: number): void {
  tableID = tableID ?? this.tid ?? 0
  if (value == null) this.sendCommand('action', { tableID, target, type })
  else this.sendCommand('action', { tableID, target, type, value })
}
