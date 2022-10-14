import { AccountUseCases } from "../../use-cases/AccountUseCases";
import { ResolversBase } from "./common/ResolversBase";

class TotpUtilitiesResolvers extends ResolversBase {
  constructor(
    private accountUseCases: AccountUseCases
  ) { super() }

  override getQueryResolvers(): object {
    return {
      totp: async () => ({
        generateSecret: async () => this.accountUseCases.getTotpSecret()
      })
    }
  }
}

export { TotpUtilitiesResolvers }