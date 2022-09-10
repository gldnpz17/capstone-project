import { BelongsTo, HasMany } from "sequelize"
import { SequelizeInstance } from "../../repositories/common/SequelizeModels"
import { ResolversBase } from "./AccountResolvers"

const graphqlSequelize = require('graphql-sequelize')
const resolver: any = graphqlSequelize.resolver

class SequelizeReadResolvers extends ResolversBase {
  constructor(private db: SequelizeInstance) { super() }

  private getResolver(entity: any, list: boolean = true): Function {
    return resolver(entity, {
      list
    })
  }

  private formatModelName(name: string): string {
    return name.charAt(0).toLowerCase() + name.slice(1) + 's'
  }

  private getModelResolvers(modelNameObject: any): object {
    const resolvers: any = {}
    for (const key in modelNameObject) {
      const modelName = modelNameObject[key]
      resolvers[this.formatModelName(modelName)] = this.getResolver(this.db.getModel(modelName))
    }

    return resolvers
  }

  private getAssociationResolvers(modelNameObject: any): object {
    const resolvers: any = {}
    for (const key in modelNameObject) {
      const modelName = modelNameObject[key]
      resolvers[modelName] = this.db
        .getAssociations(modelName)
        .map(({ propertyName, association }) => ({
          property: propertyName,
          resolver: this.getResolver(association, association instanceof HasMany) 
        }))
        .reduce((obj: any, { property, resolver }) => ({
          ...obj,
          [property]: resolver
        }), {})
    }

    return resolvers
  }

  override getQueryResolvers(): object {
    const { account, claimInstance, enumClaimTypeOption, ...restModelNames } = SequelizeInstance.modelNames

    return ({
      ...this.getModelResolvers(restModelNames),
      accounts: this.getResolver(this.db.getModel(SequelizeInstance.modelNames.account)),
    })
  }

  override getTypeResolvers(): object {
    const { account, adminPrivilegePreset, claimType, claimInstance } = SequelizeInstance.modelNames

    return ({
      ...this.getAssociationResolvers({ account, adminPrivilegePreset, claimType, claimInstance }),
    })
  }
}

export { SequelizeReadResolvers }