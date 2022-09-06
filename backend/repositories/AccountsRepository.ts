import { Account } from "../domain-model/entities/Account";
import { NotImplementedError } from "../common/Errors"
import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize'
import { GenericCrud, GenericReadAllConfig, SequelizeGenericCrud } from "./common/GenericCrud";
import { PasswordCredential } from "../domain-model/entities/PasswordCredential";

interface AccountsRepository {
  create(account: { username: string, salt: string, hash: string }): Promise<Account>
  readAll(config: GenericReadAllConfig): Promise<Account[]>
  readById(id: number): Promise<Account | undefined>
  readByUsernameWithPassword(username: string): Promise<Account | undefined>
  delete(id: number): Promise<Account | undefined>
}

class SequelizeAccountsRepository implements AccountsRepository {
  private accountCrud: GenericCrud<Account> = new SequelizeGenericCrud(this.accountModel)

  constructor(private accountModel: ModelStatic<Model<any, any>>) { }

  create = this.accountCrud.create.bind(this.accountCrud)

  readAll = this.accountCrud.readAll.bind(this.accountCrud)

  readById = this.accountCrud.readById.bind(this.accountCrud)
  
  async readByUsernameWithPassword(username: string): Promise<Account | undefined> {
    const instance = (await this.accountModel.findOne({ where: { username } }))?.toJSON()

    if (!instance) return undefined

    const password: PasswordCredential = instance
    
    return { ...instance, password }
  }
  
  delete = this.accountCrud.delete.bind(this.accountCrud)
}

export { AccountsRepository, SequelizeAccountsRepository }