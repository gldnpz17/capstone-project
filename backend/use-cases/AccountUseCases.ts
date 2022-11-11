import { NotImplementedError } from '../common/Errors'
import { Account } from '../domain-model/entities/Account'
import { AdminPrivilegePreset } from '../domain-model/entities/AdminPrivilegePreset'
import { ClaimInstance } from '../domain-model/entities/ClaimInstance'
import { ClaimType } from '../domain-model/entities/ClaimType'
import { PasswordService } from '../domain-model/services/PasswordService'
import { TotpService } from '../domain-model/services/TotpService'
import { TransientTokenService } from '../domain-model/services/TransientTokenService'
import { AccountsRepository } from '../repositories/AccountsRepository'
import { ClaimInstancesRepository } from '../repositories/ClaimInstancesRepository'
import { GenericReadAllConfig } from '../repositories/common/GenericCrud'
import { TotpCredentialsRepository } from '../repositories/TotpCredentialsRepository'

class PasswordAuthenticationResult {
  constructor(
    public secondFactorToken: string | null,
    public secondFactorSetupToken: string | null
  ) { }
}

class SecondFactorAuthenticationResult {
  constructor(
    public refreshToken: string
  ) { }
}

class RefreshToken {
  account: {
    id: string,
    username: string
  }

  constructor(account: Account) {
    const { id, username } = account

    this.account = { id, username }
  }
}

type PrivilegePreset = Omit<AdminPrivilegePreset, "accounts">

class AccessToken {
  account: {
    id: string,
    username: string,
    privilegePreset: PrivilegePreset
  }

  constructor(account: Account) {
    const { id, username, privilegePreset } = account

    if (!privilegePreset) throw new NotImplementedError()

    this.account = { id, username, privilegePreset }
  }
}

class SecondFactorToken {
  account: {
    id: string
  }

  constructor(account: Account) {
    const { id } = account
    this.account = { id }
  }
}

class SecondFactorSetupToken {
  account: {
    id: string
  }

  constructor(account: Account) {
    const { id } = account
    this.account = { id }
  }
}

class AccountUseCases {
  constructor(
    private accountsRepository: AccountsRepository,
    private passwordService: PasswordService,
    private totpService: TotpService,
    private secondFactorTokenService: TransientTokenService<SecondFactorToken>,
    private secondFactorSetupTokenService: TransientTokenService<SecondFactorSetupToken>,
    private refreshTokenService: TransientTokenService<RefreshToken>,
    private accessTokenService: TransientTokenService<AccessToken>,
    private claimInstancesRepository: ClaimInstancesRepository
  ) { }

  register = async (account: { username: string, password: string, privilegeId: number }): Promise<Account> => {
    const { salt, hash } = this.passwordService.hash(account.password)

    const { username, privilegeId } = account

    return await this.accountsRepository.create({ 
      username,
      salt, 
      hash,
      privilegeId
    })
  }

  getTotpSecret = () => {
    return this.totpService.generateRandomSecret()
  }

  authenticatePassword = async (credentials: { username: string, password: string }): Promise<PasswordAuthenticationResult> => {
    const account = await this.accountsRepository.readByUsernameIncludePasswordAndTotp(credentials.username)

    if (!account || !account.password) 
      throw new NotImplementedError()

    const { salt, hash } = account.password
    if (!this.passwordService.match({ password: credentials.password, salt, hash })) 
      throw new NotImplementedError()

    if (!account.totp?.totpSharedSecret) {
      const token = await this.secondFactorSetupTokenService.generateToken(new SecondFactorSetupToken(account), token => token.account.id)

      return new PasswordAuthenticationResult(null, token)
    }

    const token = await this.secondFactorTokenService.generateToken(new SecondFactorToken(account), token => token.account.id)

    return new PasswordAuthenticationResult(token, null)
  }

  setupSecondFactor = async (data: { secondFactorSetupToken: string, sharedSecret: string, totp: string } ): Promise<SecondFactorAuthenticationResult> => {
    const { secondFactorSetupToken, sharedSecret, totp } = data

    const { account: { id } } = await this.secondFactorSetupTokenService.decodeToken(secondFactorSetupToken)

    if (!await this.totpService.totpIsValid(sharedSecret, totp))
      throw new NotImplementedError()

    const account = await this.accountsRepository.updateSharedSecret(id, sharedSecret)

    if (!account) throw new NotImplementedError()

    const token = await this.refreshTokenService.generateToken(new RefreshToken(account), token => token.account.id)

    return new SecondFactorAuthenticationResult(token)
  }

  authenticateSecondFactor = async (credentials: { secondFactorToken: string, totp: string }): Promise<SecondFactorAuthenticationResult> => {
    const { account: { id } } = await this.secondFactorTokenService.decodeToken(credentials.secondFactorToken)

    const account = await this.accountsRepository.readByIdIncludeTotp(id)

    if (!account || !account.totp) throw new NotImplementedError()

    if (!await this.totpService.totpIsValid(account.totp.totpSharedSecret, credentials.totp)) 
      throw new NotImplementedError()

    const token = await this.refreshTokenService.generateToken(new RefreshToken(account), token => token.account.id)

    return new SecondFactorAuthenticationResult(token)
  }

  getAccessToken = async (rawRefreshToken: string): Promise<AccessToken> => {
    const { account: { id } } = await this.refreshTokenService.decodeToken(rawRefreshToken)

    const account = await this.accountsRepository.readByIdIncludeAdminPrivilegePreset(id)

    if (!account) throw new NotImplementedError()

    return new AccessToken(account)
  }

  addClaim = this.claimInstancesRepository.create

  updateClaim = async (id: number, value: string): Promise<ClaimInstance | undefined> => {
    const claimInstance = await this.claimInstancesRepository.readByIdIncludeType(id)

    return await this.claimInstancesRepository.update(id , {
      [`${claimInstance.type.dataType}Value`]: value
    })
  }

  deleteClaim = this.claimInstancesRepository.delete

  readByIdIncludeClaims = this.accountsRepository.readByIdIncludeClaims

  readAll = this.accountsRepository.readAll

  readById = this.accountsRepository.readById

  delete = this.accountsRepository.delete
}

export { AccountUseCases, SecondFactorToken, SecondFactorSetupToken, RefreshToken, AccessToken }