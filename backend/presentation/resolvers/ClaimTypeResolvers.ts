import { ClaimTypeUseCases } from "../../use-cases/ClaimTypeUseCases";
import { ResolversBase } from "./common/ResolversBase";

class ClaimTypeResolvers extends ResolversBase {
  constructor(
    private useCases: ClaimTypeUseCases
  ) { super() }

  override getMutationResolvers(): object {
    return {
      createClaimType: this.mapUseCase(this.useCases.create),
      deleteClaimType: this.mapUseCase(this.useCases.delete, { spread: true }),
      addEnumClaimTypeOption: this.mapUseCase(this.useCases.addEnumClaimTypeOption),
      deleteEnumClaimTypeOption: this.mapUseCase(this.useCases.deleteEnumClaimTypeOption, { spread: true })
    }
  }
}

export { ClaimTypeResolvers }