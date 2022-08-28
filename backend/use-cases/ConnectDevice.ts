
import Esp32LockDevice from "../domain-model/entities/Esp32LockDevice"
import SmartLock from "../domain-model/entities/SmartLock"

const ConnectDevice = () => {
  const device = new Esp32LockDevice()
  const lock = new SmartLock()

  lock.connect(device)
}