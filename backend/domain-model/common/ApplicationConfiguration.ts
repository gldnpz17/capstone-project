import { AdminPrivilegePreset } from "../entities/AdminPrivilegePreset"

const AdminPrivilegeNames = {
  canManageAccounts: 'canManageAccounts',
  canManageLocks: 'canManageLocks'
}

class AdminPrivilege {
  constructor(
    public name: string,
    public description: string,
    public getValue: (preset: AdminPrivilegePreset) => boolean
  ) { }
}

class ApplicationConfiguration {
  constructor(
    public jwtSigningSecret: string,
    public adminPrivileges: AdminPrivilege[],
    public defaultAuthorizationRule: string
  ) { }
}

export { ApplicationConfiguration, AdminPrivilege, AdminPrivilegeNames }