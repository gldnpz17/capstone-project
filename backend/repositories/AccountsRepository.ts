import { Account } from "../domain-model/entities/Account";
import { NotImplementedError } from "../common/Errors"
import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize'
import { GenericCrud, GenericReadAllConfig, SequelizeGenericCrud } from "./common/GenericCrud";

interface AccountsRepository {
  create(account: { username: String }): Promise<Account>
  readAll(config: GenericReadAllConfig): Promise<Account[]>
  readById(id: number): Promise<Account | undefined>
  delete(id: number): Promise<Account | undefined>
}

class SequelizeAccountsRepository implements AccountsRepository {
  model: ModelStatic<Model<any, any>>
  crud: GenericCrud<Account>

  constructor(sequelize: Sequelize) {
    this.model = sequelize.define('Account', {
      username: {
        type: DataTypes.STRING,
        allowNull: false
      }
    })

    this.crud = new SequelizeGenericCrud(this.model)
  }

  async create(account: Account) { 
    return await this.crud.create(account) 
  }

  async readAll(config: GenericReadAllConfig): Promise<Account[]> {
    return await this.crud.readAll(config)
  }

  async readById(id: number): Promise<Account | undefined> {
    return await this.crud.readById(id)
  }

  async delete(id: number): Promise<Account | undefined> {
    return await this.crud.delete(id)
  }
}

export { AccountsRepository, SequelizeAccountsRepository }