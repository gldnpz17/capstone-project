import { SmartLock } from "./SmartLock";

class DeviceProfile {
  constructor(
    public id: string,
    public privateKey: string,
    public publicKey: string,
    public macAddress: string,
    public connectionStatus: 'connected' | 'disconnected',
    public smartLock?: SmartLock
  ) { }
}

export { DeviceProfile }