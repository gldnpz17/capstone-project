import { ApolloServer, gql } from 'apollo-server'

const typeDefs = gql`
  type EnumClaimTypeOption {
    id: Int
    value: String
  }

  type ClaimType {
    id: Int
    name: String
    dataType: String
    options: [EnumClaimTypeOption]
    claims: [ClaimInstance]
  }

  type ClaimInstance {
    id: Int
    type: ClaimType
    account: Account
  }

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
    privilegePreset: AdminPrivilegePreset
    claims: [ClaimInstance]
  }

  type PasswordAuthenticationResult {
    secondFactorToken: String
  }

  type SecondFactorAuthenticationResult {
    refreshToken: String
  }

  type TotpUtilities {
    generateSecret: String
  }

  type Query {
    totp: TotpUtilities
    accounts: [Account]
    adminPrivilegePresets: [AdminPrivilegePreset]
    claimTypes: [ClaimType]
  }

  type Mutation {
    authenticatePassword(username: String, password: String): PasswordAuthenticationResult
    authenticateSecondFactor(secondFactorToken: String, totp: String): SecondFactorAuthenticationResult
  }
`

export { typeDefs }