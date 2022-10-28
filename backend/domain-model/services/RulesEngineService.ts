import { AuthorizationRuleInstance } from "../entities/AuthorizationRuleInstance";
import { ClaimInstance } from "../entities/ClaimInstance";

class Result {
  constructor(
    public success: boolean,
    public errorMessage: string | null = null
  ) { }
}

interface RulesEngineService {
  checkAuthorization(claims: ClaimInstance[], ruleInstance: AuthorizationRuleInstance): Result
}

class MockRulesEngineService implements RulesEngineService {
  checkAuthorization = (claims: ClaimInstance[], ruleInstance: AuthorizationRuleInstance): Result => {
    return new Result(true)
  }
}

export {
  RulesEngineService,
  MockRulesEngineService
}