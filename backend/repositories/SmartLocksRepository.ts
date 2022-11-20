import { SmartLock } from "../domain-model/entities/SmartLock";
import { GenericReadAllConfig } from "./common/GenericCrud";
import { SmartLockMapper } from "./common/RepositoryMapper";
import { SequelizeInstance } from "./common/SequelizeModels";
import { SequelizeRepositoryBase } from "./common/SequelizeRepositoryBase";

interface SmartLocksRepository {
  create(smartLock: { name: string, wifiSsid?: string, wifiPassword?: string }): Promise<SmartLock>
  readAll(config: GenericReadAllConfig): Promise<SmartLock[]>
  readById(id: string): Promise<SmartLock | undefined>
  readByIdIncludeDeviceAndAuthorizationRule(id: string): Promise<SmartLock | undefined>
  update(id: string, instance: { name?: string, authorizationRuleArgs?: string }): Promise<SmartLock | undefined>
  updateDeviceProfileId(id: string, deviceId: string): Promise<SmartLock | undefined>
  updateLockStatus(id: string, lockStatus: string): Promise<SmartLock | undefined>
  updateAuthorizationRule(id: string, rule: { id: number, args: string }): Promise<SmartLock | undefined>
  delete(id: string): Promise<SmartLock | undefined>
}

class SequelizeSmartLocksRepository extends SequelizeRepositoryBase<SmartLock> implements SmartLocksRepository {
  smartLockModel = this.db.getModel(SequelizeInstance.modelNames.smartLock)
  deviceProfileModel = this.db.getModel(SequelizeInstance.modelNames.deviceProfile)
  authorizationRuleModel = this.db.getModel(SequelizeInstance.modelNames.authorizationRule)

  constructor(
    db: SequelizeInstance,
    protected override mapper: SmartLockMapper
  ) { super(db, mapper, SequelizeInstance.modelNames.smartLock) }

  create = this.crud.create
  readAll = this.crud.readAll
  readById = this.crud.readById

  readByIdIncludeDeviceAndAuthorizationRule = async (id: string): Promise<SmartLock | undefined> => {
    const smartLock = (await this.smartLockModel
      .findByPk(id, {
        include: [this.deviceProfileModel, this.authorizationRuleModel]
      }))
      ?.toJSON()

    return this.mapper
      .map(smartLock)
      .addDeviceProfile(smartLock?.[SequelizeInstance.modelNames.deviceProfile])
      .addAuthorizationRule(smartLock?.[SequelizeInstance.modelNames.authorizationRule])
      .get()
  }

  update = this.crud.update

  updateDeviceProfileId = async (id: string, deviceId: string): Promise<SmartLock | undefined> => {
    return await this.crud.update(id, {
      [`${SequelizeInstance.modelNames.deviceProfile}Id`]: deviceId
    })
  }

  updateLockStatus = async (id: string, lockStatus: string): Promise<SmartLock | undefined> => {
    const lock = await this.model.findByPk(id)
    if (!lock) return undefined
    lock["lockStatus"] = lockStatus
    await lock.save()
    return lock.toJSON()
  }

  updateAuthorizationRule = async (id: string, rule: { id: number, args: string }): Promise<SmartLock | undefined> => {
    return await this.crud.update(id, {
      [SequelizeInstance.getId(SequelizeInstance.modelNames.authorizationRule)]: rule.id,
      authorizationRuleArgs: rule.args
    })
  }
  
  delete = this.crud.delete
}

export { SmartLocksRepository, SequelizeSmartLocksRepository }