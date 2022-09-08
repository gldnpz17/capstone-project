import { Account } from "../../domain-model/entities/Account";
import { AdminPrivilegePreset } from "../../domain-model/entities/AdminPrivilegePreset";
import { ClaimType, ClaimTypeOptions, ClaimTypesUnion, EnumClaimType } from "../../domain-model/entities/ClaimType";
import { EnumClaimTypeOption } from "../../domain-model/entities/EnumClaimTypeOption";
import { PasswordCredential } from "../../domain-model/entities/PasswordCredential";
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
    private totpCredentialMapper: TotpCredentialMapper
  ) { super(item) }

  addPassword(instance: any): this {
    this.item.password = this.passwordCredentialMapper.map(instance).get()
    return this
  }

  addTotp(instance: any): this {
    this.item.totp = this.totpCredentialMapper.map(instance).get()
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
    private totpCredentialMapper: TotpCredentialMapper
  ) { super() }

  override map(original: any): AccountExtender {
    const { id, username } = original
    return new AccountExtender(
      new Account(id, username),
      this.passwordCredentialMapper,
      this.totpCredentialMapper
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

export { 
  AccountMapper, 
  PasswordCredentialMapper, 
  TotpCredentialMapper, 
  AdminPrivilegePresetMapper,
  EntityMapperBase,
  ClaimTypeMapper,
  EnumClaimTypeOptionsMapper
}