import * as dotenv from 'dotenv'
dotenv.config()

const ENV = process.env

const p1 = [ENV.USERNAME1, ENV.PASSWORD1]
const p2 = [ENV.USERNAME2, ENV.PASSWORD2]
const p3 = [ENV.USERNAME3, ENV.PASSWORD3]
const p4 = [ENV.USERNAME4, ENV.PASSWORD4]
const p5 = [ENV.USERNAME5, ENV.PASSWORD5]
const p6 = [ENV.USERNAME6, ENV.PASSWORD6]

export const env = {
  accountID: Number(ENV.ACCOUNT),
  accounts: [p1, p2, p3, p4, p5, p6]
}
