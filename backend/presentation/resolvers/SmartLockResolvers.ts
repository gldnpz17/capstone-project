import { KeyValueService } from "../../domain-model/services/KeyValueService";
import { AccessToken } from "../../use-cases/AccountUseCases";
import { SmartLockUseCases } from "../../use-cases/SmartLockUseCases";
import { ResolversBase } from "./common/ResolversBase";

type sendCommandArgs = {
  smartLockId: string, 
  command: string
}

class SmartLockResolvers extends ResolversBase {
  constructor(
    private useCases: SmartLockUseCases,
    private deviceStatusStore: KeyValueService
  ) { super() }

  override getTypeResolvers(): object {
    return {
      DeviceProfile: {
        connectionStatus: (parent: { id: number }) => {
          return this.deviceStatusStore.get(parent.id.toString()) ?? 'disconnected'
        }
      }
    }
  }

  override getMutationResolvers(): object {
    return {
      createSmartLock: this.mapUseCase(this.useCases.create),
      updateSmartLock: this.mapUseCase(this.useCases.update, { spread: true }),
      deleteSmartLock: this.mapUseCase(this.useCases.delete, { spread: true }),
      pingDevice: this.mapUseCase(this.useCases.ping, { spread: true }),
      verifyDevice: this.mapUseCase(this.useCases.verifyDevice),
      updateSmartLockRule: this.mapUseCase(this.useCases.updateSmartLockRule),
      sendCommand: async (_: any, args: sendCommandArgs, context: AccessToken ) => {
        return await this.useCases.sendCommand(args, context.account.id)
      }
    }
  }
}

export { SmartLockResolvers }