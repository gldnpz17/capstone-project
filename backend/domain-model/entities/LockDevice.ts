import LockActions from "../enums/LockActions"

abstract class LockDevice {
  identifier: number
  connected: boolean
  
  abstract performAction(action: LockActions): void
}

export default LockDevice