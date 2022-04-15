import { db } from './store'
import { logger } from './logger'
import isValidHostname from 'is-valid-hostname'

const BOOTSTRAP_PEERS = [
  '149.28.220.241:18018',
  '149.28.204.235:18018',
]
// const BOOTSTRAP_PEERS = [
//   '149.28.219.230:18018'
// ]
class PeerManager {
  knownPeers: Set<string> = new Set()

  async load() {
    try {
      this.knownPeers = new Set(await db.get('peers'))
      logger.debug(`Loaded known peers: ${[...this.knownPeers]}`)
    }
    catch {
      logger.info(`Initializing peers database`)
      this.knownPeers = new Set(BOOTSTRAP_PEERS)
      await this.store()
    }
  }
  async store() {
    await db.put('peers', [...this.knownPeers])
  }
  peerDiscovered(peer: string) {
    const peerParts = peer.split(':')
    if (peerParts.length != 2) {
      logger.warn(`Remote party reported knowledge of invalid peer ${peer}, which is not in the host:port format; skipping`)
      return
    }
    const [host, portStr] = peerParts
    const port = +portStr

    if (!(port >= 0 && port <= 65535)) {
      logger.warn(`Remote party reported knowledge of peer ${peer} with invalid port number ${port}`)
      return
    }
    if (!isValidHostname(host)) {
      logger.warn(`Remote party reported knowledge of invalid peer ${peer}; skipping`)
      return
    }

    this.knownPeers.add(peer)
    this.store() // intentionally delayed await
  }
}

export const peerManager = new PeerManager()
