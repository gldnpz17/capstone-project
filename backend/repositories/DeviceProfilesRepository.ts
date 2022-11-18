import { SmartLock } from "../domain-model/entities/SmartLock"
import { GenericReadAllConfig } from "./common/GenericCrud"
import { DeviceProfile } from "../domain-model/entities/DeviceProfile"
import { SequelizeRepositoryBase } from "./common/SequelizeRepositoryBase"
import { SequelizeInstance } from "./common/SequelizeModels"
import { DeviceProfileMapper } from "./common/RepositoryMapper"

interface DeviceProfilesRepository {
  create(deviceProfile: { id: string, privateKey: string, publicKey: string, macAddress: string }): Promise<DeviceProfile>
  readAll(config: GenericReadAllConfig): Promise<DeviceProfile[]>
  readById(id: string): Promise<DeviceProfile | undefined>
  readByIdIncludeSmartLock(id: string): Promise<DeviceProfile | undefined>
  delete(id: string): Promise<DeviceProfile | undefined>
}

class SequelizeDeviceProfilesRepository extends SequelizeRepositoryBase<DeviceProfile> {
  smartLockModel = this.db.getModel(SequelizeInstance.modelNames.smartLock)

  constructor(
    db: SequelizeInstance,
    protected mapper: DeviceProfileMapper
  ) { super(db, mapper, SequelizeInstance.modelNames.deviceProfile) }
  
  create = this.crud.create
  readAll = this.crud.readAll
  readById = this.crud.readById

  readByIdIncludeSmartLock = async (id: string) => {
    const deviceProfile = (await this.model
      .findByPk(id, {
        include: [this.smartLockModel]
      }))
      ?.toJSON()

    if (!deviceProfile) return undefined

    return this.mapper
      .map(deviceProfile)
      .addSmartLock(deviceProfile?.[SequelizeInstance.modelNames.smartLock])
      .get()
  }

  delete = this.crud.delete
}

export { DeviceProfilesRepository, SequelizeDeviceProfilesRepository }