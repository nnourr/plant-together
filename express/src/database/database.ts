import { DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_USER } from "../config.js";
import postgres from 'postgres'
import prexit from 'prexit'

const sql = postgres({
  user: DB_USER,
  pass: DB_PASS,
  host: DB_HOST,
  database: DB_NAME, 
  port: (DB_PORT || 5432) as number,     
  idle_timeout: 20,
  max_lifetime: 60 * 30            
});

// Test the connection
const alive = await sql`SELECT NOW()`

export default sql;

prexit(async () => {
  await sql.end({ timeout: 5 })
})
