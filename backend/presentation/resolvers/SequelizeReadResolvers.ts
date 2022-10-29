import { BelongsTo, HasMany } from "sequelize"
import { SequelizeInstance } from "../../repositories/common/SequelizeModels"
import { ResolversBase } from "./common/ResolversBase"

const graphqlSequelize = require('graphql-sequelize')
const resolver: any = graphqlSequelize.resolver

class SequelizeReadResolvers extends ResolversBase {
  constructor(private db: SequelizeInstance) { super() }

  private getResolver(entity: any, list: boolean = true): Function {
    return resolver(entity, { list })
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

  private getAssociationResolvers(modelName: string): object {
    return this.db
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

  private getModelTypeResolvers(modelNameObject: object): object {
    const resolvers: any = {}
    for (const key in modelNameObject) {
      const modelName = modelNameObject[key]
      resolvers[modelName] = this.getAssociationResolvers(modelName)
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
    const { claimInstance, ...otherModelNames } = SequelizeInstance.modelNames

    return ({
      ...this.getModelTypeResolvers(otherModelNames),
      [claimInstance]: {
        ...this.getAssociationResolvers(claimInstance),
        value: (parent: any) => {
          if (parent.value) return parent.value

          const valueTypes = ['string', 'boolean', 'number', 'enum']
          const values = valueTypes.map(valueType => parent[`${valueType}Value`])
          return values.find(value => value != null)
        }
      }
    })
  }
}

export { SequelizeReadResolvers }