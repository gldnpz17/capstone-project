import SmartLock from "../domain-model/entities/SmartLock"
import Account from "../domain-model/entities/Account"
import RulesEngineService from "../domain-model/services/RulesEngineService"
import LockActions from "../domain-model/enums/LockActions"

const OpenLock = (rulesEngine: RulesEngineService) => {
  const account = new Account()
  const lock = new SmartLock()

  account.actOnLock(LockActions.Open, lock, rulesEngine)
}