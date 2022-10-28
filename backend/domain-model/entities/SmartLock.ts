import { AuthorizationRuleInstance } from "./AuthorizationRuleInstance";
import { DeviceProfile } from "./DeviceProfile";

class SmartLock {
  constructor(
    public id: string,
    public name: string,
    public wifiSsid: string,
    public wifiPassword: string,
    public lockStatus: 'locked' | 'unlocked',
    public device?: DeviceProfile,
    public rule? : AuthorizationRuleInstance
  ) { }
}

export { SmartLock }