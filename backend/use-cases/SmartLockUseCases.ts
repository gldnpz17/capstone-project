import { NotImplementedError } from "../common/Errors"
import { ApplicationConfiguration } from "../domain-model/common/ApplicationConfiguration"
import { ClaimInstance, ClaimInstanceUnion } from "../domain-model/entities/ClaimInstance"
import { DeviceProfile } from "../domain-model/entities/DeviceProfile"
import { SmartLock } from "../domain-model/entities/SmartLock"
import { DeviceMessagingService } from "../domain-model/services/DeviceMessagingService"
import { DigitalSignatureService } from "../domain-model/services/DigitalSignatureService"
import { KeyValueService } from "../domain-model/services/KeyValueService"
import { RulesEngineService } from "../domain-model/services/RulesEngineService"
import { TransientTokenService } from "../domain-model/services/TransientTokenService"
import { AccountsRepository } from "../repositories/AccountsRepository"
import { DeviceProfilesRepository } from "../repositories/DeviceProfilesRepository"
import { SmartLocksRepository } from "../repositories/SmartLocksRepository"

type ConfirmationToken = {
  tokenId: string
  deviceId: number
}

type DeviceToken = {
  tokenId: string,
  deviceId: number
}

type ConnectResult = {
  deviceId: number,
  serverDomain: string,
  devicePublicKey: string,
  confirmationToken: string
}

type ConfirmationResult = {
  deviceToken: string
}

class SmartLockUseCases {
  constructor(
    private repository: SmartLocksRepository,
    private devicesRepository: DeviceProfilesRepository,
    private accountsRepository: AccountsRepository,
    private digitalSignatureService: DigitalSignatureService,
    private deviceStatusStore: KeyValueService,
    private lockStatusStore: KeyValueService,
    private rulesEngineService: RulesEngineService,
    private deviceMessagingService: DeviceMessagingService,
    private confirmationTokenService: TransientTokenService<ConfirmationToken>,
    private deviceTokenService: TransientTokenService<DeviceToken>,
    private config: ApplicationConfiguration
  ) { }

  create = this.repository.create

  connect = async (smartLockId: string): Promise<ConnectResult> => {
    const { privateKey, publicKey }  = this.digitalSignatureService.generateKeyPair()

    const smartLock = await this.repository.readById(smartLockId)

    if (!smartLock) throw new NotImplementedError()

    const newDevice = await this.devicesRepository.create({
      privateKey,
      publicKey
    })

    await this.repository.updateDeviceProfileId(smartLock.id, newDevice.id)

    const tokenBody = {
      tokenId: Math.random().toString(),
      deviceId: newDevice.id
    }
    const confirmationToken = await this.confirmationTokenService.generateToken(tokenBody, (body) => body.tokenId)

    return {
      deviceId: newDevice.id,
      confirmationToken,
      devicePublicKey: publicKey,
      serverDomain: this.config.serverDomain
    }
  }

  confirmDevice = async (params: { deviceId: number, confirmationToken: string, macAddress: string }): Promise<ConfirmationResult> => {
    const { deviceId } = await this.confirmationTokenService.decodeToken(params.confirmationToken)

    if (deviceId != params.deviceId) throw new NotImplementedError()

    const tokenBody: DeviceToken = {
      tokenId: Math.random().toString(),
      deviceId
    }
    const deviceToken = await this.deviceTokenService.generateToken(tokenBody, body => body.tokenId)

    await this.devicesRepository.update(params.deviceId, {
      verified: true,
      macAddress: params.macAddress,
    })

    return { deviceToken }
  }

  ping = async (deviceProfileId: number): Promise<void> => {
    this.deviceStatusStore.set(deviceProfileId.toString(), 'connected')
  }

  sendCommand = async (request: { smartLockId: string, command: string }, accountId: string) => {
    const smartLock = await this.repository.readByIdIncludeDeviceAndAuthorizationRule(request.smartLockId)

    if (!smartLock?.authorizationRule || !smartLock?.authorizationRuleArgs) throw new NotImplementedError()
    if (!smartLock?.device?.macAddress) throw new NotImplementedError()

    const account = await this.accountsRepository.readByIdIncludeClaims(accountId)

    if (!account?.claims) throw new NotImplementedError()

    const result = this.rulesEngineService.checkAuthorization(
      account.claims, 
      smartLock.authorizationRule.deployedRule, 
      smartLock.authorizationRuleArgs
    )

    if (result.authorized) {
      this.deviceMessagingService.send(smartLock.device, request.command)
    } else {
      if (!result.errorMessage) throw new NotImplementedError()
      throw new Error(result.errorMessage)
    }
  }

  update = this.repository.update

  updateSmartLockRule = async (params: { id: string, ruleId: number, ruleArgs: string }): Promise<void> => {
    const { id, ruleId, ruleArgs } = params
    await this.repository.updateAuthorizationRule(id, { id: ruleId, args: ruleArgs })
  }

  delete = this.repository.delete
}

export { SmartLockUseCases, ConfirmationToken, DeviceToken }