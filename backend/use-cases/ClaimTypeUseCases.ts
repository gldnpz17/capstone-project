import { EnumClaimTypeOption } from "../domain-model/entities/EnumClaimTypeOption";
import { ClaimTypeRepository } from "../repositories/ClaimTypeRepository";
import { EnumClaimTypeOptionsRepository } from "../repositories/EnumClaimTypeOptionsRepository";

class ClaimTypeUseCases {
  constructor(
    private repository: ClaimTypeRepository,
    private enumOptionsRepository: EnumClaimTypeOptionsRepository
  ) { }

  create = this.repository.create
  readAll = this.repository.readAll
  readById = this.repository.readById
  addEnumClaimTypeOption = this.enumOptionsRepository.create
  readAllEnumClaimTypeOptions = this.enumOptionsRepository.readByClaimType
  deletEnumClaimTypeOption = this.enumOptionsRepository.delete
  update = this.repository.update
  delete = this.repository.delete
}

export { ClaimTypeUseCases }