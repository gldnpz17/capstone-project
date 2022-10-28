import { ApolloServer } from 'apollo-server'
import { DocumentNode } from 'graphql'
import { ResolversBase } from './resolvers/common/ResolversBase'

class ApolloGraphqlServer {
  constructor(
    private resolvers: ResolversBase[],
    private typeDefs: DocumentNode
  ) { }

  private spreadResolvers = (extract: (resolvers: ResolversBase) => object) => {
    return this.resolvers
      .map(resolvers => extract(resolvers))
      .reduce((obj, resolvers) => {
        for (const resolverTypeName in resolvers) {
          // Combine type resolvers.
          if (obj[resolverTypeName]) {
            resolvers[resolverTypeName] = {
              ...obj[resolverTypeName],
              ...resolvers[resolverTypeName]
            }
          }
        }

        return (({ ...obj, ...resolvers }))
      }, {})
  }

  async start() {
    const server = new ApolloServer({
      typeDefs: this.typeDefs,
      resolvers: {
        Query: {
          ...this.spreadResolvers(resolvers => resolvers.getQueryResolvers())
        },
        Mutation: {
          ...this.spreadResolvers(resolvers => resolvers.getMutationResolvers())
        },
        ...this.spreadResolvers(resolvers => resolvers.getTypeResolvers())
      }
    })

    const { url } = await server.listen()

    console.log(`Server running and is accesible from ${url}.`)
  }
}

export { ApolloGraphqlServer }