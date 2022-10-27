import { Account } from "../domain-model/entities/Account";
import { NotImplementedError } from "../common/Errors"
import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize'
import { GenericCrud, GenericReadAllConfig, SequelizeGenericCrud } from "./common/GenericCrud";
import { PasswordCredential } from "../domain-model/entities/PasswordCredential";
import { AccountMapper } from "./common/RepositoryMapper";
import { SequelizeInstance } from "./common/SequelizeModels";
import { AdminPrivilege } from "../domain-model/common/ApplicationConfiguration";

interface AccountsRepository {
  create(account: { username: string, salt: string, hash: string, privilegeId: number }): Promise<Account>
  readAll(config: GenericReadAllConfig): Promise<Account[]>
  readById(id: string): Promise<Account | undefined>
  readByIdIncludeClaims(id: string): Promise<Account | undefined>
  readByUsernameWithPassword(username: string): Promise<Account | undefined>
  readByUsernameIncludePasswordAndTotp(username: string): Promise<Account | undefined>
  readByIdIncludeTotp(id: string): Promise<Account | undefined>
  updateAdminPrivilege(accountId: string, privilegeId: number): Promise<Account | undefined>
  updateSharedSecret(accountId: string, totpSharedSecret: string): Promise<Account | undefined>
  delete(id: string): Promise<Account | undefined>
}

class SequelizeAccountsRepository implements AccountsRepository {
  private accountModel = this.db.getModel(SequelizeInstance.modelNames.account)
  private privilegeModel = this.db.getModel(SequelizeInstance.modelNames.adminPrivilegePreset)
  private accountCrud: GenericCrud<Account> = new SequelizeGenericCrud(this.accountModel, this.mapper)

  constructor(
    private db: SequelizeInstance,
    private mapper: AccountMapper
  ) { }

  readByUsernameIncludePasswordAndTotp = async (username: string): Promise<Account | undefined> => {
    const instance = (await this.accountModel.findOne({ where: { username } }))?.toJSON()

    if (!instance) throw new NotImplementedError()
    
    return this.mapper
      .map(instance)
      .addPassword(instance)
      .addTotp(instance)
      .get()
  }

  readByIdIncludeClaims = async (id: string): Promise<Account | undefined> => {
    const account = await this.accountModel.findByPk(id, {
      include: {
        model: this.db.getModel(SequelizeInstance.modelNames.claimInstance),
        include: [ this.db.getModel(SequelizeInstance.modelNames.claimType) ]
      }
    })

    const instance = account?.toJSON()

    if (!instance) return undefined

    return this.mapper.map(instance).addClaims(instance.ClaimInstances).get()
  }

  create = async (
    account: { 
      username: string, 
      salt: string, 
      hash: string, 
      privilegeId: number 
    }
  ) => {

    const { username, salt, hash, privilegeId } = account
    
    const newAccount: any = this.accountModel.build({
      username,
      salt,
      hash,
      [`${SequelizeInstance.modelNames.adminPrivilegePreset}Id`]: privilegeId
    })

    await newAccount.save()

    return this.mapper.map(newAccount.toJSON()).get()
  }

  readAll = this.accountCrud.readAll

  readById = this.accountCrud.readById
  
  readByUsernameWithPassword = async (username: string): Promise<Account | undefined> => {
    const instance = (await this.accountModel.findOne({ where: { username } }))?.toJSON()

    if (!instance) throw new NotImplementedError()
    
    return this.mapper.map(instance).addPassword(instance).get()
  }

  readByIdIncludeTotp = async (id: string): Promise<Account | undefined> => {
    const instance = (await this.accountModel.findByPk(id))?.toJSON()

    if (!instance) throw new NotImplementedError()

    return this.mapper.map(instance).addTotp(instance).get()
  }

  updateAdminPrivilege = async (accountId: string, privilegeId: number): Promise<Account | undefined> => {
    return await this.accountCrud.update(accountId, { 
      [`${SequelizeInstance.modelNames.adminPrivilegePreset}Id`]: privilegeId
    })
  }

  updateSharedSecret = async (accountId: string, totpSharedSecret: string): Promise<Account | undefined> => {
    return await this.accountCrud.update(accountId, { totpSharedSecret })
  }
  
  delete = this.accountCrud.delete
}

export { AccountsRepository, SequelizeAccountsRepository }