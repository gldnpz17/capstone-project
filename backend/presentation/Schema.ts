import { ApolloServer, gql } from 'apollo-server'

const collectionArgs = (keyParams: { keyType?: 'String' | 'Int' | undefined, name?: String } = { keyType: 'Int', name: 'Id' }) => 
  `${keyParams?.name ?? 'id'}: ${keyParams?.keyType ?? 'Int'}, where: String, limit: Int`

const typeDefs = gql`
  enum ConnectionStatus {
    connected
    disconnected
  }

  type DeviceProfile {
    id: Int
    publicKey: String
    macAddress: String
    verified: Boolean
    connectionStatus: ConnectionStatus
    smartLock: SmartLock
  }

  enum LockStatus {
    locked
    unlocked
  }

  type SmartLock {
    id: String
    name: String
    wifiSsid: String
    wifiPassword: String
    lockStatus: LockStatus
    device: DeviceProfile
    authorizationRuleInstance: AuthorizationRuleInstance
  }

  type EnumClaimTypeOption {
    id: Int
    value: String
    type: ClaimType
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

  type AuthorizationRule {
    id: ID!
    savedRule: String
    deployedRule: String
    savedFormSchema: String
    deployedFormSchema: String
    hasPendingChanges: Boolean
    instances: [AuthorizationRuleInstance]
  }

  type AuthorizationRuleInstance {
    id: ID!
    argsValue: String
    authorizationRule: AuthorizationRule
    smartLock: SmartLock
  }

  type PasswordAuthenticationResult {
    secondFactorToken: String
    secondFactorSetupToken: String
  }

  type SecondFactorAuthenticationResult {
    refreshToken: String
  }

  type TotpUtilities {
    generateSecret: String
  }

  type ExecutionResult {
    authorized: Boolean,
    logMessages: [String]
    denyMessage: String
    errorMessage: String
  }

  type Query {
    totp: TotpUtilities
    accounts(${collectionArgs({ keyType: 'String' })}): [Account]
    adminPrivilegePresets: [AdminPrivilegePreset]
    claimTypes(${collectionArgs({ keyType: 'Int' })}): [ClaimType]
    smartLocks(${collectionArgs({ keyType: 'String' })}): [SmartLock]
    deviceProfiles(${collectionArgs({ keyType: 'Int' })}): [DeviceProfile]
    authorizationRules(${collectionArgs({ keyType: 'Int' })}): [AuthorizationRule]
    authorizationRuleInstances(${collectionArgs({ keyType: 'Int' })}): [AuthorizationRuleInstance]
  }

  enum CLAIM_TYPE_DATA_TYPE {
    string
    number
    boolean
    enum
  }

  input UpdateSmartLockInput {
    name: String!
    wifiSsid: String
    wifiPassword: String
  }

  input ClaimInput {
    typeId: Int
    value: String
  }

  type Mutation {
    # Accounts
    registerAccount(username: String, password: String, privilegeId: Int): Account
    setupSecondFactor(secondFactorSetupToken: String, sharedSecret: String, totp: String): SecondFactorAuthenticationResult
    deleteAccount(id: ID): Account
    # Claims
    addClaimToAccount(accountId: String, typeId: Int, value: String): ClaimInstance
    updateClaim(id: Int, value: String): ClaimInstance
    deleteClaim(id: Int): ClaimInstance
    # Auth
    authenticatePassword(username: String, password: String): PasswordAuthenticationResult
    authenticateSecondFactor(secondFactorToken: String, totp: String): SecondFactorAuthenticationResult
    # Claim Types
    createClaimType(name: String, dataType: CLAIM_TYPE_DATA_TYPE, options: [String]): ClaimType
    deleteClaimType(id: Int): ClaimType,
    addEnumClaimTypeOption(claimTypeId: Int, value: String): EnumClaimTypeOption
    deleteEnumClaimTypeOption(id: Int): EnumClaimTypeOption
    # Smart Locks
    createSmartLock(name: String!, wifiSsid: String, wifiPassword: String): SmartLock
    updateSmartLock(id: ID!, instance: UpdateSmartLockInput): SmartLock
    deleteSmartLock(id: ID!): SmartLock
    connectSmartLock(id: ID!): DeviceProfile
    confirmDevice(deviceId: ID!, macAddress: String): DeviceProfile
    pingDevice(id: ID!): Boolean
    # Authorization Rules
    createAuthorizationRule: AuthorizationRule
    saveAuthorizationRuleChanges(id: ID!, authorizationRule: String): Boolean
    deployAuthorizationRule(id: ID!): Boolean
    deleteAuthorizationRule(id: ID!): Boolean
    testAuthorizationRule(id: ID!, args: String, claims: [ClaimInput]): ExecutionResult
  }
`

export { typeDefs }