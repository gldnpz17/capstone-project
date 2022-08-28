import AuthorizationRule from "./AuthorizationRule"
import RulesEngineService from "../services/RulesEngineService"
import Claim from "./Claim"
import LockDevice from "./LockDevice"
import LockActions from "../enums/LockActions"
import ScheduledLockAction from "./ScheduledLockAction"
import TaskSchedulingService from "../services/TaskSchedulingService"
import QrCodeService from "../services/QrCodeService"
import File from "./File"

class SmartLock {
  identifier: string
  rules: AuthorizationRule[]

  scheduledActions: ScheduledLockAction[]

  device: LockDevice

  private startScheduledActions(): void {
    this.scheduledActions.forEach(action => action.start())
  }

  private stopScheduledActions(): void {
    this.scheduledActions.forEach(action => action.stop())
  }

  async generateQrCode(qrCode: QrCodeService): Promise<File> {
    return qrCode.generateSmartLockQrCode(this)
  }

  connect(device: LockDevice): void {
    this.device = device
    this.startScheduledActions()
  }

  disconnect(): void {
    this.stopScheduledActions()
    this.device = null
  }

  performAction(action: LockActions, claims: Array<Claim>, rulesEngine: RulesEngineService): void {
    if (rulesEngine.authorized(claims, this.rules)) {
      this.device.performAction(action)
    }
  }
}

export default SmartLock