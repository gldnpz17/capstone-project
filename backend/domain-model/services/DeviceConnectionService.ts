import { NotImplementedError } from "../../common/Errors"
import { wrapAsyncHandler } from "../../presentation/common/ExpressUtils"
import { LockCommand } from "../entities/SmartLock"
import { DeviceRegistrationService } from "./DeviceRegistrationService"
import { KeyValueService } from "./KeyValueService"
import { Express } from "express"
import { JwtTransientTokenService } from "./TransientTokenService"
import { DeviceToken } from "../../use-cases/SmartLockUseCases"

type DeviceStatus = 'connected' | 'disconnected' | 'unconnected'

class Device {
  constructor(
    private profileId: string, 
    private connection: ConnectionStrategyBase,
    private statusService: KeyValueService
  ) { }

  setStatus = (status: DeviceStatus) => this.statusService.set(this.profileId, status)
  getStatus = (): DeviceStatus => (this.statusService.get(this.profileId)) as DeviceStatus ?? 'unconnected'
  
  sendCommand = (command: LockCommand) => this.connection.sendCommand(this.profileId, command)
}

type ProposalEvent = {
  macAddress: string
}

type ProposalVerificationEvent = {
  id: string
}

type VerificationTokenEvent = {
  verificationToken: string
}

type DeviceTokenReply = {
  deviceToken: string | null
}

type CommandEvent = {
  profileId: string
  command: LockCommand
}

type SyncCommandEvent = {
  profileId: string
}

type CommandReply = {
  command: LockCommand
}

type PingEvent = {
  profileId: string
}

type Unsubscribe = () => void

interface EventHandler<TEvent, TReply> {
  (event: TEvent): Promise<TReply>
}

interface WaitCondition<TEvent> {
  (event: TEvent): boolean
}

class Event<TEvent> {
  private handlers: Record<number, EventHandler<TEvent, void>> = {}

  addHandler = (handler: EventHandler<TEvent, void>): Unsubscribe => {
    const id = Math.random()
    this.handlers[id] = handler

    return () => delete this.handlers[id]
  }

  publishAsync = async (event: TEvent): Promise<void> => {
    const handlerFunctions = Object.keys(this.handlers).map(id => this.handlers[id])

    await Promise.all(handlerFunctions.map(handle => handle(event)))
  }

  waitForEvent = async (condition: WaitCondition<TEvent>): Promise<TEvent> => {
    const resolveOnEvent = (resolve: (event: TEvent) => void) => {
      const unsubscribe = this.addHandler(async (event: TEvent): Promise<void> => {
        if (condition(event) == false)

        resolve(event)
        unsubscribe()
      })
    }

    return new Promise(resolve => resolveOnEvent(resolve))
  }
}

class ReplyableEvent<TEvent, TReply> {
  private handler: EventHandler<TEvent, TReply> | null

  addHandler = (handler: EventHandler<TEvent, TReply>): Unsubscribe => {
    this.handler = handler
    return () => this.handler = null
  }

  publishAsync = async (event: TEvent): Promise<TReply> => {
    if (this.handler == null) throw new NotImplementedError()

    return await this.handler(event)
  }
}

abstract class ConnectionStrategyBase {
  protected proposalEvent = new Event<ProposalEvent>()
  protected proposalVerificationEvent = new Event<ProposalVerificationEvent>()
  protected verificationTokenEvent = new ReplyableEvent<VerificationTokenEvent, DeviceTokenReply>()
  protected commandEvent = new Event<CommandEvent>()
  protected syncCommandEvent = new ReplyableEvent<SyncCommandEvent, CommandReply>()
  protected pingEvent = new Event<PingEvent>()

  constructor (
    private deviceTokenService: JwtTransientTokenService<DeviceToken>
  ) { }

  onProposal = (handler: EventHandler<ProposalEvent, void>) => this.proposalEvent.addHandler(handler)
  onVerificationToken = (handler: EventHandler<VerificationTokenEvent, DeviceTokenReply>) => this.verificationTokenEvent.addHandler(handler)
  onSyncCommand = (handler: EventHandler<SyncCommandEvent, CommandReply>) => this.syncCommandEvent.addHandler(handler)
  onPing = (handler: EventHandler<PingEvent, void>) => this.pingEvent.addHandler(handler)

  verifyProposal = (id: string): Promise<void> => this.proposalVerificationEvent.publishAsync({ id })
  sendCommand = (deviceId: string, command: LockCommand) => this.commandEvent.publishAsync({ profileId: deviceId, command })

  protected authorizeDevice = async (authorization: string | undefined, deviceId: string) => {
    if (!authorization) throw new NotImplementedError()

    const [_, deviceToken] = authorization.split(' ')
    const { deviceId: tokenDeviceId } = await this.deviceTokenService.decodeToken(deviceToken)

    if (tokenDeviceId != deviceId) throw new NotImplementedError()
  }
}

class HttpConnectionStrategy extends ConnectionStrategyBase {
  constructor(
    private app: Express,
    deviceTokenService: JwtTransientTokenService<DeviceToken>
  ) {
    super(deviceTokenService)
    this.initializeExpress()
  }

  private initializeExpress = () => {
    this.app.post('/devices/propose', wrapAsyncHandler(async (req, res) => {
      const { macAddress } = req.body
  
      const result = await this.proposalEvent.publishAsync({ macAddress })
  
      res.status(200).json(result)
    }))

    this.app.get('/devices/:id/proposal-status', wrapAsyncHandler(async (req, res) => {
      const { id } = req.params
  
      const status = await this.proposalVerificationEvent.waitForEvent(e => e.id == id)
  
      res.status(200).send(status)
    }))

    this.app.post('/auth/get-device-token', wrapAsyncHandler(async (req, res) => {
      const { verificationToken } = req.body
  
      const deviceToken = await this.verificationTokenEvent.publishAsync({ verificationToken })
  
      res.send(deviceToken)
    }))

    this.app.get('/devices/:id/messages/subscribe', wrapAsyncHandler(async (req, res) => {
      const { id } = req.params
      const { authorization } = req.headers
      await this.authorizeDevice(authorization, id)
  
      const message = await this.commandEvent.waitForEvent(e => e.profileId == id)
  
      res.status(200).setHeader('Content-Type', 'text/plain').send(message)
    }))

    this.app.get('/devices/:id/sync-command', wrapAsyncHandler(async (req, res) => {
      const { id } = req.params
      const { authorization } = req.headers
      await this.authorizeDevice(authorization, id)
  
      const command = await this.syncCommandEvent.publishAsync({ profileId: id })
  
      res.status(200).setHeader('Content-Type', 'text/plain').send(command)
    }))

    this.app.post('/devices/:id/ping', wrapAsyncHandler(async (req, res) => {
      const { id } = req.params
      const { authorization } = req.headers
      await this.authorizeDevice(authorization, id)
  
      await this.pingEvent.publishAsync({ profileId: id })
  
      console.log(`Ping received from ${id}.`)
  
      res.sendStatus(200)
    }))
  }
}

class DeviceConnectionService {
  constructor(
    private statusService: KeyValueService,
    private connectionStrategy: ConnectionStrategyBase,
  ) { }

  getDevice = (profileId: string) => {
    return new Device(profileId, this.connectionStrategy, this.statusService)
  }

  onProposal = this.connectionStrategy.onProposal
  onVerificationToken = this.connectionStrategy.onVerificationToken
  onSyncCommand = this.connectionStrategy.onSyncCommand
  onPing = this.connectionStrategy.onPing
}

export {
  HttpConnectionStrategy,
  DeviceConnectionService
}