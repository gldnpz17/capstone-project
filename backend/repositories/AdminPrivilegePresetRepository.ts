import { AdminPrivilegePreset } from "../domain-model/entities/AdminPrivilegePreset"
import { GenericCrud, GenericReadAllConfig, SequelizeGenericCrud } from "./common/GenericCrud"
import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize'
import { AdminPrivilegePresetMapper } from "./common/RepositoryMapper"

interface AdminPrivilegePresetRepository {
  create(preset: any): Promise<AdminPrivilegePreset>
  readAll(config: GenericReadAllConfig): Promise<AdminPrivilegePreset[]>
  readById(id: number): Promise<AdminPrivilegePreset | undefined>
  update(id: number, preset: any): Promise<AdminPrivilegePreset | undefined>
  delete(id: number): Promise<AdminPrivilegePreset | undefined>
}

class SequelizeAdminPrivilegePresetRepository implements AdminPrivilegePresetRepository {
  private crud: GenericCrud<AdminPrivilegePreset> = new SequelizeGenericCrud(this.model, this.mapper)

  constructor(
    private model: ModelStatic<Model<any, any>>,
    private mapper: AdminPrivilegePresetMapper
  ) { }

  create = this.crud.create
  readAll = this.crud.readAll
  readById = this.crud.readById
  update = this.crud.update
  delete = this.crud.delete
}

export { AdminPrivilegePresetRepository, SequelizeAdminPrivilegePresetRepository }