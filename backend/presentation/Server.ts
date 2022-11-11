import { ApolloServer } from 'apollo-server-express'
import { DocumentNode } from 'graphql'
import { AuthorizationError } from '../common/Errors'
import { ResolversBase } from './resolvers/common/ResolversBase'
import { verify } from 'jsonwebtoken'
import { ApplicationConfiguration } from '../domain-model/common/ApplicationConfiguration'
import { TransientTokenService } from '../domain-model/services/TransientTokenService'
import { AccessToken } from '../use-cases/AccountUseCases'
import { AuthenticationTokenUtils } from './common/AuthenticationTokenUtils'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { applyMiddleware, IMiddleware, IMiddlewareGenerator } from 'graphql-middleware'

type GraphqlContext = {
  setRefreshToken: (token: string) => void
  accessToken: AccessToken
}

class ApolloGraphqlServer {
  constructor(
    private resolvers: ResolversBase[],
    private middlewares: (IMiddleware<any, any, any> | IMiddlewareGenerator<any, any, any>)[],
    private typeDefs: DocumentNode,
    private config: ApplicationConfiguration
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
    const resolvers = {
      Query: {
        ...this.spreadResolvers(resolvers => resolvers.getQueryResolvers())
      },
      Mutation: {
        ...this.spreadResolvers(resolvers => resolvers.getMutationResolvers())
      },
      ...this.spreadResolvers(resolvers => resolvers.getTypeResolvers())
    }

    const schema = makeExecutableSchema({ typeDefs: this.typeDefs, resolvers })

    const server = new ApolloServer({
      schema: applyMiddleware(schema, ...this.middlewares),
      context: async ({ req, res }): Promise<GraphqlContext> => {
        const accessToken: AccessToken = req["accessToken"]

        return {
          setRefreshToken: (token) => {
            const now = new Date()
            const offset = 365 *24 * 60 * 60 * 1000

            console.log(res.cookie)

            res.cookie("authorization", `Bearer ${token}`, {
              httpOnly: true,
              secure: this.config.environment == 'production',
              expires: new Date(now.getTime() + offset),
              sameSite: this.config.environment == 'development' ? 'lax' : 'strict'
            })
          },
          accessToken
        }
      }
    })

    await server.start()

    return server
  }
}

export { ApolloGraphqlServer, GraphqlContext }