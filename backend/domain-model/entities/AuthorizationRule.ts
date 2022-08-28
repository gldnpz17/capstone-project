import AuthorizationRuleTemplate from "./AuthorizationRuleTemplate";

class AuthorizationRule {
  template: AuthorizationRuleTemplate
  priority: number
  arguments: string
}

export default AuthorizationRule