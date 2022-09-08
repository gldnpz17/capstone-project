import { ClaimType, ClaimTypeOptions } from "../domain-model/entities/ClaimType"
import { GenericCrud, GenericReadAllConfig, SequelizeGenericCrud } from "./common/GenericCrud"
import { ClaimTypeMapper, EntityMapperBase } from "./common/RepositoryMapper"
import { SequelizeInstance } from "./common/SequelizeModels"
import { SequelizeRepositoryBase } from "./common/SequelizeRepositoryBase"

interface ClaimTypeRepository {
  create(claimType: { name: string, dataType: ClaimTypeOptions }): Promise<ClaimType>
  readAll(config: GenericReadAllConfig): Promise<ClaimType[]>
  readById(id: number): Promise<ClaimType | undefined>
  update(id: number, instance: { name: string }): Promise<ClaimType | undefined>
  delete(id: number): Promise<ClaimType | undefined>
}

class SequelizeClaimTypesRepository extends SequelizeRepositoryBase<ClaimType> implements ClaimTypeRepository {
  constructor(
    db: SequelizeInstance,
    mapper: ClaimTypeMapper
  ) { super(db, mapper, SequelizeInstance.modelNames.claimType) }

  create = this.crud.create
  readAll = this.crud.readAll
  readById = this.crud.readById
  update = this.crud.update
  delete = this.crud.delete
}

export { ClaimTypeRepository, SequelizeClaimTypesRepository }