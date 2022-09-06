class AdminPrivilegePreset {
  constructor(
    public id: string,
    public name: string,
    public canManageAccounts: boolean,
    public canManageLocks: boolean
  ) { }
}

export { AdminPrivilegePreset }