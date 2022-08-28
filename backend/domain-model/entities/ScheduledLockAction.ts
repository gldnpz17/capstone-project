import LockActions from "../enums/LockActions"
import LockDevice from "./LockDevice"
import ScheduledTask from "./ScheduledTask"

class ScheduledLockAction extends ScheduledTask {
  action: LockActions
  device: LockDevice

  execute(): void {
    this.device.performAction(this.action)
  }
}

export default ScheduledLockAction