import { AdminPrivilege, AdminPrivilegeNames, ApplicationConfiguration } from './domain-model/common/ApplicationConfiguration';
import { BcryptJsPasswordService } from './domain-model/services/PasswordService';
import { TotpGeneratorTotpService } from './domain-model/services/TotpService';
import { JwtTransientTokenService } from './domain-model/services/TransientTokenService';
import { SequelizeAccountsRepository } from "./repositories/AccountsRepository";
import { InMemorySqliteSequelizeInstance } from './repositories/common/SequelizeModels';
import { AccountUseCases, AccessToken, RefreshToken, SecondFactorSetupToken, SecondFactorToken } from "./use-cases/AccountUseCases";
import { authenticator } from 'otplib'
import { AccountMapper, AdminPrivilegePresetMapper, ClaimInstanceMapper, ClaimTypeMapper, EnumClaimTypeOptionsMapper, PasswordCredentialMapper, TotpCredentialMapper, SmartLockMapper, DeviceProfileMapper, AuthorizationRuleMapper, ShallowSmartLockMapper, ShallowAuthorizationRuleMapper, ShallowAccountMapper } from './repositories/common/RepositoryMapper';
import { AdminPrivilegeUseCases } from './use-cases/AdminPrivilegeUseCases';
import { SequelizeAdminPrivilegePresetRepository } from './repositories/AdminPrivilegePresetRepository';
import { ClaimTypeUseCases } from './use-cases/ClaimTypeUseCases';
import { SequelizeClaimTypesRepository } from './repositories/ClaimTypeRepository';
import { SequelizeEnumClaimTypeOptionsRepository } from './repositories/EnumClaimTypeOptionsRepository';
import { SequelizeClaimInstancesRepository } from './repositories/ClaimInstancesRepository';
import { ApolloGraphqlServer, GraphqlContext } from './presentation/Server';
import { AccountResolvers } from './presentation/resolvers/AccountResolvers';
import { typeDefs } from './presentation/Schema';
import { SequelizeReadResolvers } from './presentation/resolvers/SequelizeReadResolvers';
import { TotpUtilitiesResolvers } from './presentation/resolvers/TotpUtilitiesResolvers';
import { ClaimTypeResolvers } from './presentation/resolvers/ClaimTypeResolvers';
import { SmartLockResolvers } from './presentation/resolvers/SmartLockResolvers';
import { ConfirmationToken, DeviceToken, SmartLockUseCases } from './use-cases/SmartLockUseCases';
import { SequelizeSmartLocksRepository } from './repositories/SmartLocksRepository';
import { SequelizeDeviceProfilesRepository } from './repositories/DeviceProfilesRepository';
import { NodeRsaDigitalSignatureService } from './domain-model/services/DigitalSignatureService';
import { InMemoryKeyValueService, TransientKeyValueService } from './domain-model/services/KeyValueService';
import { TypeScriptRulesEngineService } from './domain-model/services/RulesEngineService';
import { MockDeviceMessagingService } from './domain-model/services/DeviceMessagingService';
import { AuthorizationRuleResolvers } from './presentation/resolvers/AuthorizationRuleResolvers';
import { AuthorizationRuleUseCases } from './use-cases/AuthorizationRuleUseCases';
import { SequelizeAuthorizationRulesRepository } from './repositories/AuthorizationRulesRepository';
import express from 'express';
import { createServer } from 'http';
import { DeviceProfile } from './domain-model/entities/DeviceProfile';
import { AuthorizationError, NotImplementedError } from './common/Errors';
import morgan from 'morgan'
import bodyParser from 'body-parser';
import { shield, rule, allow, deny, or } from 'graphql-shield';
import { IRuleResult } from 'graphql-shield/typings/types';
import { AuthenticationTokenUtils } from './presentation/common/AuthenticationTokenUtils';
import { SelfInspectionResolvers } from './presentation/resolvers/SelfInspectionResolvers';
import cors from 'cors'
import cookieParser from 'cookie-parser'

async function initDatabase(
  claimTypeUseCases: ClaimTypeUseCases,
  accountUseCases: AccountUseCases,

) {
  const name = await claimTypeUseCases.create({ name: 'Name', dataType: 'string', options: [] })
  const department = await claimTypeUseCases.create({ name: 'Department', dataType: 'enum', options: [] })
  const age = await claimTypeUseCases.create({ name: 'Age', dataType: 'number', options: [] })

  await claimTypeUseCases.addEnumClaimTypeOption({ 
    claimTypeId: department.id,
    value: 'Engineering'
  })
  await claimTypeUseCases.addEnumClaimTypeOption({ 
    claimTypeId: department.id,
    value: 'Law'
  })
  const medicineOption = await claimTypeUseCases.addEnumClaimTypeOption({ 
    claimTypeId: department.id,
    value: 'Medicine'
  })

  const aliceTotpSecret = "OZEEUWBQBBNSYLQE"
  const aliceToken = authenticator.generate(aliceTotpSecret)
  const alice = await accountUseCases.register({ 
    username: 'alice123', 
    password: 'hunter02',
    privilegeId: 2
  })
  const authenticationResult = await accountUseCases.authenticatePassword({
    username: alice.username,
    password: 'hunter02'
  })
  if (!authenticationResult.secondFactorSetupToken) throw new Error("Error initializing test account: 'Alice'.")
  await accountUseCases.setupSecondFactor({
    secondFactorSetupToken: authenticationResult.secondFactorSetupToken,
    sharedSecret: aliceTotpSecret,
    totp: aliceToken
  })

  const bob = await accountUseCases.register({ 
    username: 'bobbers', 
    password: 'iambob',
    privilegeId: 1
  })

  await accountUseCases.addClaim({
    typeId: name.id,
    accountId: alice.id,
    value: 'Alice Soedirman'
  })
  await accountUseCases.addClaim({
    typeId: department.id,
    accountId: alice.id,
    value: medicineOption.value
  })
  await accountUseCases.addClaim({
    typeId: age.id,
    accountId: bob.id,
    value: 23
  })

}

async function main() {
  const DEFAULT_AUTHORIZATION_RULE = 
`class Args {
  foo: string
  bar: number[]
}

function authorize(request: SmartLock.Request, args: Args) {
  request.deny("Authorization rule not configured.")
}`

  const config = new ApplicationConfiguration(
    Math.random().toString(),
    [
      new AdminPrivilege(
        AdminPrivilegeNames.canManageAccounts,
        'Can manage accounts and privileges',
        preset => preset.canManageAccounts
      ),
      new AdminPrivilege(
        AdminPrivilegeNames.canManageLocks,
        'Can manage smart locks',
        preset => preset.canManageLocks
      )
    ],
    DEFAULT_AUTHORIZATION_RULE,
    4000,
    'localhost:4000',
    2000,
    'development'
  )

  const inMemoryDb = await new InMemorySqliteSequelizeInstance().initialize()
  const deviceProfileStatusStore = new TransientKeyValueService(5000)
  const lockStatusStore = new InMemoryKeyValueService({ default: 'locked' })
  const rulesEngineService = new TypeScriptRulesEngineService()
  const deviceMessagingService = new MockDeviceMessagingService()

  const claimTypeMapper = new ClaimTypeMapper()
  const claimInstanceMapper = new ClaimInstanceMapper(claimTypeMapper)
  const shallowAccountMapper = new ShallowAccountMapper()
  const adminPrivilegePresetMapper = new AdminPrivilegePresetMapper(shallowAccountMapper)
  const accountMapper = new AccountMapper(
    shallowAccountMapper,
    new PasswordCredentialMapper(), 
    new TotpCredentialMapper(),
    claimInstanceMapper,
    adminPrivilegePresetMapper
  )
  const accountsRepository = new SequelizeAccountsRepository(
    inMemoryDb,
    accountMapper
  )

  const claimTypesRepository = new SequelizeClaimTypesRepository(
    inMemoryDb,
    claimTypeMapper
  )

  const deviceMapper = new DeviceProfileMapper()
  const devicesRepository = new SequelizeDeviceProfilesRepository(
    inMemoryDb,
    deviceMapper
  )

  const shallowSmartLockMapper = new ShallowSmartLockMapper()
  const shallowAuthorizationRuleMapper = new ShallowAuthorizationRuleMapper()

  const smartLockMapper = new SmartLockMapper(
    deviceMapper, 
    shallowAuthorizationRuleMapper, 
    shallowSmartLockMapper
  )
  const smartLocksRepository = new SequelizeSmartLocksRepository(
    inMemoryDb,
    smartLockMapper
  )

  const authorizationRuleMapper = new AuthorizationRuleMapper(
    shallowAuthorizationRuleMapper, 
    shallowSmartLockMapper
  )
  const authorizationRulesRepository = new SequelizeAuthorizationRulesRepository(
    inMemoryDb,
    authorizationRuleMapper
  )

  const accessTokenService = new JwtTransientTokenService<AccessToken>(config, "AccessToken", { lifetime: 1 * 60 * 1000 })
  const refreshTokenService = new JwtTransientTokenService<RefreshToken>(config, "RefreshToken")

  const accountUseCases = new AccountUseCases(
    accountsRepository,
    new BcryptJsPasswordService(),
    new TotpGeneratorTotpService(),
    new JwtTransientTokenService<SecondFactorToken>(config, "SecondFactorToken"),
    new JwtTransientTokenService<SecondFactorSetupToken>(config, "SecondFactorSetupToken"),
    refreshTokenService,
    accessTokenService,
    new SequelizeClaimInstancesRepository(
      inMemoryDb,
      claimInstanceMapper,
      claimTypesRepository
    )
  )

  const privilegeUseCases = new AdminPrivilegeUseCases(
    config,
    accountsRepository,
    new SequelizeAdminPrivilegePresetRepository(
      inMemoryDb,
      adminPrivilegePresetMapper
    )
  )

  const claimTypeUseCases = new ClaimTypeUseCases(
    claimTypesRepository,
    new SequelizeEnumClaimTypeOptionsRepository(
      inMemoryDb,
      new EnumClaimTypeOptionsMapper()
    )
  )

  const confirmationTokenService = new JwtTransientTokenService<ConfirmationToken>(
    config, 
    "ConfirmationToken", 
    { singleUse: true, lifetime: 300000 }
  )
  const deviceTokenService = new JwtTransientTokenService<DeviceToken>(config, "DeviceToken")

  const smartLockUseCases = new SmartLockUseCases(
    smartLocksRepository,
    devicesRepository,
    accountsRepository,
    new NodeRsaDigitalSignatureService(),
    deviceProfileStatusStore,
    lockStatusStore,
    rulesEngineService,
    deviceMessagingService,
    confirmationTokenService,
    deviceTokenService,
    config
  )

  const authorizationRuleUseCases = new AuthorizationRuleUseCases(
    config,
    authorizationRulesRepository,
    claimTypesRepository,
    smartLocksRepository,
    rulesEngineService
  )

  const authenticationTokenUtils = new AuthenticationTokenUtils()

  await initDatabase(claimTypeUseCases, accountUseCases)

  const expressApp = express()
  const httpServer = createServer(expressApp)

  // TODO: Clean up these endpoints.
  expressApp.use(express.json())
  expressApp.use(cookieParser())

  if (config.environment == 'development') {
    expressApp.use(cors({
      credentials: true,
      origin: ['http://localhost:3000', 'https://studio.apollographql.com']
    }))

    console.log('CORS options set for a development environment.')
  }

  expressApp.use(async (req, res, next) => {
    const authorizationCookie = req.cookies['authorization']

    if (!authorizationCookie) {
      await next()
      return
    }

    const { rawRefreshToken, rawAccessToken } = authenticationTokenUtils.parse(authorizationCookie)

    if (!rawRefreshToken) {
      await next()
      return
    }

    let accessToken: AccessToken | null = null
    if (!rawAccessToken) {
      accessToken = null
    } else {
      try {
        accessToken = await accessTokenService.decodeToken(rawAccessToken)
      } catch(err) {
        console.log(`Error decoding access token: ${err}`)
        accessToken = null
      }
    }

    if (!accessToken) {
      try {
        accessToken = await accountUseCases.getAccessToken(rawRefreshToken)
        const authenticationToken = authenticationTokenUtils.create(
          rawRefreshToken,
          await accessTokenService.generateToken(accessToken, token => token.account.id)
        )

        const now = new Date()
        const offset = 365 *24 * 60 * 60 * 1000

        console.log(`Refreshing the access token. New token: ${authenticationToken}`)

        res.cookie('authorization', authenticationToken, {
          httpOnly: true,
          secure: config.environment == 'production',
          expires: new Date(now.getTime() + offset),
          sameSite: config.environment == 'development' ? 'lax' : 'strict'
        })
      } catch(err) {
        console.error('An authorization error has occured.')
        console.error(err)
        res.clearCookie('authorization')
        next()
      }
    }

    req["accessToken"] = accessToken

    await next()
  })

  expressApp.post('/devices/:id/confirm', async (req, res) => {
    const { id } = req.params
    const { confirmationToken, macAddress } = req.body

    const result = await smartLockUseCases.confirmDevice({ 
      deviceId: Number.parseInt(id),
      confirmationToken,
      macAddress
    })

    res.status(200).json(result)
  })

  const authorizeDevice = async (authorization: string | undefined, deviceId: string) => {
    if (!authorization) throw new NotImplementedError()

    const [_, deviceToken] = authorization.split(' ')
    const { deviceId: tokenDeviceId } = await deviceTokenService.decodeToken(deviceToken)

    if (tokenDeviceId != Number.parseInt(deviceId)) throw new NotImplementedError()
  }

  expressApp.get('/devices/:id/messages/subscribe', async (req, res) => {
    const { id } = req.params
    const { authorization } = req.headers
    await authorizeDevice(authorization, id)

    const message = await deviceMessagingService.waitForMessage(id)

    res.status(200).send(message)
  })

  expressApp.post('/devices/:id/ping', async (req, res) => {
    const { id } = req.params
    const { authorization } = req.headers
    await authorizeDevice(authorization, id)

    smartLockUseCases.ping(Number.parseInt(id))

    res.sendStatus(200)
  })

  const isSuperAdmin = rule()(async (parent, args, ctx: GraphqlContext, info): Promise<IRuleResult> => {
    return ctx.accessToken.account.privilegePreset.isSuperAdmin
  })

  const isAuthenticated = rule()(async (parent, args, ctx: GraphqlContext, info): Promise<IRuleResult> => {
    return Boolean(ctx.accessToken.account.id)
  })

  const isAccountOwner = rule()(async (parent, args, ctx: GraphqlContext, info): Promise<IRuleResult> => {
    return args.id == ctx.accessToken.account.id
  })

  const permissions = shield({
    Query: {
      "*": isSuperAdmin,
      totp: allow,
      accounts: or(isAccountOwner, isSuperAdmin),
      inspectSelf: isAuthenticated,
    },
    Mutation: {
      "*": isSuperAdmin,
      sendCommand: isAuthenticated,
      setupSecondFactor: allow,
      authenticatePassword: allow,
      authenticateSecondFactor: allow,
      logout: allow
    },
    Account: {
      "*": isAuthenticated
    },
    AdminPrivilegePreset: {
      "*": isAuthenticated,
      accounts: isSuperAdmin
    },
    ClaimInstance: {
      "*": isAuthenticated,
      account: isSuperAdmin
    },
    SelfInspectionResult: isAuthenticated,
    AdminPrivilegePresetWithoutAccounts: isAuthenticated,
    PasswordAuthenticationResult: allow,
    SecondFactorAuthenticationResult: allow,
    TotpUtilities: {
      generateSecret: allow
    }
  }, { fallbackRule: isSuperAdmin })

  const apolloServer = await new ApolloGraphqlServer(
    [
      new SequelizeReadResolvers(inMemoryDb),
      new AccountResolvers(accountUseCases),
      new ClaimTypeResolvers(claimTypeUseCases),
      new TotpUtilitiesResolvers(accountUseCases),
      new SmartLockResolvers(smartLockUseCases, deviceProfileStatusStore),
      new AuthorizationRuleResolvers(authorizationRuleUseCases),
      new SelfInspectionResolvers()
    ],
    [permissions],
    typeDefs,
    config
  )
  .start()

  apolloServer.applyMiddleware({ app: expressApp, cors: false })

  expressApp.use((err: any, req: any, res: any, next: any) => {
    console.error('An unhandled error has occured.')
    console.error(err)
    res.status(500).send('An unhandled error occured.')
  })

  httpServer.listen(config.portNumber, () => {
    console.log(`Smart lock back end server started. Listening on port ${config.portNumber}.`)
  })

  /*setInterval(() => {
    deviceMessagingService.send(
      new DeviceProfile(1, 'sekrit', 'notsekrit', '00:B0:D0:63:C2:26', true, "connected"),
      "unlock"
    )
  }, 1000)*/
}

main()