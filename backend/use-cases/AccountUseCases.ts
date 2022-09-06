import { NotImplementedError } from '../common/Errors'
import { Account } from '../domain-model/entities/Account'
import { PasswordService } from '../domain-model/services/PasswordService'
import { TotpService } from '../domain-model/services/TotpService'
import { TransientTokenService } from '../domain-model/services/TransientTokenService'
import { AccountsRepository } from '../repositories/AccountsRepository'
import { GenericReadAllConfig } from '../repositories/common/GenericCrud'
import { TotpCredentialsRepository } from '../repositories/TotpCredentialsRepository'

class PasswordAuthenticationResult {
  constructor(
    public secondFactorToken: string
  ) { }
}

class SecondFactorAuthenticationResult {
  constructor(
    public authenticationToken: string
  ) { }
}

class AuthenticationToken {
  account: {
    id: string,
    username: string
  }

  constructor(account: Account) {
    const { id, username } = account
    this.account = { id, username }
  }
}

class SecondFactorToken {
  account: {
    id: string
  }

  constructor(account: Account) {
    const { id } = account
    this.account = { id }
  }
}

class AccountUseCases {
  constructor(
    private accountsRepository: AccountsRepository,
    private passwordService: PasswordService,
    private totpService: TotpService,
    private secondFactorTokenService: TransientTokenService<SecondFactorToken>,
    private authenticationTokenService: TransientTokenService<AuthenticationToken>
  ) { }

  async register(account: { username: string, password: string, totpSharedSecret: string, verificationTotp: string }): Promise<Account> {
    const { salt, hash } = this.passwordService.hash(account.password)

    if (!this.totpService.totpIsValid(account.totpSharedSecret, account.password)) throw new NotImplementedError()

    return await this.accountsRepository.create({ username: account.username, salt, hash, totpSharedSecret: account.totpSharedSecret })
  }

  getTotpSecret() {
    return this.totpService.generateRandomSecret()
  }

  async authenticatePassword(credentials: { username: string, password: string }): Promise<PasswordAuthenticationResult> {
    const account = await this.accountsRepository.readByUsernameWithPassword(credentials.username)

    if (!account || !account.password) 
      throw new NotImplementedError()

    const { salt, hash } = account.password
    if (!this.passwordService.match({ password: credentials.password, salt, hash })) 
      throw new NotImplementedError()

    const token = await this.secondFactorTokenService.generateToken(new SecondFactorToken(account), token => token.account.id)

    return new PasswordAuthenticationResult(token)
  }

  async authenticateSecondFactor(credentials: { secondFactorToken: string, totp: string }) {
    const { account: { id } } = await this.secondFactorTokenService.decodeToken(credentials.secondFactorToken)

    const account = await this.accountsRepository.readByIdIncludeTotp(id)

    if (!account || !account.totp) throw new NotImplementedError()

    if (!this.totpService.totpIsValid(account.totp.totpSharedSecret, credentials.totp)) 
      throw new NotImplementedError()

    const token = await this.authenticationTokenService.generateToken(new AuthenticationToken(account), token => token.account.id)

    return new SecondFactorAuthenticationResult(token)
  }

  async readAll(config: GenericReadAllConfig): Promise<Account[]> {
    return await this.accountsRepository.readAll(config)
  }

  async readById(id: string): Promise<Account | undefined> {
    return await this.accountsRepository.readById(id)
  }

  async delete(id: string): Promise<Account | undefined> {
    return await this.accountsRepository.delete(id)
  }
}

export { AccountUseCases, SecondFactorToken, AuthenticationToken }