import { NotImplementedError } from "../common/Errors";
import { ClaimInstance } from "../domain-model/entities/ClaimInstance";
import { ClaimType } from "../domain-model/entities/ClaimType";
import { ClaimTypeRepository } from "./ClaimTypeRepository";
import { GenericCrud, SequelizeGenericCrud } from "./common/GenericCrud";
import { ClaimInstanceMapper } from "./common/RepositoryMapper";
import { SequelizeInstance } from "./common/SequelizeModels";
import { SequelizeRepositoryBase } from "./common/SequelizeRepositoryBase";

interface ClaimInstancesRepository {
  readByIdIncludeType(id: number): Promise<ClaimInstance>
  create(claim: { typeId: number, accountId: string, value: any }): Promise<ClaimInstance>
  update(id: number, value: any): Promise<ClaimInstance | undefined>
  delete(id: number): Promise<ClaimInstance | undefined>
}

class SequelizeClaimInstancesRepository extends SequelizeRepositoryBase<ClaimInstance> implements SequelizeClaimInstancesRepository {
  constructor(
    db: SequelizeInstance,
    protected override mapper: ClaimInstanceMapper,
    private typeRepository: ClaimTypeRepository
  ) { super(db, mapper, SequelizeInstance.modelNames.claimInstance) }

  private queryOptions = { include: this.db.getModel(SequelizeInstance.modelNames.claimType) }

  override crud: GenericCrud<ClaimInstance> = new SequelizeGenericCrud(this.model, this.mapper, {
    updateOptions: this.queryOptions,
    deleteOptions: this.queryOptions
  })

  readByIdIncludeType = async (id: number): Promise<ClaimInstance> => {
    const claimInstance = await this.model.findByPk(id, {
      include: this.db.getModel(SequelizeInstance.modelNames.claimType)
    })

    return this.mapper.map(claimInstance?.toJSON()).addType(claimInstance?.[SequelizeInstance.modelNames.claimType]).get()
  }

  create = async (claim: { typeId: number, accountId: string, value: any }): Promise<ClaimInstance> => {
    const { typeId, accountId, value } = claim
    
    const type = await this.typeRepository.readById(typeId)
    
    if (!type) throw new NotImplementedError()

    const createdInstance = await this.model.create({
      [SequelizeInstance.getId(SequelizeInstance.modelNames.claimType)]: typeId,
      [SequelizeInstance.getId(SequelizeInstance.modelNames.account)]: accountId,
      [`${type.dataType}Value`]: value
    })

    const fetchedInstance = await this.model.findByPk(createdInstance.toJSON().id, {
      include: this.db.getModel(SequelizeInstance.modelNames.claimType)
    })

    if (!fetchedInstance) throw new NotImplementedError()

    return this.mapper.map(fetchedInstance.toJSON()).get()
  }

  update = this.crud.update
  delete = this.crud.delete
}

export { ClaimInstancesRepository, SequelizeClaimInstancesRepository }