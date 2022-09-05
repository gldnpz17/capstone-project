import { NotImplementedError } from '../common/Errors'
import { Account } from '../domain-model/entities/Account'
import { AccountsRepository } from '../repositories/AccountsRepository'
import { GenericReadAllConfig } from '../repositories/common/GenericCrud'

class AccountUseCases {
  accountsRepository: AccountsRepository

  constructor(accountsRepository: AccountsRepository) {
    this.accountsRepository = accountsRepository
  }

  async create(account: { username: String }): Promise<Account> {
    return await this.accountsRepository.create(account)
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