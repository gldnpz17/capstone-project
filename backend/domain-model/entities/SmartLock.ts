import { AuthorizationRule } from "./AuthorizationRule";
import { DeviceProfile } from "./DeviceProfile";

class SmartLock {
  constructor(
    public id: string,
    public name: string,
    public wifiSsid: string,
    public wifiPassword: string,
    public lockStatus: 'locked' | 'unlocked',
    public authorizationRuleArgs: string,
    public device?: DeviceProfile,
    public authorizationRule? : AuthorizationRule
  ) { }
}

export { SmartLock }