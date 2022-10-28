import { SmartLock } from "./SmartLock";

class DeviceProfile {
  constructor(
    public id: number,
    public privateKey: string,
    public publicKey: string,
    public macAddress: string,
    public verified: boolean,
    public connectionStatus: 'connected' | 'disconnected',
    public smartLock?: SmartLock
  ) { }
}

export { DeviceProfile }