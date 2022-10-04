import { authenticator } from 'otplib'
import { randomBytes } from 'crypto'
import { base32 } from 'rfc4648'

interface TotpService {
  generateRandomSecret(): string
  totpIsValid(sharedSecret: string, totp: string): Promise<boolean>
}

class OtplibTotpService implements TotpService {
  generateRandomSecret(): string {
    return authenticator.generateSecret()
  }
  
  async totpIsValid(sharedSecret: string, totp: string): Promise<boolean> {
    return new Promise(resolve => resolve(authenticator.verify({ token: totp, secret: sharedSecret })))
  }
}

export { TotpService, OtplibTotpService as TotpGeneratorTotpService }