import { SequelizeInstance } from '../../repositories/common/SequelizeModels';
import { ResolversBase } from './common/ResolversBase';

class AccountResolvers extends ResolversBase {
  constructor(private db: SequelizeInstance) { super() }

  override getMutationResolvers(): object {
    return {
      createAccount: () => {}
    }
  }
}

export { ResolversBase, AccountResolvers }