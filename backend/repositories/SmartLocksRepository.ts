import { SmartLock } from "../domain-model/entities/SmartLock";
import { GenericReadAllConfig } from "./common/GenericCrud";
import { SmartLockMapper } from "./common/RepositoryMapper";
import { SequelizeInstance } from "./common/SequelizeModels";
import { SequelizeRepositoryBase } from "./common/SequelizeRepositoryBase";

interface SmartLocksRepository {
  create(smartLock: { name: string, wifiSsid?: string, wifiPassword?: string }): Promise<SmartLock>
  readAll(config: GenericReadAllConfig): Promise<SmartLock[]>
  readById(id: string): Promise<SmartLock | undefined>
  update(id: string, instance: { name: string }): Promise<SmartLock | undefined>
  delete(id: string): Promise<SmartLock | undefined>
}

class SequelizeSmartLocksRepository extends SequelizeRepositoryBase<SmartLock> {
  constructor(
    db: SequelizeInstance,
    mapper: SmartLockMapper
  ) { super(db, mapper, SequelizeInstance.modelNames.smartLock) }

  create = this.crud.create
  readAll = this.crud.readAll
  readById = this.crud.readById
  update = this.crud.update
  delete = this.crud.delete
}

export { SmartLocksRepository, SequelizeSmartLocksRepository }