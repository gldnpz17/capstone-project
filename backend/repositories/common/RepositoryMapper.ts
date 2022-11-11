import { NotImplementedError } from "../../common/Errors";
import { Account } from "../../domain-model/entities/Account";
import { AdminPrivilegePreset } from "../../domain-model/entities/AdminPrivilegePreset";
import { AuthorizationRule } from "../../domain-model/entities/AuthorizationRule";
import { BooleanClaim, ClaimInstance, ClaimInstanceUnion, EnumClaim, NumberClaim, StringClaim } from "../../domain-model/entities/ClaimInstance";
import { ClaimType, ClaimTypeOptions, ClaimTypesUnion, EnumClaimType } from "../../domain-model/entities/ClaimType";
import { DeviceProfile } from "../../domain-model/entities/DeviceProfile";
import { EnumClaimTypeOption } from "../../domain-model/entities/EnumClaimTypeOption";
import { PasswordCredential } from "../../domain-model/entities/PasswordCredential";
import { SmartLock } from "../../domain-model/entities/SmartLock";
import { TotpCredential } from "../../domain-model/entities/TotpCredential";

// This whole thing was a mistake. 😔
// Should find a better way of mapping things.

abstract class EntityMapperBase<TEntity> {
  map(original: any): BaseExtender<TEntity> {
    return new BaseExtender(original)
  }
}

abstract class ShallowMapperBase<TEntity> {
  abstract map(original: any): TEntity
}

class BaseExtender<TEntity> {
  constructor(
    protected item: TEntity
  ) { }

  get(): TEntity {
    return this.item
  }
}

class AccountExtender extends BaseExtender<Account> {
  constructor(
    item: Account, 
    private passwordCredentialMapper: PasswordCredentialMapper,
    private totpCredentialMapper: TotpCredentialMapper,
    private claimMapper: ClaimInstanceMapper,
    private adminPrivilegeMapper: AdminPrivilegePresetMapper
  ) { super(item) }

  addPassword(instance: any): this {
    this.item.password = this.passwordCredentialMapper.map(instance).get()
    return this
  }

  addTotp(instance: any): this {
    this.item.totp = this.totpCredentialMapper.map(instance).get()
    return this
  }

  addClaims(instances: any[]): this {
    this.item.claims = instances.map(instance => this.claimMapper.map(instance).get())
    return this
  }

  addPrivilegePreset(instance: any): this {
    this.item.privilegePreset = this.adminPrivilegeMapper.map(instance).get()
    return this
  }
}

class PasswordCredentialMapper extends EntityMapperBase<PasswordCredential> {
  override map(original: any): BaseExtender<PasswordCredential> {
    const { salt, hash } = original
    return new BaseExtender(new PasswordCredential(hash, salt))
  }
}

class TotpCredentialMapper extends EntityMapperBase<TotpCredential> {
  override map(original: any): BaseExtender<TotpCredential> {
    const { totpSharedSecret } = original
    return new BaseExtender(new TotpCredential(totpSharedSecret))
  }
}

class AccountMapper extends EntityMapperBase<Account> {
  constructor(
    private mapper: ShallowAccountMapper,
    private passwordCredentialMapper: PasswordCredentialMapper,
    private totpCredentialMapper: TotpCredentialMapper,
    private claimMapper: ClaimInstanceMapper,
    private adminPrivilegePresetMapper: AdminPrivilegePresetMapper
  ) { super() }

  override map(original: any): AccountExtender {
    return new AccountExtender(
      this.mapper.map(original),
      this.passwordCredentialMapper,
      this.totpCredentialMapper,
      this.claimMapper,
      this.adminPrivilegePresetMapper
    )
  }
}

class ShallowAccountMapper extends ShallowMapperBase<Account> {
  map(original: any): Account {
    const { id, username } = original
    return new Account(id, username)
  }
}

class AdminPrivilegePresetExtender extends BaseExtender<AdminPrivilegePreset> {
  constructor(
    item: AdminPrivilegePreset,
    private accountMapper: ShallowAccountMapper
  ) { super(item) }

  addAccounts(accounts: Account[]): this {
    this.item.accounts = accounts.map(account => this.accountMapper.map(account))

    return this
  }
}

class AdminPrivilegePresetMapper extends EntityMapperBase<AdminPrivilegePreset> {
  constructor(
    private accountMapper: ShallowAccountMapper
  ) { super() }

  override map(original: any): AdminPrivilegePresetExtender {
    const { id, name, system, isSuperAdmin, canManageAccounts, canManageLocks } = original
    return new AdminPrivilegePresetExtender(
      new AdminPrivilegePreset(id, name, system, isSuperAdmin, canManageAccounts, canManageLocks),
      this.accountMapper
    )
  }
}

class EnumClaimTypeExtender extends BaseExtender<EnumClaimType> {
  constructor(item: EnumClaimType) { super(item) }

  addOptions(options: EnumClaimTypeOption[]): this {
    this.item.options = options
    return this
  }
}

class ClaimTypeMapper extends EntityMapperBase<ClaimTypesUnion> {
  override map(original: any): EnumClaimTypeExtender | BaseExtender<ClaimTypesUnion> {
    const { id, name, camelCaseName } = original
    const type: ClaimTypeOptions = original.dataType
    
    switch(type) {
      case 'enum':
        return new EnumClaimTypeExtender(new EnumClaimType(id, name, camelCaseName))
      default:
        return new BaseExtender(new ClaimType(id, name, camelCaseName, type))
    }
  }
}

class EnumClaimTypeOptionsMapper extends EntityMapperBase<EnumClaimTypeOption> {
  override map(original: any): BaseExtender<EnumClaimTypeOption> {
    const { id, value } = original
    return new BaseExtender(new EnumClaimTypeOption(id, value))
  }
}

class ClaimInstanceExtender extends BaseExtender<ClaimInstanceUnion> {
  constructor(
    item: ClaimInstanceUnion,
    private claimTypeMapper: ClaimTypeMapper
  ) { super(item) }

  addType(type: ClaimType) {
    this.item.type = this.claimTypeMapper.map(type).get()
    return this
  }
}

class ClaimInstanceMapper extends EntityMapperBase<ClaimInstanceUnion> {
  constructor(
    private claimTypeMapper: ClaimTypeMapper
  ) { super() }

  override map(original: any): ClaimInstanceExtender {
    const { id } = original
    const type: ClaimType = original.ClaimType
    const value = original[`${type.dataType}Value`]

    let claim: ClaimInstanceUnion
    switch(type.dataType) {
      case 'string':
        claim = new StringClaim(id, type, value)
        break
      case 'boolean':
        claim = new BooleanClaim(id, type, value)
        break
      case 'number':
        claim = new NumberClaim(id, type, value)
        break
      case 'enum':
        claim = new EnumClaim(id, type, value)
        break
      default:
        throw new NotImplementedError()
    }

    return new ClaimInstanceExtender(claim, this.claimTypeMapper)
  }
}

class SmartLockExtender extends BaseExtender<SmartLock> {
  constructor(
    item: SmartLock,
    private deviceProfileMapper: DeviceProfileMapper,
    private shallowAuthorizationRuleMapper: ShallowAuthorizationRuleMapper
  ) { super(item) }

  addDeviceProfile(instance: any): this {
    this.item.device = this.deviceProfileMapper.map(instance).get()
    return this
  }

  addAuthorizationRule(instance: any): this {
    this.item.authorizationRule = this.shallowAuthorizationRuleMapper.map(instance)
    return this
  }
}

class ShallowSmartLockMapper extends ShallowMapperBase<SmartLock> {
  map(original: any): SmartLock {
    const { id, name, wifiSsid, wifiPassword, lockStatus, authorizationRuleArgs } = original
    return new SmartLock(id, name, wifiSsid, wifiPassword, lockStatus, authorizationRuleArgs)
  }
}

class SmartLockMapper extends EntityMapperBase<SmartLock> {
  constructor(
    private deviceProfileMapper: DeviceProfileMapper,
    private shallowAuthorizationRuleMapper: ShallowAuthorizationRuleMapper,
    private mapper: ShallowSmartLockMapper
  ) { super() }

  override map(original: any): SmartLockExtender {
    
    return new SmartLockExtender(
      this.mapper.map(original),
      this.deviceProfileMapper,
      this.shallowAuthorizationRuleMapper
    )
  }
}

class DeviceProfileMapper extends EntityMapperBase<DeviceProfile> {
  override map(original: any): BaseExtender<DeviceProfile> {
    const { id, privateKey, publicKey, macAddress, verified, connectionStatus } = original
    return new BaseExtender(
      new DeviceProfile(id, privateKey, publicKey, macAddress, verified, connectionStatus)
    ) 
  }
}

class AuthorizationRuleExtender extends BaseExtender<AuthorizationRule> {
  constructor(
    item: AuthorizationRule,
    private shallowSmartLockMapper: ShallowSmartLockMapper
  ) { super(item) }

  addSmartLocks(instances: any[]): this {
    this.item.smartLocks = instances.map(this.shallowSmartLockMapper.map)
    return this
  }
}

class ShallowAuthorizationRuleMapper extends ShallowMapperBase<AuthorizationRule> {
  map(original: any): AuthorizationRule {
    const { id, name, savedRule, deployedRule, savedFormSchema, deployedFormSchema } = original

    return new AuthorizationRule(id, name, savedRule, deployedRule, savedFormSchema, deployedFormSchema, savedRule == deployedRule)
  }
}

class AuthorizationRuleMapper extends EntityMapperBase<AuthorizationRule> {
  constructor(
    private mapper: ShallowAuthorizationRuleMapper,
    private shallowSmartLockMapper: ShallowSmartLockMapper
  ) { super() }

  override map(original: any): AuthorizationRuleExtender {
    return new AuthorizationRuleExtender(
      this.mapper.map(original),
      this.shallowSmartLockMapper
    )
  }
}

export { 
  AccountMapper,
  ShallowAccountMapper,
  PasswordCredentialMapper, 
  TotpCredentialMapper, 
  AdminPrivilegePresetMapper,
  EntityMapperBase,
  ClaimTypeMapper,
  EnumClaimTypeOptionsMapper,
  ClaimInstanceMapper,
  SmartLockMapper,
  DeviceProfileMapper,
  AuthorizationRuleMapper,
  ShallowAuthorizationRuleMapper,
  ShallowSmartLockMapper
}