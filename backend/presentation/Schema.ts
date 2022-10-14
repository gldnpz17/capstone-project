import { ApolloServer, gql } from 'apollo-server'

const collectionArgs = (keyParams: { keyType?: 'String' | 'Int' | undefined, name?: String } = { keyType: 'Int', name: 'Id' }) => 
  `${keyParams?.name ?? 'id'}: ${keyParams?.keyType ?? 'Int'}, where: String, limit: Int`

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
    accounts(${collectionArgs({ keyType: 'String' })}): [Account]
    adminPrivilegePresets: [AdminPrivilegePreset]
    claimTypes(${collectionArgs({ keyType: 'Int' })}): [ClaimType]
  }

  enum CLAIM_TYPE_DATA_TYPE {
    string
    number
    boolean
    enum
  }

  type Mutation {
    registerAccount(username: String, password: String, privilegeId: Int): Account
    deleteAccount(id: ID): Account
    addClaimToAccount(accountId: String, typeId: Int, value: String): ClaimInstance
    updateClaim(id: Int, value: String): ClaimInstance
    deleteClaim(id: Int): ClaimInstance
    authenticatePassword(username: String, password: String): PasswordAuthenticationResult
    authenticateSecondFactor(secondFactorToken: String, totp: String): SecondFactorAuthenticationResult
    createClaimType(name: String, dataType: CLAIM_TYPE_DATA_TYPE, options: [String]): ClaimType
    deleteClaimType(id: Int): ClaimType,
    addEnumClaimTypeOption(claimTypeId: Int, value: String): EnumClaimTypeOption
    deleteEnumClaimTypeOption(id: Int): EnumClaimTypeOption
  }
`

export { typeDefs }