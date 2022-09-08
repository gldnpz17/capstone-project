import { AdminPrivilegePreset } from "../domain-model/entities/AdminPrivilegePreset"
import { GenericCrud, GenericReadAllConfig, SequelizeGenericCrud } from "./common/GenericCrud"
import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize'
import { AdminPrivilegePresetMapper } from "./common/RepositoryMapper"
import { SequelizeInstance } from "./common/SequelizeModels"
import { NotImplementedError } from "../common/Errors"

interface AdminPrivilegePresetRepository {
  create(preset: any): Promise<AdminPrivilegePreset>
  readAll(config: GenericReadAllConfig): Promise<AdminPrivilegePreset[]>
  readById(id: number): Promise<AdminPrivilegePreset | undefined>
  readEndUserPreset(): Promise<AdminPrivilegePreset>
  readByAccountId(id: string): Promise<AdminPrivilegePreset | undefined>
  readByIdIncludeAccounts(id: number): Promise<AdminPrivilegePreset | undefined>
  update(id: number, preset: any): Promise<AdminPrivilegePreset | undefined>
  delete(id: number): Promise<AdminPrivilegePreset | undefined>
}

class SequelizeAdminPrivilegePresetRepository implements AdminPrivilegePresetRepository {
  private accountModel = this.db.getModel(SequelizeInstance.modelNames.account)
  private privilegeModel = this.db.getModel(SequelizeInstance.modelNames.adminPrivilegePreset)
  private crud: GenericCrud<AdminPrivilegePreset> = new SequelizeGenericCrud(this.privilegeModel, this.mapper)

  constructor(
    private db: SequelizeInstance,
    private mapper: AdminPrivilegePresetMapper
  ) { }

  readByAccountId = async (id: string): Promise<AdminPrivilegePreset | undefined> => {
    const account = (await this.accountModel
      .findByPk(id, { 
        include: [this.privilegeModel]
      }))
      ?.toJSON()

    return this.mapper.map(account?.[SequelizeInstance.modelNames.adminPrivilegePreset]).get()
  }

  readEndUserPreset = async (): Promise<AdminPrivilegePreset> => {
    const preset = await this.privilegeModel.findOne({ where: { name: 'End User' } })

    if (!preset) throw new NotImplementedError()

    return this.mapper.map(preset.toJSON()).get()
  }

  readByIdIncludeAccounts = async (id: number) => {
    const preset = (await this.privilegeModel.findByPk(id, { include: [this.accountModel] }))?.toJSON()

    return this.mapper.map(preset).addAccounts(preset.Accounts).get()
  }

  create = this.crud.create
  readAll = this.crud.readAll
  readById = this.crud.readById
  update = this.crud.update
  delete = this.crud.delete
}

export { AdminPrivilegePresetRepository, SequelizeAdminPrivilegePresetRepository }