import { Q, fatal } from './misc/cli.js'
import { env } from './misc/env.js'

/** Returns [username, password] */
export async function getAccount (): Promise<string[]> {
  let accountID = env.accountID
  if (accountID === 0) {
    accountID = Number(await new Q('Please choose your account: (1~6)').ask())
    Q.end()
  }
  const [id, pw] = env.accounts[accountID - 1]
  if (id == null) fatal(`in .env: missing USERNAME${accountID}`)
  if (pw == null) fatal(`in .env: missing PASSWORD${accountID}`)
  return [id, pw]
}
