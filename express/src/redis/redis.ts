import { createClient } from 'redis'
import { logger } from '../logger.js'
import { REDIS_HOST } from '../config.js'

const redisClient = createClient({
  url: REDIS_HOST,
})

redisClient.on('error', err => logger.error('Redis Client Error', err))

await redisClient.connect()

export default redisClient
