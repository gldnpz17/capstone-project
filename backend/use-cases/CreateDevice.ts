import Esp32LockDevice from "../domain-model/entities/Esp32LockDevice"
import LockDevice from "../domain-model/entities/LockDevice"
import CsprngService from "../domain-model/services/CsprngService"
import EncryptionService from "../domain-model/services/EncryptionService"
import MessageBrokerService from "../domain-model/services/MessageBrokerService"

const CreateDevice = async (rng: CsprngService, broker: MessageBrokerService, encryption: EncryptionService) => {
  const device = new Esp32LockDevice()
  await device.configureBrokerCredential(broker, encryption)
  await device.generatePassword(rng, encryption)
}