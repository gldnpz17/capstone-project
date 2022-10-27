import { SmartLock } from "../domain-model/entities/SmartLock"
import { GenericReadAllConfig } from "./common/GenericCrud"
import { DeviceProfile } from "../domain-model/entities/DeviceProfile"
import { SequelizeRepositoryBase } from "./common/SequelizeRepositoryBase"
import { SequelizeInstance } from "./common/SequelizeModels"
import { DeviceProfileMapper } from "./common/RepositoryMapper"

interface DeviceProfilesRepository {
  create(deviceProfile: { privateKey: string, publicKey: string, smartLockId: string }): Promise<DeviceProfile>
  readAll(config: GenericReadAllConfig): Promise<DeviceProfile[]>
  readById(id: number): Promise<DeviceProfile | undefined>
  update(id: number, instance: { connectionStatus: 'connected' | 'disconnected', smartLockId: string }): Promise<DeviceProfile | undefined>
  delete(id: number): Promise<DeviceProfile | undefined>
}

class SequelizeDeviceProfilesRepository extends SequelizeRepositoryBase<DeviceProfile> {
  constructor(
    db: SequelizeInstance,
    mapper: DeviceProfileMapper
  ) { super(db, mapper, SequelizeInstance.modelNames.deviceProfile) }
  
  create = this.crud.create
  readAll = this.crud.readAll
  readById = this.crud.readById
  update = this.crud.update
  delete = this.crud.delete
}

export { DeviceProfilesRepository, SequelizeDeviceProfilesRepository }