const graphqlSequelize = require('graphql-sequelize')
import { SequelizeInstance } from '../../repositories/common/SequelizeModels';

const resolver: any = graphqlSequelize.resolver

abstract class ResolversBase {
  abstract getQueryResolvers(): object
  abstract getMutationResolvers(): object
}

class AccountResolvers extends ResolversBase {
  constructor(private db: SequelizeInstance) { super() }

  getQueryResolvers(): object {
    return {
      accounts: resolver(this.db.getModel(SequelizeInstance.modelNames.account), {
        list: true
      })
    }
  }

  getMutationResolvers(): object {
    return {
      createAccount: () => {}
    }
  }
}

export { ResolversBase, AccountResolvers }