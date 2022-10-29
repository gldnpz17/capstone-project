class AuthorizationRule {
  constructor(
    public id: number,
    public savedRule: string,
    public deployedRule: string,
    public savedFormSchema: string,
    public deployedFormSchema: string,
    public hasPendingChanges: boolean
  ) { }
}

export { AuthorizationRule }