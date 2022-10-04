import { SequelizeInstance } from '../../repositories/common/SequelizeModels';
import { AccountUseCases } from '../../use-cases/AccountUseCases';
import { ResolversBase } from './common/ResolversBase';

class AccountResolvers extends ResolversBase {
  constructor( 
    private accountUseCases: AccountUseCases
  ) { super() }

  override getMutationResolvers(): object {
    return {
      authenticatePassword: async (_: any, args: { username: string, password: string }) => {
        return await this.accountUseCases.authenticatePassword(args)
      },
      authenticateSecondFactor: async (_: any, args: { secondFactorToken: string, totp: string }) => {
        return await this.accountUseCases.authenticateSecondFactor(args)
      }
    }
  }
}

export { ResolversBase, AccountResolvers }