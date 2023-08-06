import { NotImplementedError } from "../../common/Errors";
import { AuthorizationRule } from "./AuthorizationRule";
import { DeviceProfile } from "./DeviceProfile";

type LockStatus = 'locked' | 'unlocked'
type LockCommand = 'lock' | 'unlock'

class StatusHelper {
  private static _commands: LockCommand[] = ['lock', 'unlock']
  private static _statuses: LockStatus[] = ['locked', 'unlocked']
  
  private static _matchArray = <T, U>(source: T[], target: U[]) => (item: T): U => {
    const index = source.indexOf(item)
    if (index == -1) throw new NotImplementedError()
    return target[index]
  }

  static statusToComand = (status: LockStatus): LockCommand => this._matchArray(this._statuses, this._commands)(status)
  static commandToStatus = (command: LockCommand): LockStatus => this._matchArray(this._commands, this._statuses)(command)
}

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

export { SmartLock, LockStatus, LockCommand, StatusHelper }