import { Account } from "./Account";

class AdminPrivilegePreset {
  constructor(
    public id: number,
    public name: string,
    public system: string,
    public canManageAccounts: boolean,
    public canManageLocks: boolean,
    public accounts? : Account[]
  ) { }
}

export { AdminPrivilegePreset }