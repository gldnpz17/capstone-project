import { AdminPrivilege, AdminPrivilegeNames, ApplicationConfiguration } from './domain-model/common/ApplicationConfiguration';
import { BcryptJsPasswordService } from './domain-model/services/PasswordService';
import { TotpGeneratorTotpService } from './domain-model/services/TotpService';
import { JwtTransientTokenService } from './domain-model/services/TransientTokenService';
import { SequelizeAccountsRepository } from "./repositories/AccountsRepository";
import { InMemorySqliteSequelizeInstance } from './repositories/common/SequelizeModels';
import { AccountUseCases, AuthenticationToken, SecondFactorSetupToken, SecondFactorToken } from "./use-cases/AccountUseCases";
import { authenticator } from 'otplib'
import { AccountMapper, AdminPrivilegePresetMapper, ClaimInstanceMapper, ClaimTypeMapper, EnumClaimTypeOptionsMapper, PasswordCredentialMapper, TotpCredentialMapper, SmartLockMapper, DeviceProfileMapper, AuthorizationRuleMapper, ShallowSmartLockMapper, ShallowAuthorizationRuleMapper } from './repositories/common/RepositoryMapper';
import { AdminPrivilegeUseCases } from './use-cases/AdminPrivilegeUseCases';
import { SequelizeAdminPrivilegePresetRepository } from './repositories/AdminPrivilegePresetRepository';
import { ClaimTypeUseCases } from './use-cases/ClaimTypeUseCases';
import { SequelizeClaimTypesRepository } from './repositories/ClaimTypeRepository';
import { SequelizeEnumClaimTypeOptionsRepository } from './repositories/EnumClaimTypeOptionsRepository';
import { SequelizeClaimInstancesRepository } from './repositories/ClaimInstancesRepository';
import { ApolloGraphqlServer } from './presentation/Server';
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
import { NotImplementedError } from './common/Errors';
import morgan from 'morgan'
import bodyParser from 'body-parser';

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
    'somesecret',
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
    2000
  )

  const inMemoryDb = await new InMemorySqliteSequelizeInstance().initialize()
  const deviceProfileStatusStore = new TransientKeyValueService(5000)
  const lockStatusStore = new InMemoryKeyValueService({ default: 'locked' })
  const rulesEngineService = new TypeScriptRulesEngineService()
  const deviceMessagingService = new MockDeviceMessagingService()

  const claimTypeMapper = new ClaimTypeMapper()
  const claimInstanceMapper = new ClaimInstanceMapper(claimTypeMapper)
  const accountMapper = new AccountMapper(
    new PasswordCredentialMapper(), 
    new TotpCredentialMapper(),
    claimInstanceMapper
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

  const accountUseCases = new AccountUseCases(
    accountsRepository,
    new BcryptJsPasswordService(),
    new TotpGeneratorTotpService(),
    new JwtTransientTokenService<SecondFactorToken>(config, "SecondFactorToken"),
    new JwtTransientTokenService<SecondFactorSetupToken>(config, "SecondFactorSetupToken"),
    new JwtTransientTokenService<AuthenticationToken>(config, "AuthenticationToken"),
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
      new AdminPrivilegePresetMapper(accountMapper)
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

  await initDatabase(claimTypeUseCases, accountUseCases)

  const expressApp = express()
  const httpServer = createServer(expressApp)

  /*expressApp.use(express.text({ type: 'text/test' }))
  expressApp.use((req, res, next) => {
    console.log('Body : ', req.body)
    next()
  })*/
  expressApp.use(express.json())

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

  const apolloServer = await new ApolloGraphqlServer(
    [
      new SequelizeReadResolvers(inMemoryDb),
      new AccountResolvers(accountUseCases),
      new ClaimTypeResolvers(claimTypeUseCases),
      new TotpUtilitiesResolvers(accountUseCases),
      new SmartLockResolvers(smartLockUseCases, deviceProfileStatusStore),
      new AuthorizationRuleResolvers(authorizationRuleUseCases)
    ],
    typeDefs
  )
  .start()

  apolloServer.applyMiddleware({ app: expressApp })

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