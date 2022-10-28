import { DeviceProfile } from "../entities/DeviceProfile";

interface DeviceMessagingService {
  send(device: DeviceProfile, message: string): void
}

class MockDeviceMessagingService implements DeviceMessagingService {
  send(device: DeviceProfile, message: string): void {
    console.log(`Message sent to ${device.macAddress} : ${message}`)
  }
}

export { 
  DeviceMessagingService,
  MockDeviceMessagingService
}