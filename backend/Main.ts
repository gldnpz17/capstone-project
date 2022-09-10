import { Sequelize } from 'sequelize'
import { AdminPrivilege, AdminPrivilegeNames, ApplicationConfiguration } from './domain-model/common/ApplicationConfiguration';
import { BcryptJsPasswordService } from './domain-model/services/PasswordService';
import { TotpGeneratorTotpService } from './domain-model/services/TotpService';
import { JwtTransientTokenService } from './domain-model/services/TransientTokenService';
import { SequelizeAccountsRepository } from "./repositories/AccountsRepository";
import { SequelizeGenericCrud } from './repositories/common/GenericCrud';
import { InMemorySqliteSequelizeInstance } from './repositories/common/SequelizeModels';
import { SequelizeTotpCredentialsRepository } from './repositories/TotpCredentialsRepository';
import { AccountUseCases, AuthenticationToken, SecondFactorToken } from "./use-cases/AccountUseCases";
import { authenticator } from 'otplib'
import { AccountMapper, AdminPrivilegePresetMapper, ClaimInstanceMapper, ClaimTypeMapper, EnumClaimTypeOptionsMapper, PasswordCredentialMapper, TotpCredentialMapper } from './repositories/common/RepositoryMapper';
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

async function testAccounts(useCase: AccountUseCases) {
  const aliceTotpSecret = useCase.getTotpSecret()
  const bobTotpSecret = useCase.getTotpSecret()

  const aliceToken = authenticator.generate(aliceTotpSecret)
  const bobToken = authenticator.generate(bobTotpSecret)

  const alice = await useCase.register({ 
    username: 'alice123', 
    password: 'hunter02', 
    totpSharedSecret: aliceTotpSecret,
    verificationTotp: aliceToken,
    privilegeId: 1
  })
  const bob = await useCase.register({ 
    username: 'bob456', 
    password: 'password123',
    totpSharedSecret: bobTotpSecret,
    verificationTotp: bobToken,
    privilegeId: 1
  })

  console.log('bob id :', bob.id)

  const accounts = await useCase.readAll({ start: 0 })

  console.log('accounts :', accounts)

  const aliceQueried = await useCase.readById(alice.id)

  console.log('alice queried :', aliceQueried)

  const deletedBob = await useCase.delete(bob.id)
  const accountsRequery = await useCase.readAll({})

  console.log('deleted bob :', deletedBob)
  console.log('accounts requery :', accountsRequery)

  const firstFactorResult = await useCase.authenticatePassword({ username: 'alice123', password: 'hunter02' })
  console.log('First factor result : ', firstFactorResult)

  const aliceNewToken = authenticator.generate(aliceTotpSecret)
  const secondFactorResult = await useCase.authenticateSecondFactor({ 
    secondFactorToken: firstFactorResult.secondFactorToken, 
    totp: aliceNewToken 
  })

  console.log('Second factor result :', secondFactorResult)
}

async function testPrivileges(useCases: AdminPrivilegeUseCases, accountUseCases: AccountUseCases) {
  console.log('Available privileges : ', useCases.readAvailablePrivileges())

  console.log('Preset A :', await useCases.create({ name: 'Preset A', canManageAccounts: true, canManageLocks: true }))
  console.log('Preset B :', await useCases.create({ name: 'Preset B', canManageAccounts: false, canManageLocks: true }))

  console.log('Read by ID :', await useCases.readById(1))
  console.log('Read All :', await useCases.readAll({}))

  const aliceSecret = accountUseCases.getTotpSecret()
  const aliceToken = authenticator.generate(aliceSecret)
  const alice = await accountUseCases.register({
    username: 'alice',
    password: 'hunter02',
    totpSharedSecret: aliceSecret,
    verificationTotp: aliceToken,
    privilegeId: 4
  })

  console.log('Alice privilege before :', await useCases.readByAccountId(alice.id))

  console.log('Updated B :', await useCases.update(4, { canManageAccounts: false, canManageLocks: false }))

  console.log('Deleted B :', await useCases.delete(4))
  console.log('Read All :', await useCases.readAll({}))

  console.log('Alice privilege after :', await useCases.readByAccountId(alice.id))
}

async function testClaims(claimTypeUseCases: ClaimTypeUseCases, accountUseCases: AccountUseCases) {
  const aliceTotpSecret = accountUseCases.getTotpSecret()
  const aliceToken = authenticator.generate(aliceTotpSecret)
  const alice = await accountUseCases.register({ 
    username: 'alice123', 
    password: 'hunter02', 
    totpSharedSecret: aliceTotpSecret,
    verificationTotp: aliceToken,
    privilegeId: 2
  })

  const name = await claimTypeUseCases.create({ name: 'Name', dataType: 'string' })
  const department = await claimTypeUseCases.create({ name: 'Department', dataType: 'enum' })

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

  console.log('All claim types :', await claimTypeUseCases.readAll({}))
  console.log('Department options :', await claimTypeUseCases.readAllEnumClaimTypeOptions(department.id))

  await claimTypeUseCases.delete(department.id)

  console.log('All alice claims :', await accountUseCases.readByIdIncludeClaims(alice.id))
}

async function main() {
  const config = new ApplicationConfiguration(
    'loremipsum',
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
    ]
  )

  const inMemoryDb = await new InMemorySqliteSequelizeInstance().initialize()

  const claimInstanceMapper = new ClaimInstanceMapper()
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
    new ClaimTypeMapper()
  )

  const accountUseCases = new AccountUseCases(
    accountsRepository,
    new BcryptJsPasswordService(),
    new TotpGeneratorTotpService(),
    new JwtTransientTokenService<SecondFactorToken>(config, "SecondFactorToken"),
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

  const name = await claimTypeUseCases.create({ name: 'Name', dataType: 'string' })
  const department = await claimTypeUseCases.create({ name: 'Department', dataType: 'enum' })

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

  const aliceTotpSecret = accountUseCases.getTotpSecret()
  const aliceToken = authenticator.generate(aliceTotpSecret)
  const alice = await accountUseCases.register({ 
    username: 'alice123', 
    password: 'hunter02', 
    totpSharedSecret: aliceTotpSecret,
    verificationTotp: aliceToken,
    privilegeId: 2
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

  await new ApolloGraphqlServer(
    [
      new SequelizeReadResolvers(inMemoryDb),
      new AccountResolvers(inMemoryDb)
    ],
    typeDefs
  )
  .start()
}

main()