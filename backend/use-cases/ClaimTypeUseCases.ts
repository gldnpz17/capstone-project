import { NotImplementedError } from "../common/Errors";
import { ClaimType, ClaimTypeOptions } from "../domain-model/entities/ClaimType";
import { EnumClaimTypeOption } from "../domain-model/entities/EnumClaimTypeOption";
import { ClaimTypeRepository } from "../repositories/ClaimTypeRepository";
import { EnumClaimTypeOptionsRepository } from "../repositories/EnumClaimTypeOptionsRepository";

class ClaimTypeUseCases {
  constructor(
    private repository: ClaimTypeRepository,
    private enumOptionsRepository: EnumClaimTypeOptionsRepository
  ) { }

  create = async (params: { name: string, dataType: ClaimTypeOptions, options: string[] }): Promise<ClaimType> => {
    const { options, ...newClaimType } = params
    const claimType = await this.repository.create(newClaimType)
    if (params.dataType === "enum" && options) {
      await Promise.all(options.map(async option => 
        await this.enumOptionsRepository.create({ 
          claimTypeId: claimType.id,
          value: option
        })
      ))
    }

    return claimType
  }
  readAll = this.repository.readAll
  readById = this.repository.readById
  addEnumClaimTypeOption = async (option: { claimTypeId: number, value: string }) => {
    const claimType = await this.repository.readById(option.claimTypeId)

    if (claimType?.dataType !== "enum") throw new NotImplementedError()

    return await this.enumOptionsRepository.create(option)
  }
  readAllEnumClaimTypeOptions = this.enumOptionsRepository.readByClaimType
  deleteEnumClaimTypeOption = this.enumOptionsRepository.delete
  update = this.repository.update
  delete = this.repository.delete
}

export { ClaimTypeUseCases }