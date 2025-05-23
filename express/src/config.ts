import * as dotenv from 'dotenv'
dotenv.config()

// server
export const PORT = (process.env.PORT || 3333) as number
export const ROOM_SIGNATURE_SECRET = process.env.ROOM_SIGNATURE_SECRET

export const CORS_ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGIN || '*'

// DB
export const DB_HOST = process.env.DB_HOST
export const DB_NAME = process.env.DB_NAME
export const DB_PORT = process.env.DB_PORT
export const DB_PASS = process.env.DB_PASS
export const DB_USER = process.env.DB_USER

// Redis
export const REDIS_HOST = process.env.REDIS_HOST
