import { ApolloServer } from 'apollo-server'
import { DocumentNode } from 'graphql'
import { ResolversBase } from './resolvers/AccountResolvers'

class ApolloGraphqlServer {
  constructor(
    private resolvers: ResolversBase[],
    private typeDefs: DocumentNode
  ) { }

  private spreadResolvers = (extract: (resolvers: ResolversBase) => object) => {
    return this.resolvers
      .map(resolvers => extract(resolvers))
      .reduce((obj, resolvers) => ({ ...obj, ...resolvers }), {})
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