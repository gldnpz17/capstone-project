import { ApolloClient, HttpLink } from '@apollo/client';
import fetch from 'cross-fetch';
import { InMemoryCache } from '@apollo/client/cache';
import { writeFile } from 'fs'
import getPrompt from 'prompt-sync'
import { AUTHENTICATE_PASSWORD, GENERATE_TOTP_SECRET, SETUP_TOTP } from './queries/Accounts';
import qrcode from 'qrcode-terminal'
import { CONNECT_SMART_LOCK, READ_ALL_LOCKS } from './queries/Smartlocks';
import cliSelect from 'cli-select'

const prompt = getPrompt()

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({ uri: 'http://localhost:4000/graphql', fetch })
});

const init = async () => {
  // create config file.
}

const setupSecondFactor = async (secondFactorSetupToken: string) => {
  console.log('[Setup 2FA]')

  const {
    data: { totp: { generateSecret: sharedSecret } }
  } = await client.query({
    query: GENERATE_TOTP_SECRET
  })

  qrcode.generate(`otpauth://totp/SmartLock:username?secret=${sharedSecret}&issuer=SmartLock`, { small: true })
  console.log(`Shared secret: ${sharedSecret.match(/.{1,4}/g).join(' ')}`)

  const totp = prompt('Confirm TOTP : ')

  const {
    data: {
      setupSecondFactor: { refreshToken }
    }
  } = await client.mutate({
    mutation: SETUP_TOTP,
    variables: { secondFactorSetupToken, sharedSecret, totp }
  })

  console.log('Refresh Token :', refreshToken)
}

const login = async () => {
  console.clear()
  console.log('[Login]')
  const username = prompt('Username : ')
  const password = prompt('password : ')

  const {
    data: { authenticatePassword: { secondFactorToken, secondFactorSetupToken } } 
  } = await client.mutate({
    mutation: AUTHENTICATE_PASSWORD,
    variables: { username, password }
  })

  if (secondFactorSetupToken) {
    await setupSecondFactor(secondFactorSetupToken)
  } else {
    console.log("Second factor token", secondFactorToken)
  }
}

class DeviceMock {

}

const device = new DeviceMock()

const setupDevice = async () => {
  console.log('[Setup Device]')

  const {
    data: { smartLocks }
  } = await client.query({ query: READ_ALL_LOCKS })

  const options = {}
  smartLocks.forEach((lock: { id: string, name: string }) => {
    options[lock.id] = lock.name
  })

  console.log('Select smart lock :')
  const selectedLockId = await new Promise<string>(resolve => {
    cliSelect({ values: options }, (value) => resolve(value['id']))
  })

  const {
    data: {
      connectSmartLock: {
        deviceId,
        serverDomain,
        devicePublicKey,
        confirmationToken
      }
    } = { connectSmartLock: {} }
  } = await client.mutate({
    mutation: CONNECT_SMART_LOCK,
    variables: { id: selectedLockId }
  })

  console.log(`Device ID : ${deviceId}`)
  console.log(`Server Domain : ${serverDomain}`)
  console.log(`Device Public Key : ${devicePublicKey}`)
  console.log(`Confirmation Token : ${confirmationToken}`)
}

const main = async () => {
  //await init()
  //await login()
  await setupDevice()

  /*while (true) {

  }*/
}

main()