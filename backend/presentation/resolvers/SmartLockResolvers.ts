import { SmartLockUseCases } from "../../use-cases/SmartLockUseCases";
import { ResolversBase } from "./common/ResolversBase";

class SmartLockResolvers extends ResolversBase {
  constructor(
    private useCases: SmartLockUseCases
  ) { super() }

  override getMutationResolvers(): object {
    return {
      createSmartLock: this.mapUseCase(this.useCases.create),
      updateSmartLock: this.mapUseCase(this.useCases.update, { spread: true }),
      deleteSmartLock: this.mapUseCase(this.useCases.delete, { spread: true })
    }
  }
}

export { SmartLockResolvers }