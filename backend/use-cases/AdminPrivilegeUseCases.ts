import { NotImplementedError } from "../common/Errors";
import { AdminPrivilege, ApplicationConfiguration } from "../domain-model/common/ApplicationConfiguration";
import { AccountsRepository } from "../repositories/AccountsRepository";
import { AdminPrivilegePresetRepository } from "../repositories/AdminPrivilegePresetRepository";

class AdminPrivilegeMetadata {
  name: string
  description: string

  constructor(adminPrivilege: AdminPrivilege) {
    const { name, description }  = adminPrivilege
    this.name = name
    this.description = description
  }
}

class AdminPrivilegeUseCases {
  constructor(
    private config: ApplicationConfiguration,
    private accountsRepository: AccountsRepository,
    private privilegesRepository: AdminPrivilegePresetRepository
  ) { }

  readAvailablePrivileges(): AdminPrivilegeMetadata[] {
    return this.config.adminPrivileges.map(privilege => new AdminPrivilegeMetadata(privilege))
  }

  create = async (privilege: { 
    name: string, 
    canManageAccounts: boolean,
    canManageLocks: boolean
  }) => {
    await this.privilegesRepository.create({ system: false, ...privilege })
  }
  readById = this.privilegesRepository.readById
  readAll = this.privilegesRepository.readAll
  readByAccountId = this.privilegesRepository.readByAccountId
  update = this.privilegesRepository.update
  delete = async (id: number) => {
    const privilege = await this.privilegesRepository.readByIdIncludeAccounts(id)

    if (!privilege) return undefined

    if (privilege && privilege.system) throw new NotImplementedError()
    
    if (privilege?.accounts) {
      const endUserPreset = await this.privilegesRepository.readEndUserPreset()

      await Promise.all(privilege.accounts.map(async account => {
        await this.accountsRepository.updateAdminPrivilege(account.id, endUserPreset.id)
      }))
    }

    return await this.privilegesRepository.delete(privilege.id)
  }
}

export { AdminPrivilegeUseCases, AdminPrivilegeMetadata }