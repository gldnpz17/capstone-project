class AuthorizationRule {
  constructor(
    public savedRule: string,
    public deployedRule: string,
    public argsSchema: string
  ) { }
}

export { AuthorizationRule }