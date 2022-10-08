import { ApolloServer, gql } from 'apollo-server'

const collectionArgs = (keyParams: { type?: 'String' | 'Int' | undefined, name?: String } = { type: 'Int', name: 'Id' }) => 
  `${keyParams?.name ?? 'id'}: ${keyParams?.type ?? 'Int'}, where: String, limit: Int`

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
    value: String
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
    accounts(${collectionArgs({ type: 'String' })}): [Account]
    adminPrivilegePresets: [AdminPrivilegePreset]
    claimTypes: [ClaimType]
  }

  type Mutation {
    registerAccount(username: String, password: String, privilegeId: Int): Account
    addClaimToAccount(accountId: String, typeId: Int, value: String): ClaimInstance
    updateClaim(id: Int, value: String): ClaimInstance
    deleteClaim(id: Int): ClaimInstance
    authenticatePassword(username: String, password: String): PasswordAuthenticationResult
    authenticateSecondFactor(secondFactorToken: String, totp: String): SecondFactorAuthenticationResult
  }
`

export { typeDefs }