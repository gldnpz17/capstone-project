import { AdminPrivilege, AdminPrivilegeNames, ApplicationConfiguration } from './domain-model/common/ApplicationConfiguration';
import { BcryptJsPasswordService } from './domain-model/services/PasswordService';
import { TotpGeneratorTotpService } from './domain-model/services/TotpService';
import { JwtTransientTokenService } from './domain-model/services/TransientTokenService';
import { SequelizeAccountsRepository } from "./repositories/AccountsRepository";
import { InMemorySqliteSequelizeInstance } from './repositories/common/SequelizeModels';
import { AccountUseCases, AuthenticationToken, SecondFactorSetupToken, SecondFactorToken } from "./use-cases/AccountUseCases";
import { authenticator } from 'otplib'
import { AccountMapper, AdminPrivilegePresetMapper, ClaimInstanceMapper, ClaimTypeMapper, EnumClaimTypeOptionsMapper, PasswordCredentialMapper, TotpCredentialMapper, SmartLockMapper, DeviceProfileMapper, AuthorizationRuleMapper } from './repositories/common/RepositoryMapper';
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
import { SmartLockUseCases } from './use-cases/SmartLockUseCases';
import { SequelizeSmartLocksRepository } from './repositories/SmartLocksRepository';
import { SequelizeDeviceProfilesRepository } from './repositories/DeviceProfilesRepository';
import { NodeRsaDigitalSignatureService } from './domain-model/services/DigitalSignatureService';
import { InMemoryKeyValueService, TransientKeyValueService } from './domain-model/services/KeyValueService';
import { TypeScriptRulesEngineService } from './domain-model/services/RulesEngineService';
import { MockDeviceMessagingService } from './domain-model/services/DeviceMessagingService';
import { AuthorizationRuleResolvers } from './presentation/resolvers/AuthorizationRuleResolvers';
import { AuthorizationRuleUseCases } from './use-cases/AuthorizationRuleUseCases';
import { SequelizeAuthorizationRulesRepository } from './repositories/AuthorizationRulesRepository';

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

function authorize(args: Args) {

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
    DEFAULT_AUTHORIZATION_RULE
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

  const smartLockMapper = new SmartLockMapper(deviceMapper)
  const smartLocksRepository = new SequelizeSmartLocksRepository(
    inMemoryDb,
    smartLockMapper
  )

  const authorizationRuleMapper = new AuthorizationRuleMapper()
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

  const smartLockUseCases = new SmartLockUseCases(
    smartLocksRepository,
    devicesRepository,
    new NodeRsaDigitalSignatureService(),
    deviceProfileStatusStore,
    lockStatusStore,
    rulesEngineService,
    deviceMessagingService
  )

  const authorizationRuleUseCases = new AuthorizationRuleUseCases(
    config,
    authorizationRulesRepository,
    claimTypesRepository,
    rulesEngineService
  )

  await initDatabase(claimTypeUseCases, accountUseCases)

  await new ApolloGraphqlServer(
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
}

main()