import { SequelizeInstance } from '../../repositories/common/SequelizeModels';
import { AccountUseCases } from '../../use-cases/AccountUseCases';
import { ResolversBase } from './common/ResolversBase';

class AccountResolvers extends ResolversBase {
  constructor( 
    private accountUseCases: AccountUseCases
  ) { super() }

  override getMutationResolvers(): object {
    return {
      registerAccount: this.mapUseCase(this.accountUseCases.register),
      deleteAccount: this.mapUseCase(this.accountUseCases.delete, { spread: true }),
      authenticatePassword: this.mapUseCase(this.accountUseCases.authenticatePassword),
      authenticateSecondFactor: this.mapUseCase(this.accountUseCases.authenticateSecondFactor),
      addClaimToAccount: this.mapUseCase(this.accountUseCases.addClaim),
      updateClaim: this.mapUseCase(this.accountUseCases.updateClaim, { spread: true }),
      deleteClaim: this.mapUseCase(this.accountUseCases.deleteClaim, { spread: true })
    }
  }
}

export { AccountResolvers }