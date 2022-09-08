import { EnumClaimTypeOption } from "../domain-model/entities/EnumClaimTypeOption";
import { EnumClaimTypeOptionsMapper } from "./common/RepositoryMapper";
import { SequelizeInstance } from "./common/SequelizeModels";
import { SequelizeRepositoryBase } from "./common/SequelizeRepositoryBase";

interface EnumClaimTypeOptionsRepository {
  create(option: { claimTypeId: number, value: string }): Promise<EnumClaimTypeOption>
  readByClaimType(claimTypeId: number): Promise<EnumClaimTypeOption[]>
  delete(id: number): Promise<EnumClaimTypeOption | undefined>
}

class SequelizeEnumClaimTypeOptionsRepository extends SequelizeRepositoryBase<EnumClaimTypeOption> implements EnumClaimTypeOptionsRepository {
  constructor(
    db: SequelizeInstance,
    mapper: EnumClaimTypeOptionsMapper
  ) { super(db, mapper, SequelizeInstance.modelNames.enumClaimTypeOption) }

  create = async (option: { claimTypeId: number, value: string }): Promise<EnumClaimTypeOption> => {
    const { claimTypeId, ...rest } = option
    
    const instance = await this.model.create({
      [SequelizeInstance.getId(SequelizeInstance.modelNames.claimType)]: claimTypeId,
      ...rest
    })

    return this.mapper.map(instance.toJSON()).get()
  }
  
  readByClaimType = async (claimTypeId: number): Promise<EnumClaimTypeOption[]> => {
    const instances = await this.model.findAll({ 
      where: {
        [SequelizeInstance.getId(SequelizeInstance.modelNames.claimType)]: claimTypeId
      } 
    })

    return instances.map(instance => this.mapper.map(instance.toJSON()).get()) 
  }
  
  delete = this.crud.delete
}

export { EnumClaimTypeOptionsRepository, SequelizeEnumClaimTypeOptionsRepository }