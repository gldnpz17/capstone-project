import AuthorizationRule from "../entities/AuthorizationRule"
import Claim from "../entities/Claim"

interface RulesEngineService {
  authorized(claims: Claim[], rules: AuthorizationRule[]): Boolean
}

export default RulesEngineService