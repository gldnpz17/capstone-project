import { DeviceProfile } from "../entities/DeviceProfile";

interface DeviceMessagingService {
  send(device: DeviceProfile, message: string): void
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
}

export { 
  DeviceMessagingService,
  MockDeviceMessagingService
}