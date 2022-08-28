import BrokerCredential from "../data-classes/BrokerCredential"

interface MessageBrokerService {
  createLockControllerAccount(identifier: number): Promise<BrokerCredential>
  sendMessage(topic: string, message: string): Promise<void>
  subscribe(topic: string, callback: (message: string) => void): Promise<void>
}

export default MessageBrokerService