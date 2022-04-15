import { logger } from './logger'
import { Network } from './network'


const BIND_PORT = 18018
const BIND_IP = '149.28.219.230'

logger.info(`Malibu - The Birdiest Node`)
logger.info(`Sam Liokumovich - samliok@stanford.edu`)


const network = new Network()
network.init(BIND_PORT, BIND_IP)
