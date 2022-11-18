import { NotImplementedError } from "../common/Errors"
import { ApplicationConfiguration } from "../domain-model/common/ApplicationConfiguration"
import { ClaimInstance, ClaimInstanceUnion } from "../domain-model/entities/ClaimInstance"
import { DeviceProfile } from "../domain-model/entities/DeviceProfile"
import { SmartLock } from "../domain-model/entities/SmartLock"
import { DeviceMessagingService } from "../domain-model/services/DeviceMessagingService"
import { DeviceRegistrationService, VerificationToken } from "../domain-model/services/DeviceRegistrationService"
import { DigitalSignatureService } from "../domain-model/services/DigitalSignatureService"
import { KeyValueService } from "../domain-model/services/KeyValueService"
import { RulesEngineService } from "../domain-model/services/RulesEngineService"
import { TransientTokenService } from "../domain-model/services/TransientTokenService"
import { AccountsRepository } from "../repositories/AccountsRepository"
import { DeviceProfilesRepository } from "../repositories/DeviceProfilesRepository"
import { SmartLocksRepository } from "../repositories/SmartLocksRepository"
import { v4 as uuidv4 } from 'uuid';

type DeviceToken = {
  tokenId: string,
  deviceId: string
}

type DeviceVerificationResult = {
  success: boolean
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
    private verificationTokenService: TransientTokenService<VerificationToken>,
    private deviceTokenService: TransientTokenService<DeviceToken>,
    private config: ApplicationConfiguration,
    private deviceRegistrationService: DeviceRegistrationService
  ) { }

  create = this.repository.create

  propose = this.deviceRegistrationService.propose

  verifyDevice = async (params: { smartLockId: string, deviceId: string }): Promise<DeviceVerificationResult> => {
    const device = this.deviceRegistrationService.verify(params.deviceId)

    if (!device) return { success: false }

    const { privateKey, publicKey } = this.digitalSignatureService.generateKeyPair()

    await this.devicesRepository.create({
      id: device.id,
      privateKey,
      publicKey,
      macAddress: device.macAddress
    })

    await this.repository.updateDeviceProfileId(params.smartLockId, params.deviceId)

    return { success: true }
  }

  getDeviceToken = async (rawVerificationToken: string): Promise<string | null> => {
    const verificationToken = await this.verificationTokenService.decodeToken(rawVerificationToken)

    const device = await this.devicesRepository.readByIdIncludeSmartLock(verificationToken.deviceId)

    if (!device?.smartLock) return null

    return await this.deviceTokenService.generateToken({ tokenId: uuidv4(), deviceId: device.id }, token => token.tokenId)
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

export { SmartLockUseCases, DeviceToken }