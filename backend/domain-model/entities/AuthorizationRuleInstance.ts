import { AuthorizationRule } from "./AuthorizationRule";

class AuthorizationRuleInstance {
  constructor(
    public authorizationRule: AuthorizationRule,
    public argsValue: string
  ) { }
}

export { AuthorizationRuleInstance }