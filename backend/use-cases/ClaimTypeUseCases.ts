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

  private isCamelCase = (str: string): boolean => {
    const hasSpace = str.includes(' ')
    const firstLetterIsLowercase = /[a-z]/.test(str[0])
  
    return (!hasSpace && firstLetterIsLowercase)
  } 
  
  private toCamelCase = (str: string): string => {
    if (this.isCamelCase(str)) return str
  
    return str.
      split(' ')
      .map((word, index) => {
        const firstLetter = word[0]
        return (index === 0 ? firstLetter.toLowerCase() : firstLetter.toUpperCase()) + word.slice(1)
      })
      .join('')
  }

  create = async (params: { name: string, dataType: ClaimTypeOptions, options: string[] }): Promise<ClaimType> => {
    const { options, name, ...rest } = params
    const newClaimType = {
      name,
      camelCaseName: this.toCamelCase(name),
      ...rest
    }

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
  update = async (id: number, claimType: { name: string }) => {
    return await this.repository.update(id, {
      name: claimType.name,
      camelCaseName: this.toCamelCase(claimType.name)
    })
  }
  delete = this.repository.delete
}

export { ClaimTypeUseCases }