import { logger } from './logger'
import { objectdb } from './store'
import { MessageSocket } from './network'
import semver from 'semver'
import { Messages,
         Message, HelloMessage, PeersMessage, GetPeersMessage, IHaveObjectMessage, GetObjectMessage, ObjectMessage, ErrorMessage,
         MessageType, HelloMessageType, PeersMessageType, GetPeersMessageType, IHaveObjectMessageType, GetObjectMessageType, ObjectMessageType, ErrorMessageType } from './message'
import { peerManager } from './peermanager'
import { canonicalize } from 'json-canonicalize'

const VERSION = '0.8.0'
const NAME = 'Malibu (pset2)'

export class Peer {
  active: boolean = false
  socket: MessageSocket
  handshakeCompleted: boolean = false

  async sendHello() {
    this.sendMessage({
      type: 'hello',
      version: VERSION,
      agent: NAME
    })
  }
  async sendGetPeers() {
    this.sendMessage({
      type: 'getpeers'
    })
  }
  async sendIHaveObject(object: string) {
    this.sendMessage({
      type: 'ihaveobject',
      objectid: object
    })
  }
  async sendGetObject(object: string) {
    this.sendMessage({
      type: 'getobject',
      objectid: object
    })
  }
  async sendObject(object: string) {
    //wrong message. just temp for now
    this.sendMessage({
      type: 'getobject',
      objectid: object
    })
  }
  async sendPeers() {
    this.sendMessage({
      type: 'peers',
      peers: [...peerManager.knownPeers]
    })
  }
  async sendError(err: string) {
    this.sendMessage({
      type: 'error',
      message: err
    })
  }
  sendMessage(obj: object) {
    const message: string = canonicalize(obj)

    this.debug(`Sending message: ${message}`)
    this.socket.sendMessage(message)
  }
  async fatalError(err: string) {
    await this.sendError(err)
    this.warn(`Peer error: ${err}`)
    this.active = false
    this.socket.end()
  }
  async onConnect() {
    this.active = true
    await this.sendHello()
    await this.sendGetPeers()
  }
  async onMessage(message: string) {
    this.debug(`Message arrival: ${message}`)

    let msg: object

    try {
      msg = JSON.parse(message)
      this.debug(`Parsed message into: ${JSON.stringify(msg)}`)
    }
    catch {
      return await this.fatalError(`Failed to parse incoming message as JSON: ${message}`)
    }
    if (!Message.guard(msg)) {
      return await this.fatalError(`The received message does not match one of the known message formats: ${message}`)
    }
    // if (!this.handshakeCompleted) {
    //   if (HelloMessage.guard(msg)) {
    //     return this.onMessageHello(msg)
    //   }
    //   return await this.fatalError(`Received message ${message} prior to "hello"`)
    // }
    Message.match(
      async () => {
        return await this.fatalError(`Received a second "hello" message, even though handshake is completed`)
      },
      this.onMessageGetPeers.bind(this),
      this.onMessagePeers.bind(this),
      this.onMessageIHaveObject.bind(this),
      this.onMessageGetObject.bind(this),
      this.onMessageObject.bind(this),
      this.onMessageError.bind(this),
    )(msg)
  }
  async onMessageHello(msg: HelloMessageType) {
    if (!semver.satisfies(msg.version, `^${VERSION}`)) {
      return await this.fatalError(`You sent an incorrect version (${msg.version}), which is not compatible with this node's version ${VERSION}.`)
    }
    this.info(`Handshake completed. Remote peer running ${msg.agent} at protocol version ${msg.version}`)
    this.handshakeCompleted = true
  }
  async onMessagePeers(msg: PeersMessageType) {
    for (const peer of msg.peers) {
      this.info(`Remote party reports knowledge of peer ${peer}`)

      peerManager.peerDiscovered(peer)
    }
  }
  async onMessageGetPeers(msg: GetPeersMessageType) {
    this.info(`Remote party is requesting peers. Sharing.`)
    await this.sendPeers()
  }
  async onMessageIHaveObject(msg: IHaveObjectMessageType) {
    this.info(`Remote party is notifies node of a new message with id ${msg.objectid}`)
    await this.sendGetObject(msg.objectid)
  }
  async onMessageGetObject(msg: GetObjectMessageType) {
    this.info(`GETOBJECT${msg.objectid}`)
    // await this.sendIHaveObject()
  }
  async onMessageObject(msg: ObjectMessageType) {
    this.info(`OBJECT${msg.object.nonce}`)
    //hash the object with the function
    // update value in objectdb
  }
  async onMessageError(msg: ErrorMessageType) {
    this.warn(`Peer reported error: ${msg.error}`)
  }
  log(level: string, message: string) {
    logger.log(level, `[peer ${this.socket.peerAddr}:${this.socket.netSocket.remotePort}] ${message}`)
  }
  warn(message: string) {
    this.log('warn', message)
  }
  info(message: string) {
    this.log('info', message)
  }
  debug(message: string) {
    this.log('debug', message)
  }
  constructor(socket: MessageSocket) {
    this.socket = socket

    socket.netSocket.on('connect', this.onConnect.bind(this))
    socket.netSocket.on('error', err => {
      this.warn(`Socket error: ${err}`)
    })
    socket.on('message', this.onMessage.bind(this))
  }
}
