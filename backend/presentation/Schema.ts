import { ApolloServer, gql } from 'apollo-server'

const typeDefs = gql`
  type AdminPrivilegePreset {
    id: ID
    name: String
    system: Boolean
    canManageAccounts: Boolean
    canManageLocks: Boolean
    accounts: [Account]
  }

  type Account {
    id: ID
    username: String
    adminPrivilegePreset: AdminPrivilegePreset
  }

  type Query {
    accounts: [Account]
  }

  type Mutation {
    createAccount: Account
  }
`

export { typeDefs }