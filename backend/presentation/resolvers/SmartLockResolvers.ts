import { KeyValueService } from "../../domain-model/services/KeyValueService";
import { SmartLockUseCases } from "../../use-cases/SmartLockUseCases";
import { ResolversBase } from "./common/ResolversBase";

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
      connectSmartLock: this.mapUseCase(this.useCases.connect, { spread: true }),
      pingDevice: this.mapUseCase(this.useCases.ping, { spread: true }),
      confirmDevice: this.mapUseCase(this.useCases.confirmDevice),
      updateSmartLockRule: this.mapUseCase(this.useCases.updateSmartLockRule)
    }
  }
}

export { SmartLockResolvers }