import { NotImplementedError } from "../common/Errors"
import { ClaimInstance } from "../domain-model/entities/ClaimInstance"
import { DeviceProfile } from "../domain-model/entities/DeviceProfile"
import { DeviceMessagingService } from "../domain-model/services/DeviceMessagingService"
import { DigitalSignatureService } from "../domain-model/services/DigitalSignatureService"
import { KeyValueService } from "../domain-model/services/KeyValueService"
import { RulesEngineService } from "../domain-model/services/RulesEngineService"
import { DeviceProfilesRepository } from "../repositories/DeviceProfilesRepository"
import { SmartLocksRepository } from "../repositories/SmartLocksRepository"

class SmartLockUseCases {
  constructor(
    private repository: SmartLocksRepository,
    private devicesRepository: DeviceProfilesRepository,
    private digitalSignatureService: DigitalSignatureService,
    private deviceStatusStore: KeyValueService,
    private lockStatusStore: KeyValueService,
    private rulesEngineService: RulesEngineService,
    private deviceMessagingService: DeviceMessagingService
  ) { }

  create = this.repository.create

  connect = async (smartLockId: string): Promise<DeviceProfile> => {
    const { privateKey, publicKey }  = this.digitalSignatureService.generateKeyPair()

    const smartLock = await this.repository.readById(smartLockId)

    if (!smartLock) throw new NotImplementedError()

    const newDevice = await this.devicesRepository.create({
      privateKey,
      publicKey
    })

    await this.repository.updateDeviceProfileId(smartLock.id, newDevice.id)

    return newDevice
  }

  confirmDevice = async (params: { deviceId: number, macAddress: string }): Promise<DeviceProfile | undefined> => {
    return await this.devicesRepository.update(params.deviceId, {
      verified: true,
      macAddress: params.macAddress 
    })
  }

  ping = async (deviceProfileId: number): Promise<void> => {
    this.deviceStatusStore.set(deviceProfileId.toString(), 'connected')
  }

  sendCommand = async (request: { smartLockId: string, command: string }, claims: ClaimInstance[]) => {
    const smartLock = await this.repository.readByIdIncludeDevice(request.smartLockId)

    if (!smartLock?.rule) throw new NotImplementedError()
    if (!smartLock?.device?.macAddress) throw new NotImplementedError()

    const result = this.rulesEngineService.checkAuthorization(claims, smartLock.rule)

    if (result.success) {
      this.deviceMessagingService.send(smartLock.device, request.command)
    } else {
      if (!result.errorMessage) throw new NotImplementedError()
      throw new Error(result.errorMessage)
    }
  }

  update = this.repository.update
  delete = this.repository.delete
}

export { SmartLockUseCases }