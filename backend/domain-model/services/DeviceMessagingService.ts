import { NotImplementedError } from "../../common/Errors";
import { DeviceProfile } from "../entities/DeviceProfile";

type CommandOperations = {
  toStatus: (command: string) => string,
  fromStatus: (status: string) => string
}

interface DeviceMessagingService {
  send(device: DeviceProfile, message: string): void
  commands: CommandOperations
}

type SubscriptionFunction = (message: string) => void

class MockDeviceMessagingService implements DeviceMessagingService {
  private deviceSubscriptions: Record<number, Record<number, SubscriptionFunction>> = {}

  send = (device: DeviceProfile, message: string): void => {
    const deviceSubscription = this.deviceSubscriptions[device.id]
    for (const subscriptionId in deviceSubscription) {
      const subscription = deviceSubscription[subscriptionId]
      subscription(message)
    }

    console.log(`Message sent to ${device.macAddress} : ${message}`)
  }

  subscribe = (deviceId: string, onMessage: SubscriptionFunction): (() => void) => {
    const id = Math.random()

    if (!this.deviceSubscriptions[deviceId]) this.deviceSubscriptions[deviceId] = {}
    this.deviceSubscriptions[deviceId][id] = onMessage

    return () => delete this.deviceSubscriptions[deviceId][id]
  }

  waitForMessage = async (deviceId: string): Promise<string> => {
    return new Promise(resolve => {
      const unsubscribe = this.subscribe(deviceId, (message) => {
        unsubscribe()
        resolve(message)
      })
    })
  }

  _commands = ["lock", "unlock"]
  _statuses = ["locked", "unlocked"]

  _matchArray = (source: string[], target: string[]) => (item: string): string => {
    const index = source.indexOf(item)
    if (index == -1) throw new NotImplementedError()
    return target[index]
  }

  commands: CommandOperations = {
    toStatus: this._matchArray(this._commands, this._statuses),
    fromStatus: this._matchArray(this._statuses, this._commands)
  }
}

export { 
  DeviceMessagingService,
  MockDeviceMessagingService
}