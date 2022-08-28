import BrokerCredential from "./BrokerCredential"
import EncryptedData from "./EncryptedData"
import EncryptionService from "../services/EncryptionService"

class EncryptedBrokerCredential {
  username: string
  password: EncryptedData
}

export default EncryptedBrokerCredential