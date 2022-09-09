import { NotImplementedError } from "../common/Errors";
import { ClaimInstance } from "../domain-model/entities/ClaimInstance";
import { ClaimType } from "../domain-model/entities/ClaimType";
import { ClaimTypeRepository } from "./ClaimTypeRepository";
import { SequelizeGenericCrud } from "./common/GenericCrud";
import { ClaimInstanceMapper } from "./common/RepositoryMapper";
import { SequelizeInstance } from "./common/SequelizeModels";
import { SequelizeRepositoryBase } from "./common/SequelizeRepositoryBase";

interface ClaimInstancesRepository {
  create(claim: { typeId: number, accountId: string, value: any }): Promise<ClaimInstance>
  update(id: number, value: any): Promise<ClaimInstance | undefined>
  delete(id: number): Promise<ClaimInstance | undefined>
}

class SequelizeClaimInstancesRepository extends SequelizeRepositoryBase<ClaimInstance> implements SequelizeClaimInstancesRepository {
  constructor(
    db: SequelizeInstance,
    mapper: ClaimInstanceMapper,
    private typeRepository: ClaimTypeRepository
  ) { super(db, mapper, SequelizeInstance.modelNames.claimInstance) }

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

    console.log(fetchedInstance.toJSON())

    return this.mapper.map(fetchedInstance.toJSON()).get()
  }

  update = this.crud.update
  delete = this.crud.delete
}

export { ClaimInstancesRepository, SequelizeClaimInstancesRepository }