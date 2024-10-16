import * as dotenv from "dotenv";
dotenv.config();

// server
export const PORT = (process.env.PORT || 3333) as number;

// SSL
export const KEY_PATH = process.env.KEY_PATH || "";
export const CERT_PATH = process.env.CERT_PATH || "";
export const SSL_PASS = process.env.SSL_PASS || "";

// DB
export const DB_HOST = process.env.DB_HOST;
export const DB_NAME = process.env.DB_NAME;
export const DB_PORT = process.env.DB_PORT;
export const DB_PASS = process.env.DB_PASS;
export const DB_USER = process.env.DB_USER;

