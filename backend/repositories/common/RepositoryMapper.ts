import { NotImplementedError } from "../../common/Errors";
import { Account } from "../../domain-model/entities/Account";
import { AdminPrivilegePreset } from "../../domain-model/entities/AdminPrivilegePreset";
import { BooleanClaim, ClaimInstance, ClaimInstanceUnion, EnumClaim, NumberClaim, StringClaim } from "../../domain-model/entities/ClaimInstance";
import { ClaimType, ClaimTypeOptions, ClaimTypesUnion, EnumClaimType } from "../../domain-model/entities/ClaimType";
import { DeviceProfile } from "../../domain-model/entities/DeviceProfile";
import { EnumClaimTypeOption } from "../../domain-model/entities/EnumClaimTypeOption";
import { PasswordCredential } from "../../domain-model/entities/PasswordCredential";
import { SmartLock } from "../../domain-model/entities/SmartLock";
import { TotpCredential } from "../../domain-model/entities/TotpCredential";

abstract class EntityMapperBase<TEntity> {
  map(original: any): BaseExtender<TEntity> {
    return new BaseExtender(original)
  }
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
    private claimMapper: ClaimInstanceMapper
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
    private passwordCredentialMapper: PasswordCredentialMapper,
    private totpCredentialMapper: TotpCredentialMapper,
    private claimMapper: ClaimInstanceMapper
  ) { super() }

  override map(original: any): AccountExtender {
    const { id, username } = original
    return new AccountExtender(
      new Account(id, username),
      this.passwordCredentialMapper,
      this.totpCredentialMapper,
      this.claimMapper
    )
  }
}

class AdminPrivilegePresetExtender extends BaseExtender<AdminPrivilegePreset> {
  constructor(
    item: AdminPrivilegePreset,
    private accountMapper: AccountMapper
  ) { super(item) }

  addAccounts(accounts: Account[]): this {
    this.item.accounts = accounts.map(account => this.accountMapper.map(account).get())

    return this
  }
}

class AdminPrivilegePresetMapper extends EntityMapperBase<AdminPrivilegePreset> {
  constructor(
    private accountMapper: AccountMapper
  ) { super() }

  override map(original: any): AdminPrivilegePresetExtender {
    const { id, name, system, canManageAccounts, canManageLocks } = original
    return new AdminPrivilegePresetExtender(
      new AdminPrivilegePreset(id, name, system, canManageAccounts, canManageLocks),
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
    const { id, name } = original
    const type: ClaimTypeOptions = original.dataType
    
    switch(type) {
      case 'enum':
        return new EnumClaimTypeExtender(new EnumClaimType(id, name))
      default:
        return new BaseExtender(new ClaimType(id, name, type))
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

class SmartLockMapper extends EntityMapperBase<SmartLock> {
  override map(original: any): BaseExtender<SmartLock> {
    const { id, name, wifiSsid, wifiPassword, lockStatus } = original
    return new BaseExtender(
      new SmartLock(id, name, wifiSsid, wifiPassword, lockStatus)
    )
  }
}

class DeviceProfileMapper extends EntityMapperBase<DeviceProfile> {
  override map(original: any): BaseExtender<DeviceProfile> {
    const { id, privateKey, publicKey, connectionStatus } = original
    return new BaseExtender(
      new DeviceProfile(id, privateKey, publicKey, connectionStatus)
    ) 
  }
}

export { 
  AccountMapper, 
  PasswordCredentialMapper, 
  TotpCredentialMapper, 
  AdminPrivilegePresetMapper,
  EntityMapperBase,
  ClaimTypeMapper,
  EnumClaimTypeOptionsMapper,
  ClaimInstanceMapper,
  SmartLockMapper,
  DeviceProfileMapper
}