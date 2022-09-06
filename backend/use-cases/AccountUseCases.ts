import { NotImplementedError } from '../common/Errors'
import { Account } from '../domain-model/entities/Account'
import { PasswordService } from '../domain-model/services/PasswordService'
import { AccountsRepository } from '../repositories/AccountsRepository'
import { GenericReadAllConfig } from '../repositories/common/GenericCrud'

class PasswordAuthenticationResult {
  constructor(
    public secondFactorToken: string
  ) { }
}

class AccountUseCases {
  constructor(
    private accountsRepository: AccountsRepository, 
    private passwordService: PasswordService
  ) { }

  async register(account: { username: string, password: string }): Promise<Account> {
    const { salt, hash } = this.passwordService.hash(account.password)

    return await this.accountsRepository.create({ username: account.username, salt, hash })
  }

  async authenticatePassword(credentials: { username: string, password: string }): Promise<PasswordAuthenticationResult> {
    const account = await this.accountsRepository.readByUsernameWithPassword(credentials.username)

    if (!account || !account.password) throw new NotImplementedError()

    const { salt, hash } = account.password
    if (!this.passwordService.match({ password: credentials.password, salt, hash })) throw new NotImplementedError()

    return new PasswordAuthenticationResult('sometoken')
  }

  async readAll(config: GenericReadAllConfig): Promise<Account[]> {
    return await this.accountsRepository.readAll(config)
  }

  async readById(id: number): Promise<Account | undefined> {
    return await this.accountsRepository.readById(id)
  }

  async delete(id: number): Promise<Account | undefined> {
    return await this.accountsRepository.delete(id)
  }
}

export { AccountUseCases }