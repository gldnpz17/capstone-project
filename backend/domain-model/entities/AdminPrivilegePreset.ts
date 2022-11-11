import { Account } from "./Account";

class AdminPrivilegePreset {
  constructor(
    public id: number,
    public name: string,
    public system: boolean,
    public isSuperAdmin: boolean,
    public canManageAccounts: boolean,
    public canManageLocks: boolean,
    public accounts? : Account[]
  ) { }
}

export { AdminPrivilegePreset }