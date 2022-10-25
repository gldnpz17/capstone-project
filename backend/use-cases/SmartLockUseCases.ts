import { NotImplementedError } from "../common/Errors"
import { DeviceProfile } from "../domain-model/entities/DeviceProfile"
import { DigitalSignatureService } from "../domain-model/services/DigitalSignatureService"
import { DeviceProfilesRepository } from "../repositories/DeviceProfilesRepository"
import { SmartLocksRepository } from "../repositories/SmartLocksRepository"

class SmartLockUseCases {
  constructor(
    private repository: SmartLocksRepository,
    private devicesRepository: DeviceProfilesRepository,
    private digitalSignatureService: DigitalSignatureService
  ) { }

  create = this.repository.create

  connect = async (smartLockId: string): Promise<DeviceProfile> => {
    const { privateKey, publicKey }  = this.digitalSignatureService.generateKeyPair()

    const smartLock = await this.repository.readById(smartLockId)

    if (!smartLock) throw new NotImplementedError()

    const newDevice = await this.devicesRepository.create({
      privateKey,
      publicKey,
      smartLockId
    })

    return newDevice
  }

  update = this.repository.update
  delete = this.repository.delete
}

export { SmartLockUseCases }