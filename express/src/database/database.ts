import { DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_USER } from "../config.js";
import postgres, { type Sql } from 'postgres'
import prexit from 'prexit'
import { PostgresMock } from "pgmock";

interface SqlWithMock extends Sql {
  mock?: PostgresMock;
}

// database.ts
let sql: SqlWithMock = {} as SqlWithMock;


if (process.env.NODE_ENV === 'test') {
  const mock = await PostgresMock.create()
  const connectionString = await mock.listen(6969)
  sql = postgres(connectionString)
  sql.mock = mock
} else {
  sql = postgres({
    user: DB_USER,
    pass: DB_PASS,
    host: DB_HOST,
    database: DB_NAME,
    port: (DB_PORT || 5432) as number,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  });
}

// TODO: Replace with db migrations
await sql`
CREATE TABLE IF NOT EXISTS room (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);
`
// TODO: Replace with db migrations
await sql`
CREATE TABLE IF NOT EXISTS document (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  room_id TEXT NOT NULL REFERENCES room(id)
);
`
await sql`
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL
);
`
await sql`
  ALTER TABLE IF EXISTS room
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS owner_id TEXT,
  DROP CONSTRAINT IF EXISTS room_owner_id_fkey,
  DROP CONSTRAINT IF EXISTS unique_owner_id_name,
  ADD CONSTRAINT unique_owner_id_name UNIQUE (name, owner_id);
`

await sql`
  UPDATE room SET owner_id = '00000000-0000-0000-0000-000000000000' WHERE owner_id IS NULL;
`
await sql`
  ALTER TABLE IF EXISTS room
  ALTER COLUMN owner_id SET NOT NULL;
`
await sql`
CREATE TABLE IF NOT EXISTS room_participant (
  room_id TEXT NOT NULL REFERENCES room(id),
  user_id TEXT NOT NULL,
  PRIMARY KEY (room_id, user_id)
);
`
await sql`
  ALTER TABLE IF EXISTS room_participant
  DROP CONSTRAINT IF EXISTS room_participant_user_id_fkey,
  DROP COLUMN IF EXISTS owner_id;
`

// Test the connection
const alive = await sql`SELECT NOW()`

export default sql;

prexit(async () => {
  await sql.end({ timeout: 5 })
})
