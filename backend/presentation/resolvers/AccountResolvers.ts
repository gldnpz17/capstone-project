import { SequelizeInstance } from '../../repositories/common/SequelizeModels';
import { AccountUseCases } from '../../use-cases/AccountUseCases';
import { GraphqlContext } from '../Server';
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
      setupSecondFactor: async (_: any, args: any, context: GraphqlContext ) => {
        const result = await this.accountUseCases.setupSecondFactor(args)
        context.setRefreshToken(result.refreshToken)
        return result
      },
      authenticateSecondFactor: async (_: any, args: any, context: GraphqlContext ) => {
        const result = await this.accountUseCases.authenticateSecondFactor(args)
        context.setRefreshToken(result.refreshToken)
        return result
      },
      addClaimToAccount: this.mapUseCase(this.accountUseCases.addClaim),
      updateClaim: this.mapUseCase(this.accountUseCases.updateClaim, { spread: true }),
      deleteClaim: this.mapUseCase(this.accountUseCases.deleteClaim, { spread: true }),
      logout: (parent: any, args: any, context: GraphqlContext) => {
        context.clearSession()
        return null
      }
    }
  }
}

export { AccountResolvers }