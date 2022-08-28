import BrokerCredential from "../data-classes/BrokerCredential";
import EncryptedBrokerCredential from "../data-classes/EncryptedBrokerCredential";
import EncryptedData from "../data-classes/EncryptedData";
import LockActions from "../enums/LockActions";
import CsprngService from "../services/CsprngService";
import EncryptionService from "../services/EncryptionService";
import MessageBrokerService from "../services/MessageBrokerService";
import LockDevice from "./LockDevice";

class Esp32LockDevice extends LockDevice {
  brokerCredential: EncryptedBrokerCredential
  adminPassword: EncryptedData

  async generatePassword(rng: CsprngService, encryption: EncryptionService): Promise<void> {
    const password = await rng.generateRandomString(16)

    const encrypted = new EncryptedData()
    await encrypted.SetData(password, encryption)

    this.adminPassword = encrypted
  }

  async configureBrokerCredential(broker: MessageBrokerService, encryption: EncryptionService): Promise<void> {
    const credential = await broker.createLockControllerAccount(this.identifier)

    const password = new EncryptedData()
    await password.SetData(credential.password, encryption)

    this.brokerCredential = new EncryptedBrokerCredential()
    this.brokerCredential.username = credential.username
    this.brokerCredential.password = password
  }

  performAction(action: LockActions): void { }
}

export default Esp32LockDevice