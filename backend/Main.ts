import { AdminPrivilege, AdminPrivilegeNames, ApplicationConfiguration } from './domain-model/common/ApplicationConfiguration';
import { BcryptJsPasswordService } from './domain-model/services/PasswordService';
import { TotpGeneratorTotpService } from './domain-model/services/TotpService';
import { JwtTransientTokenService } from './domain-model/services/TransientTokenService';
import { SequelizeAccountsRepository } from "./repositories/AccountsRepository";
import { InMemorySqliteSequelizeInstance, PostgresSequelizeInstance, SequelizeInstance } from './repositories/common/SequelizeModels';
import { AccountUseCases, AccessToken, RefreshToken, SecondFactorSetupToken, SecondFactorToken } from "./use-cases/AccountUseCases";
import { AuthenticationTokenUtils } from './presentation/common/AuthenticationTokenUtils';
import { SelfInspectionResolvers } from './presentation/resolvers/SelfInspectionResolvers';
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
import { DeviceToken, SmartLockUseCases } from './use-cases/SmartLockUseCases';
import { SequelizeSmartLocksRepository } from './repositories/SmartLocksRepository';
import { SequelizeDeviceProfilesRepository } from './repositories/DeviceProfilesRepository';
import { NodeRsaDigitalSignatureService } from './domain-model/services/DigitalSignatureService';
import { InMemoryKeyValueService, TransientKeyValueService } from './domain-model/services/KeyValueService';
import { TypeScriptRulesEngineService } from './domain-model/services/RulesEngineService';
import { MockDeviceMessagingService } from './domain-model/services/DeviceMessagingService';
import { AuthorizationRuleResolvers } from './presentation/resolvers/AuthorizationRuleResolvers';
import { AuthorizationRuleUseCases } from './use-cases/AuthorizationRuleUseCases';
import { SequelizeAuthorizationRulesRepository } from './repositories/AuthorizationRulesRepository';
import { InMemoryDeviceRegistrationService, VerificationToken } from './domain-model/services/DeviceRegistrationService';
import express, { ErrorRequestHandler, RequestHandler } from 'express';
import { authenticator } from 'otplib'
import { createServer as createHttpServer, Server as HttpServer } from 'http';
import { createServer as createHttpsServer, Server as HttpsServer } from 'https'
import { NotImplementedError } from './common/Errors';
import { shield, rule, allow, or } from 'graphql-shield';
import { IRuleResult } from 'graphql-shield/typings/types';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { ForStatement } from 'ts-morph';

async function initInMemoryDatabase(
  claimTypeUseCases: ClaimTypeUseCases,
  accountUseCases: AccountUseCases,
  smartLockUseCases: SmartLockUseCases,
  authorizationRuleUseCases: AuthorizationRuleUseCases
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

  const bismaTotpSecret = "OZEEUWBQBBNSYLQE"
  const bismaToken = authenticator.generate(bismaTotpSecret)
  const bisma = await accountUseCases.register({ 
    username: 'firdaus_bisma', 
    password: 'fuckinghell',
    privilegeId: 2
  })
  const authenticationResult = await accountUseCases.authenticatePassword({
    username: bisma.username,
    password: 'fuckinghell'
  })
  if (!authenticationResult.secondFactorSetupToken) throw new Error("Error initializing test account: 'Bisma'.")
  await accountUseCases.setupSecondFactor({
    secondFactorSetupToken: authenticationResult.secondFactorSetupToken,
    sharedSecret: bismaTotpSecret,
    totp: bismaToken
  })

  await accountUseCases.addClaim({
    typeId: name.id,
    accountId: bisma.id,
    value: 'Firdaus Bisma'
  })
  await accountUseCases.addClaim({
    typeId: department.id,
    accountId: bisma.id,
    value: medicineOption.value
  })

  await smartLockUseCases.create({ name: 'Ruang E6' })
  await smartLockUseCases.create({ name: 'Lab Informatika' })
}

async function initDatabase(
  config: ApplicationConfiguration, 
  accountUseCases: AccountUseCases,
  privilegePresetUseCases: AdminPrivilegeUseCases
) {
  const accounts = await accountUseCases.readAll({ start: 0, count: 100000 })
  const presets = await privilegePresetUseCases.readAll({ start: 0, count: 100000 })

  if (!config.defaultAccountPassword) throw new NotImplementedError()

  if (presets.length == 0) {
    console.log('Creating default privilege presets,')
    await privilegePresetUseCases.createSystem({
      name: 'End User',
      canManageAccounts: false,
      canManageLocks: false,
      isSuperAdmin: false
    })

    await privilegePresetUseCases.createSystem({
      name: 'Administrator',
      canManageAccounts: true,
      canManageLocks: true,
      isSuperAdmin: true
    })
  }

  if (accounts.length == 0) {
    console.log('Creating default account.')
    await accountUseCases.register({ 
      username: 'admin', 
      password: config.defaultAccountPassword,
      privilegeId: 2
    })
  }
}

async function main() {
  dotenv.config()

  const DEFAULT_AUTHORIZATION_RULE = 
`class Args {
  foo: string
  bar: number[]
}

function authorize(request: SmartLock.Request, args: Args) {
  request.deny("Authorization rule not configured.")
}`

  const config = new ApplicationConfiguration(
    process.env.JWT_SIGNING_KEY ?? Math.random().toString(),
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
    process.env.SERVER_DOMAIN_NAME ?? 'localhost:4000',
    2000,
    // @ts-ignore
    process.env.NODE_ENV ?? 'development',
    process.env.TLS_PRIVATE_KEY_PATH ?? '',
    process.env.TLS_PUBLIC_CERT_PATH ?? '',
    Boolean(process.env.ENABLE_TLS_TERMINATION),
    process.env.POSTGRESQL_CONNECTION_STRING ?? null,
    process.env.DEFAULT_ADMIN_PASSWORD ?? null
  )

  let databaseInstance: SequelizeInstance | null = null
  if (config.postgresqlConnectionString) {
    console.log('Using PostgreSQL database.')
    databaseInstance = await new PostgresSequelizeInstance(config.postgresqlConnectionString).initialize()
  } else {
    console.log('Using in-memory SQLite database.')
    databaseInstance = await new InMemorySqliteSequelizeInstance().initialize()
  }
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
    databaseInstance,
    accountMapper
  )

  const claimTypesRepository = new SequelizeClaimTypesRepository(
    databaseInstance,
    claimTypeMapper
  )

  const shallowSmartLockMapper = new ShallowSmartLockMapper()
  
  const deviceMapper = new DeviceProfileMapper(shallowSmartLockMapper)
  const devicesRepository = new SequelizeDeviceProfilesRepository(
    databaseInstance,
    deviceMapper
  )

  const shallowAuthorizationRuleMapper = new ShallowAuthorizationRuleMapper()

  const smartLockMapper = new SmartLockMapper(
    deviceMapper, 
    shallowAuthorizationRuleMapper, 
    shallowSmartLockMapper
  )
  const smartLocksRepository = new SequelizeSmartLocksRepository(
    databaseInstance,
    smartLockMapper
  )

  const authorizationRuleMapper = new AuthorizationRuleMapper(
    shallowAuthorizationRuleMapper, 
    shallowSmartLockMapper
  )
  const authorizationRulesRepository = new SequelizeAuthorizationRulesRepository(
    databaseInstance,
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
      databaseInstance,
      claimInstanceMapper,
      claimTypesRepository
    )
  )

  const privilegeUseCases = new AdminPrivilegeUseCases(
    config,
    accountsRepository,
    new SequelizeAdminPrivilegePresetRepository(
      databaseInstance,
      adminPrivilegePresetMapper
    )
  )

  const claimTypeUseCases = new ClaimTypeUseCases(
    claimTypesRepository,
    new SequelizeEnumClaimTypeOptionsRepository(
      databaseInstance,
      new EnumClaimTypeOptionsMapper()
    )
  )

  const verificationTokenService = new JwtTransientTokenService<VerificationToken>(
    config, 
    "VerificationToken", 
    { singleUse: true, lifetime: 300000 }
  )
  const deviceTokenService = new JwtTransientTokenService<DeviceToken>(config, "DeviceToken")

  const deviceRegistrationService = new InMemoryDeviceRegistrationService(
    5 * 60 * 1000,
    verificationTokenService
  )

  const smartLockUseCases = new SmartLockUseCases(
    smartLocksRepository,
    devicesRepository,
    accountsRepository,
    new NodeRsaDigitalSignatureService(),
    deviceProfileStatusStore,
    lockStatusStore,
    rulesEngineService,
    deviceMessagingService,
    verificationTokenService,
    deviceTokenService,
    config,
    deviceRegistrationService
  )

  const authorizationRuleUseCases = new AuthorizationRuleUseCases(
    config,
    authorizationRulesRepository,
    claimTypesRepository,
    smartLocksRepository,
    rulesEngineService
  )

  const authenticationTokenUtils = new AuthenticationTokenUtils()

  if (!config.postgresqlConnectionString) {
    await initInMemoryDatabase(claimTypeUseCases, accountUseCases, smartLockUseCases, authorizationRuleUseCases)
  } else {
    await initDatabase(config, accountUseCases, privilegeUseCases)
  }

  const expressApp = express()
  let httpServer: HttpServer | HttpsServer | null = null
  if (config.enableTlsTermination) {
    httpServer = createHttpsServer({
      key: readFileSync(config.tlsPrivateKeyPath),
      cert: readFileSync(config.tlsPublicCertPath),
    }, expressApp)
  } else {
    httpServer = createHttpServer(expressApp)
  }

  // TODO: Clean up these endpoints.
  const wrapAsyncHandler = (handle: RequestHandler) => (req: any, res: any, next: any) => {
    return Promise
      .resolve(handle(req, res, next))
      .catch(next);
  }

  expressApp.use(express.json())
  // @ts-ignore
  expressApp.use(cookieParser())

  if (config.environment == 'development') {
    expressApp.use(cors({
      credentials: true,
      origin: ['http://localhost:3000', 'https://studio.apollographql.com']
    }))

    console.log('CORS options set for a development environment.')
  }

  expressApp.use(wrapAsyncHandler(async (req, res, next) => {
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

        const isApolloStudio = config.environment == 'development' && req.headers.origin == 'https://studio.apollographql.com'

        res.cookie('authorization', authenticationToken, {
          httpOnly: true,
          secure: config.environment == 'production' || isApolloStudio,
          expires: new Date(now.getTime() + offset),
          sameSite: config.environment == 'development' ? (isApolloStudio ? 'none' : 'lax') : 'strict'
        })
      } catch(err) {
        console.error('An authorization error has occured.')
        console.error(err)
        res.clearCookie('authorization')
        await next()
        return
      }
    }

    req["accessToken"] = accessToken

    await next()
  }))

  expressApp.post('/devices/propose', wrapAsyncHandler(async (req, res) => {
    const { macAddress } = req.body

    const result = await smartLockUseCases.propose(macAddress)

    res.status(200).json(result)
  }))

  expressApp.get('/devices/:id/proposal-status', wrapAsyncHandler(async (req, res) => {
    const { id } = req.params

    const status = await deviceRegistrationService.waitForVerificationStatus(id)

    res.status(200).send(status)
  }))

  expressApp.post('/auth/get-device-token', wrapAsyncHandler(async (req, res) => {
    const { verificationToken } = req.body

    const deviceToken = await smartLockUseCases.getDeviceToken(verificationToken)

    res.send(deviceToken)
  }))

  const authorizeDevice = async (authorization: string | undefined, deviceId: string) => {
    if (!authorization) throw new NotImplementedError()

    const [_, deviceToken] = authorization.split(' ')
    const { deviceId: tokenDeviceId } = await deviceTokenService.decodeToken(deviceToken)

    if (tokenDeviceId != deviceId) throw new NotImplementedError()
  }

  expressApp.get('/health', wrapAsyncHandler(async (req, res) => {
    res.send('Everything\'s fine.')
  }))

  expressApp.get('/devices/:id/messages/subscribe', wrapAsyncHandler(async (req, res) => {
    const { id } = req.params
    const { authorization } = req.headers
    await authorizeDevice(authorization, id)

    const message = await deviceMessagingService.waitForMessage(id)

    res.status(200).setHeader('Content-Type', 'text/plain').send(message)
  }))

  expressApp.get('/devices/:id/sync-command', wrapAsyncHandler(async (req, res) => {
    const { id } = req.params
    const { authorization } = req.headers
    await authorizeDevice(authorization, id)

    const command = await smartLockUseCases.syncCommand(id)

    res.status(200).setHeader('Content-Type', 'text/plain').send(command)
  }))

  expressApp.post('/devices/:id/ping', wrapAsyncHandler(async (req, res) => {
    const { id } = req.params
    const { authorization } = req.headers
    await authorizeDevice(authorization, id)

    smartLockUseCases.ping(id)

    console.log(`Ping received from ${id}.`)

    res.sendStatus(200)
  }))

  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.log('An unhandled error occured!')
    console.log(err)
    res.sendStatus(500)
  }

  expressApp.use(errorHandler)

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
      smartLocks: isAuthenticated
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
    SmartLock: isAuthenticated,
    TotpUtilities: {
      generateSecret: allow
    },
    ExecutionResult: isAuthenticated
  }, { fallbackRule: isSuperAdmin })

  const apolloServer = await new ApolloGraphqlServer(
    [
      new SequelizeReadResolvers(databaseInstance),
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
}

main()