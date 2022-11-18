import { v4 as uuidv4 } from 'uuid';
import { TransientTokenService } from './TransientTokenService';

class VerificationToken {
  constructor(
    public deviceId: string
  ) { }
}

type ProposedDevice = {
  id: string,
  macAddress: string,
  verificationToken: string
}

interface DeviceRegistrationService {
  propose(macAddress: string): Promise<ProposedDevice>
  verify(id: string): ProposedDevice | null
  waitForVerificationStatus(id: string): Promise<boolean | null>
}

type DeviceProposal = {
  device: ProposedDevice,
  timeout: NodeJS.Timeout
}

type VerificationListener = (verified: boolean) => void

class InMemoryDeviceRegistrationService implements DeviceRegistrationService {
  proposals: Record<string, DeviceProposal> = {}
  verificationListeners: Record<string, Record<number, VerificationListener>> = {}

  constructor(
    private proposalLifespan: number = 30 * 1000,
    private verificationTokenService: TransientTokenService<VerificationToken>
  ) { }

  propose = async (macAddress: string) => {
    const id = uuidv4()

    const verificationToken = await this.verificationTokenService.generateToken(
      new VerificationToken(id),
      token => token.deviceId
    )

    const device = { id, macAddress, verificationToken }

    const timeout = setTimeout(() => {
      const listeners = this.verificationListeners[device.id]
      for (const listenerId in listeners) {
        const notify = listeners[listenerId]
        notify(false)
      }

      delete this.proposals[device.id]
    }, this.proposalLifespan)

    const proposal = { device, timeout }

    this.proposals[device.id] = proposal

    return device
  }

  verify = (deviceId: string) => {
    const proposal = this.proposals[deviceId]

    if (!proposal) return null

    clearTimeout(proposal.timeout)

    const listeners = this.verificationListeners[deviceId]
    for (const listenerId in listeners) {
      const notify = listeners[listenerId]
      notify(true)
    }

    const device = proposal.device
    delete this.proposals[deviceId]

    return device
  }

  waitForVerificationStatus = (deviceId: string): Promise<boolean | null> => {
    return new Promise(resolve => {
      if (!this.proposals[deviceId]) {
        resolve(null)
        return
      }
      
      const listenerId = Math.random()
      const listener = (verified: boolean) => {
        delete this.verificationListeners[deviceId][listenerId]
        resolve(verified)
      }

      if (!this.verificationListeners[deviceId]) this.verificationListeners[deviceId] = {}

      this.verificationListeners[deviceId][listenerId] = listener
    })
  }
}

export { 
  DeviceRegistrationService,
  InMemoryDeviceRegistrationService,
  VerificationToken
}