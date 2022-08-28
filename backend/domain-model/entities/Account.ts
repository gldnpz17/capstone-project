import SmartLock from "./SmartLock"
import Claim from "./Claim"
import RulesEngineService from "../services/RulesEngineService"
import LockActions from "../enums/LockActions"

class Account {
  username: string
  claims: Claim[]

  doToLock(action: LockActions, lock: SmartLock, rulesEngine: RulesEngineService): void {
    lock.performAction(action, this.claims, rulesEngine)
  }
}

export default Account