import { Account } from "../domain-model/entities/Account";
import { NotImplementedError } from "../common/Errors"
import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize'
import { GenericCrud, GenericReadAllConfig, SequelizeGenericCrud } from "./common/GenericCrud";
import { PasswordCredential } from "../domain-model/entities/PasswordCredential";
import { AccountMapper } from "./common/RepositoryMapper";

interface AccountsRepository {
  create(account: { username: string, salt: string, hash: string, totpSharedSecret: string }): Promise<Account>
  readAll(config: GenericReadAllConfig): Promise<Account[]>
  readById(id: string): Promise<Account | undefined>
  readByUsernameWithPassword(username: string): Promise<Account | undefined>
  readByIdIncludeTotp(id: string): Promise<Account | undefined>
  delete(id: string): Promise<Account | undefined>
}

class SequelizeAccountsRepository implements AccountsRepository {
  private accountCrud: GenericCrud<Account> = new SequelizeGenericCrud(this.accountModel, this.mapper)

  constructor(
    private accountModel: ModelStatic<Model<any, any>>,
    private mapper: AccountMapper
  ) { }

  create = this.accountCrud.create.bind(this.accountCrud)

  readAll = this.accountCrud.readAll.bind(this.accountCrud)

  readById = this.accountCrud.readById.bind(this.accountCrud)
  
  async readByUsernameWithPassword(username: string): Promise<Account | undefined> {
    const instance = (await this.accountModel.findOne({ where: { username } }))?.toJSON()

    if (!instance) throw new NotImplementedError()
    
    return this.mapper.map(instance).addPassword(instance).get()
  }

  async readByIdIncludeTotp(id: string): Promise<Account | undefined> {
    const instance = (await this.accountModel.findByPk(id))?.toJSON()

    if (!instance) throw new NotImplementedError()

    return this.mapper.map(instance).addTotp(instance).get()
  }
  
  delete = this.accountCrud.delete.bind(this.accountCrud)
}

export { AccountsRepository, SequelizeAccountsRepository }