import { AdminPrivilege, ApplicationConfiguration } from "../domain-model/common/ApplicationConfiguration";
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
    private repository: AdminPrivilegePresetRepository
  ) { }

  readAvailablePrivileges(): AdminPrivilegeMetadata[] {
    return this.config.adminPrivileges.map(privilege => new AdminPrivilegeMetadata(privilege))
  }

  create = this.repository.create
  readById = this.repository.readById
  readAll = this.repository.readAll
  update = this.repository.update
  delete = this.repository.delete
}

export { AdminPrivilegeUseCases, AdminPrivilegeMetadata }