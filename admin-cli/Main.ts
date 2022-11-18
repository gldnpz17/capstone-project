import { ApolloClient, HttpLink } from '@apollo/client';
import fetch from 'cross-fetch';
import { InMemoryCache } from '@apollo/client/cache';
import { writeFile } from 'fs'
import getPrompt from 'prompt-sync'
import { AUTHENTICATE_PASSWORD, AUTHENTICATE_SECOND_FACTOR, GENERATE_TOTP_SECRET, SETUP_TOTP } from './queries/Accounts';
import qrcode from 'qrcode-terminal'
import { CONNECT_SMART_LOCK, READ_ALL_LOCKS } from './queries/Smartlocks';
import cliSelect from 'cli-select'
import { getSerialPortInfo } from './Common';
import cliSpinners from 'cli-spinners';
import { SerialPort } from 'serialport';

const prompt = getPrompt()

const SERVER_URL = 'http://localhost:4000/graphql'

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({ uri: SERVER_URL, fetch })
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
    const totp = prompt('TOTP : ')

    const {
      data: { authenticateSecondFactor: { refreshToken } }
    } = await client.mutate({
      mutation: AUTHENTICATE_SECOND_FACTOR,
      variables: { secondFactorToken, totp }
    })

    if (refreshToken) {
      client.setLink(new HttpLink({ 
        uri: SERVER_URL, 
        fetch,
        headers: {
          'Cookie': `authorization=Bearer ${refreshToken}`
        }
      }))
    }
  }
}

const sendDataToDevice = (data: string) => {

}

const setupDevice = async (sendMessage: SendMessageFunction) => {
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

  const message = `${deviceId}|${serverDomain}|${confirmationToken}`
  sendMessage(message)
  console.log('Setup message sent to device.')
}

async function loading<T extends Promise<any>>(promise: T, text: string = ''): Promise<Awaited<T>> {
  const spinner = cliSpinners.clock
  let frame = 0
  let first = true
  const interval = setInterval(() => {
    if (!first) {
      process.stdout.write("\r\x1b[K")
    }
    first = false

    process.stdout.write(`${spinner.frames[frame]} ${text}`);

    frame++
    if (frame >= spinner.frames.length) frame = 0
  }, spinner.interval)

  const result = await promise

  process.stdout.write("\r\x1b[K")
  clearInterval(interval)
  
  return result
}

type SendMessageFunction = (message: string) => void
const getDeviceSender = async (): Promise<SendMessageFunction> => {
  const portInfo = await loading(getSerialPortInfo(), 'Finding lock device...')
  const port = new SerialPort({ path: portInfo.path, baudRate: 9600 })
  await new Promise(resolve => port.open(resolve))

  return (message: string) => {
    port.write(message)
  }
}

const main = async () => {
  console.log('[Smart Lock Admin CLI]')
  //await init()
  await login()

  //const sendMessage = await getDeviceSender()
  //sendMessage('Hello\n')
  await setupDevice(console.log)

  /*while (true) {

  }*/
}

main()