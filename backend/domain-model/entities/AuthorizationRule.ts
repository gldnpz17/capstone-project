import { SmartLock } from "./SmartLock";

class AuthorizationRule {
  constructor(
    public id: number,
    public name: string,
    public savedRule: string,
    public deployedRule: string,
    public savedFormSchema: string,
    public deployedFormSchema: string,
    public hasPendingChanges: boolean,
    public smartLocks?: SmartLock[]
  ) { }
}

export { AuthorizationRule }