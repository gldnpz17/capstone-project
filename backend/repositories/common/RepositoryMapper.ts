import { Account } from "../../domain-model/entities/Account";
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
  ) { super(item)}

  addPassword(instance: any): this {
    this.item.password = this.passwordCredentialMapper.map(instance).get()
    return this
  }

  addTotp(instance: any): this {
    this.item.totp = this.totpCredentialMapper.map(instance).get()
    return this
  }

  get(): Account {
    return this.item
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

export { AccountMapper, PasswordCredentialMapper, TotpCredentialMapper, EntityMapperBase }