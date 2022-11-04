import { AuthorizationRuleUseCases } from "../../use-cases/AuthorizationRuleUseCases";
import { ResolversBase } from "./common/ResolversBase";

class AuthorizationRuleResolvers extends ResolversBase {
  constructor(
    private useCases: AuthorizationRuleUseCases
  ) { super() }

  override getTypeResolvers(): object {
    return {
      AuthorizationRule: {
        hasPendingChanges: (parent: { savedRule: string, deployedRule: string }) => {
          return parent.savedRule != parent.deployedRule
        }
      }
    }
  }

  override getMutationResolvers(): object {
    return {
      createAuthorizationRule: this.mapUseCase(this.useCases.create),
      saveAuthorizationRuleChanges: this.mapUseCase(this.useCases.saveChanges),
      updateAuthorizationRule: this.mapUseCase(this.useCases.update),
      deployAuthorizationRule: this.mapUseCase(this.useCases.deploy, { spread: true }),
      deleteAuthorizationRule: this.mapUseCase(this.useCases.delete, { spread: true }),
      applySchema: this.mapUseCase(this.useCases.applySchema),
      testAuthorizationRule: this.mapUseCase(this.useCases.execute)
    }
  }
}

export { AuthorizationRuleResolvers }