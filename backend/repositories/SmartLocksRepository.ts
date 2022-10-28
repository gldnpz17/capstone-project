import { SmartLock } from "../domain-model/entities/SmartLock";
import { GenericReadAllConfig } from "./common/GenericCrud";
import { SmartLockMapper } from "./common/RepositoryMapper";
import { SequelizeInstance } from "./common/SequelizeModels";
import { SequelizeRepositoryBase } from "./common/SequelizeRepositoryBase";

interface SmartLocksRepository {
  create(smartLock: { name: string, wifiSsid?: string, wifiPassword?: string }): Promise<SmartLock>
  readAll(config: GenericReadAllConfig): Promise<SmartLock[]>
  readById(id: string): Promise<SmartLock | undefined>
  readByIdIncludeDevice(id: string): Promise<SmartLock | undefined>
  update(id: string, instance: { name?: string }): Promise<SmartLock | undefined>
  updateDeviceProfileId(id: string, deviceId: number): Promise<SmartLock | undefined>
  delete(id: string): Promise<SmartLock | undefined>
}

class SequelizeSmartLocksRepository extends SequelizeRepositoryBase<SmartLock> implements SmartLocksRepository {
  smartLockModel = this.db.getModel(SequelizeInstance.modelNames.smartLock)
  deviceProfileModel = this.db.getModel(SequelizeInstance.modelNames.deviceProfile)

  constructor(
    db: SequelizeInstance,
    protected override mapper: SmartLockMapper
  ) { super(db, mapper, SequelizeInstance.modelNames.smartLock) }

  create = this.crud.create
  readAll = this.crud.readAll
  readById = this.crud.readById

  readByIdIncludeDevice = async (id: string): Promise<SmartLock | undefined> => {
    const account = (await this.smartLockModel
      .findByPk(id, {
        include: [this.deviceProfileModel]
      }))
      ?.toJSON()

    return this.mapper.map(account).addDeviceProfile(account?.[SequelizeInstance.modelNames.deviceProfile]).get()
  }

  update = this.crud.update

  updateDeviceProfileId = async (id: string, deviceId: number): Promise<SmartLock | undefined> => {
    return await this.crud.update(id, {
      [`${SequelizeInstance.modelNames.deviceProfile}Id`]: deviceId
    })
  }
  
  delete = this.crud.delete
}

export { SmartLocksRepository, SequelizeSmartLocksRepository }